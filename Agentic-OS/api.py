#!/usr/bin/env python3
"""Agentic OS API Proxy — serves kanban data and idea inbox as JSON."""
import json
import subprocess
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8642

def run(cmd):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        return r.stdout.strip(), r.returncode
    except Exception as e:
        return str(e), 1

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')

        if path == '/api/kanban':
            self._json(self._kanban())
        elif path == '/api/inbox':
            self._json(self._inbox())
        elif path == '/api/cron':
            self._json(self._cron())
        elif path == '/api/stats':
            self._json(self._stats())
        elif path == '/api/obsidian':
            self._json(self._obsidian_index())
        elif path == '/api/galaxy':
            self._json(self._galaxy())
        elif path == '' or path == '/':
            self._serve_dashboard()
        elif path == '/memory-galaxy.html':
            self._serve_static('memory-galaxy.html', 'text/html; charset=utf-8')
        else:
            self.send_error(404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b''

        if path == '/api/idea':
            data = json.loads(body) if body else {}
            result = self._add_idea(data.get('text', ''))
            self._json(result)
        elif path == '/api/kanban/create':
            data = json.loads(body) if body else {}
            result = self._create_task(data)
            self._json(result)
        else:
            self.send_error(404)

    def _json(self, data):
        body = json.dumps(data, default=str).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_dashboard(self):
        html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
        try:
            with open(html_path, 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self.send_error(404, 'index.html not found')

    def _serve_static(self, filename, content_type):
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
        try:
            with open(file_path, 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self.send_error(404, filename + ' not found')

    def _kanban(self):
        out, rc = run(['hermes', 'kanban', 'list', '--json'])
        if rc == 0 and out:
            try:
                return json.loads(out)
            except json.JSONDecodeError:
                return []
        return []

    def _inbox(self):
        inbox_path = os.path.expanduser('~/obsidian-vault/Idea Inbox.md')
        try:
            with open(inbox_path) as f:
                return {'content': f.read(), 'path': inbox_path}
        except FileNotFoundError:
            return {'content': '# Idea Inbox\n\nNo ideas yet.', 'path': inbox_path}

    def _cron(self):
        out, rc = run(['hermes', 'cron', 'list', '--json'])
        if rc == 0 and out:
            try:
                return json.loads(out)
            except json.JSONDecodeError:
                return []
        return []

    def _stats(self):
        kanban = self._kanban()
        stats = {'total': len(kanban), 'by_status': {}, 'by_priority': {}}
        for t in kanban:
            s = t.get('status', 'unknown')
            p = str(t.get('priority', 0))
            stats['by_status'][s] = stats['by_status'].get(s, 0) + 1
            stats['by_priority'][p] = stats['by_priority'].get(p, 0) + 1
        return stats

    def _obsidian_index(self):
        vault = os.path.expanduser('~/obsidian-vault')
        files = []
        for root, dirs, filenames in os.walk(vault):
            for fn in filenames:
                if fn.endswith('.md'):
                    rel = os.path.relpath(os.path.join(root, fn), vault)
                    files.append(rel)
        return {'vault': vault, 'files': sorted(files)}

    def _galaxy(self):
        """Parse all vault notes into nodes and links for 3D visualization.
        Scans both the Obsidian vault and the Agentic OS memory vault.
        Improved link resolution: exact slug, case-insensitive, partial/fuzzy match."""
        import re, os

        vaults = [
            ('obsidian', os.path.expanduser('~/obsidian-vault')),
            ('agentic-os', os.path.expanduser('~/github_project/Agentic-OS/memory')),
        ]

        nodes = []
        links = []
        slug_map = {}       # exact slug -> index
        slug_lower_map = {} # lowercase slug -> index
        title_map = {}      # title -> index
        all_entries = []    # (slug, fpath, rel, vault_name, content, mtime)

        for vault_name, vault_path in vaults:
            if not os.path.isdir(vault_path):
                continue
            for root, dirs, filenames in os.walk(vault_path):
                # Skip hidden dirs
                dirs[:] = [d for d in dirs if not d.startswith('.')]
                for fn in filenames:
                    if not fn.endswith('.md'):
                        continue
                    fpath = os.path.join(root, fn)
                    rel = os.path.relpath(fpath, vault_path)
                    slug = os.path.splitext(fn)[0]
                    title = slug.replace('-', ' ').replace('_', ' ')

                    try:
                        mtime = os.path.getmtime(fpath)
                    except OSError:
                        mtime = 0

                    content = ''
                    try:
                        with open(fpath, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except (OSError, UnicodeDecodeError):
                        pass

                    # Extract first heading as title if present
                    h1 = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
                    if h1:
                        title = h1.group(1).strip()

                    folder = os.path.dirname(rel) if os.path.dirname(rel) else 'root'
                    # Prefix folder with vault name to avoid collisions
                    if vault_name == 'agentic-os':
                        folder = 'memory/' + folder

                    wikilinks = re.findall(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', content)
                    tags = re.findall(r'(?<!\w)#([a-zA-Z][a-zA-Z0-9_-]+)', content)
                    # Also extract frontmatter tags
                    fm_tags = re.findall(r'^tags?:\s*\[([^\]]+)\]', content, re.MULTILINE)
                    for ft in fm_tags:
                        tags.extend([t.strip().strip('"').strip("'") for t in ft.split(',')])

                    node_idx = len(nodes)
                    slug_map[slug] = node_idx
                    slug_lower_map[slug.lower()] = node_idx
                    title_map[title.lower()] = node_idx

                    nodes.append({
                        'id': slug,
                        'title': title,
                        'path': rel,
                        'mtime': mtime,
                        'links_out': len(wikilinks),
                        'tags': list(set(tags))[:8],
                        'folder': folder,
                        'vault': vault_name,
                    })

                    all_entries.append((slug, fpath, rel, vault_name, content, node_idx))

        # Second pass: resolve links with fuzzy matching
        for slug, fpath, rel, vault_name, content, src_idx in all_entries:
            wikilinks = re.findall(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', content)
            for link_target in wikilinks:
                clean = link_target.split('#')[0].split('|')[0].strip()
                if not clean:
                    continue

                tgt_idx = None
                # 1. Exact slug match
                tgt_idx = slug_map.get(clean)
                # 2. Case-insensitive slug match
                if tgt_idx is None:
                    tgt_idx = slug_lower_map.get(clean.lower())
                # 3. Title match
                if tgt_idx is None:
                    tgt_idx = title_map.get(clean.lower())
                # 4. Partial slug match (contains)
                if tgt_idx is None:
                    for k, v in slug_lower_map.items():
                        if clean.lower() in k or k in clean.lower():
                            tgt_idx = v
                            break

                if tgt_idx is not None and tgt_idx != src_idx:
                    links.append({'source': src_idx, 'target': tgt_idx})

        # Deduplicate links
        seen = set()
        unique_links = []
        for l in links:
            key = (min(l['source'], l['target']), max(l['source'], l['target']))
            if key not in seen:
                seen.add(key)
                l['source'] = key[0]
                l['target'] = key[1]
                unique_links.append(l)

        return {'nodes': nodes, 'links': unique_links}

    def _add_idea(self, text):
        if not text.strip():
            return {'error': 'Empty idea'}
        inbox_path = os.path.expanduser('~/obsidian-vault/Idea Inbox.md')
        try:
            with open(inbox_path) as f:
                content = f.read()
            # Add new idea before the separator line
            new_idea = f"\n### Idea: {text}\n\n---\n"
            content = content.replace('\n---\n', new_idea, 1)
            with open(inbox_path, 'w') as f:
                f.write(content)
            return {'ok': True, 'message': 'Idea added to inbox'}
        except Exception as e:
            return {'error': str(e)}

    def _create_task(self, data):
        title = data.get('title', '')
        body = data.get('body', '')
        priority = data.get('priority', 5)
        if not title:
            return {'error': 'Empty title'}
        cmd = ['hermes', 'kanban', 'create', title, '--assignee', 'default',
               '--body', body, '--priority', str(priority)]
        out, rc = run(cmd)
        if rc == 0:
            return {'ok': True, 'output': out}
        return {'error': out or 'Failed to create task'}

    def log_message(self, fmt, *args):
        pass  # suppress request logging

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    host = '0.0.0.0' if '--daemon' in sys.argv else '127.0.0.1'
    server = HTTPServer((host, port), Handler)
    print(f'Agentic OS API running on http://{host}:{port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
