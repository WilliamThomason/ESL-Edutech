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
        elif path == '' or path == '/':
            self._serve_dashboard()
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
    server = HTTPServer(('127.0.0.1', port), Handler)
    print(f'Agentic OS API running on http://127.0.0.1:{port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
