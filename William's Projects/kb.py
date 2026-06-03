#!/usr/bin/env python3
"""
Eloquenta ESL Knowledge Base — Lesson Manager
Add, remove, rename, and organise lessons. Auto-updates index.html and pushes to GitHub.

Usage:
  python3 kb.py add <file.html> --title "Title" --category speaking [--meta "B1 · 10 topics"]
  python3 kb.py remove <slug>
  python3 kb.py rename <slug> --title "New Title"
  python3 kb.py category <slug> --cat grammar
  python3 kb.py list
  python3 kb.py push
  python3 kb.py sync   # regenerate index.html + push
"""

import json
import os
import re
import sys
import shutil
import subprocess
import textwrap
from pathlib import Path
from datetime import datetime, timezone

# ─── Configuration ────────────────────────────────────────────────────────────
REPO_DIR = Path("/tmp/esl-edutech-check")
CATALOG_FILE = REPO_DIR / "lessons.json"
INDEX_FILE = REPO_DIR / "index.html"
GIT_REMOTE = "origin"
GIT_BRANCH = "main"

# ─── Category definitions (must match index.html data-keywords and structure) ─
CATEGORIES = {
    "accent":       {"title": "Accent Reduction & Recognition",  "icon": "🎧", "desc_key": "accent reduction pronunciation phonetics listening comprehension thai vietnamese chinese spanish indian L1"},
    "speaking":     {"title": "Speaking & Conversation",          "icon": "💬", "desc_key": "speaking conversation topics discussion opinion debate roleplay communication"},
    "exam":         {"title": "Exam Preparation",                 "icon": "📝", "desc_key": "exam test toefl ielts oet igcse cambridge pet fce cae cpe preparation practice assessment gcse"},
    "grammar":      {"title": "Grammar",                          "icon": "🔤", "desc_key": "grammar tenses verb syntax sentence structure parts of speech articles prepositions conjunctions morphology"},
    "business":     {"title": "Business English",                 "icon": "💼", "desc_key": "business english professional workplace corporate email meeting presentation negotiation industry"},
    "topics":       {"title": "Topic-Based Speaking",             "icon": "🌍", "desc_key": "topics discussion subject lifestyle natural world food drink education travel conversation"},
    "young":        {"title": "Young Learners & Dyslexia",        "icon": "🧒", "desc_key": "young learners kids children a1 a2 beginner elementary primary school junior fun games dyslexia spelling"},
    "listening":    {"title": "Listening & Comprehension",        "icon": "🎵", "desc_key": "listening comprehension audio video dictation hear understanding media"},
    "writing":      {"title": "Writing & Literacy",               "icon": "✍️", "desc_key": "writing essay literacy b1 b2 reading vocabulary word study grammar reference"},
}

# File extension -> icon mapping
ICON_BY_EXT = {
    "quiz": "❓",
    "assessment": "📊",
    "deck": "📑",
    "slideshow": "📽️",
    "lesson": "📖",
    "guide": "📘",
    "default": "📄",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_catalog():
    if CATALOG_FILE.exists():
        return json.loads(CATALOG_FILE.read_text())
    return {"_meta": {"version": 1, "updated": ""}, "lessons": {}}

def save_catalog(cat):
    cat["_meta"]["updated"] = datetime.now(timezone.utc).isoformat()
    CATALOG_FILE.write_text(json.dumps(cat, indent=2, ensure_ascii=False))

def slugify(title):
    s = title.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s

def get_icon_for(title, category):
    t = title.lower()
    for key, icon in ICON_BY_EXT.items():
        if key in t:
            return icon
    return CATEGORIES.get(category, {}).get("icon", "📄")

def find_card_block(html, cat_key):
    """Find the card block in index.html for a given category key."""
    # Find the ccard div whose data-keywords contains our desc_key
    pattern = rf'(<div class="ccard"[^>]*data-keywords="[^"]*{re.escape(CATEGORIES[cat_key]["desc_key"])}[^"]*">)(.*?)(</div>\s*</div>\s*<!-- end cgrid -->)'
    m = re.search(pattern, html, re.DOTALL)
    if m:
        return m
    # Fallback: find by category title
    pattern2 = rf'(<div class="ccard"[^>]*>.*?class="ccard-title">{re.escape(CATEGORIES[cat_key]["title"])}.*?</div>)(.*?)(?=<div class="ccard"|<!-- end cgrid -->)'
    m2 = re.search(pattern2, html, re.DOTALL)
    return m2

def regenerate_index(cat):
    """Regenerate the card grid in index.html from the catalog, preserving the rest of the page."""
    html = INDEX_FILE.read_text(encoding='utf-8')

    # Build all cards
    all_cards = []
    for cat_key, cat_def in CATEGORIES.items():
        lessons_in_cat = [
            l for l in cat["lessons"].values()
            if l.get("category", "speaking") == cat_key
        ]
        lessons_in_cat.sort(key=lambda x: (x.get("order", 999), x.get("title", "")))

        desc = cat_def.get("desc", {
            "accent": "Understand how different L1 backgrounds shape English pronunciation. Audio examples, listening drills, and reference guides.",
            "speaking": "Discussion topics, conversation questions, slideshows, and assessment tools for fluency development across CEFR levels.",
            "exam": "Targeted practice materials for IELTS, TOEFL, OET, Cambridge suite, IGCSE, and other international English exams.",
            "grammar": "Grammar reference, exercises, and quizzes organised by level and structure type.",
            "business": "Professional English for the workplace — debates, finance, education, and industry-specific materials.",
            "topics": "Themed discussion materials on lifestyle, food, travel, the natural world, and more.",
            "young": "Age-appropriate materials for younger learners and students with dyslexia — multisensory spelling and interactive exercises.",
            "listening": "Audio-based exercises, dictation tasks, and listening comprehension at varied speeds and accents.",
            "writing": "Essay templates, writing frameworks, vocabulary builders, and literacy development tools.",
        }.get(cat_key, ""))

        if lessons_in_cat:
            items_html = '\n'.join(
                f'        <li>\n          <a href="{l["file"]}">\n            <span class="item-icon">{l.get("icon", "📄")}</span>\n            <span class="item-title">{l["title"]}</span>\n            <span class="item-meta">{l.get("meta", "")}</span>\n            <span class="item-arrow">→</span>\n          </a>\n        </li>' for l in lessons_in_cat
            )
            count_str = f'{len(lessons_in_cat)} resource{"s" if len(lessons_in_cat) != 1 else ""}'
            card = (
                f'    <div class="ccard" data-keywords="{cat_def.get("desc_key", cat_key)}">\n'
                f'      <div class="ccard-top">\n'
                f'        <span class="ccard-icon">{cat_def["icon"]}</span>\n'
                f'        <div>\n'
                f'          <div class="ccard-title">{cat_def["title"]}</div>\n'
                f'          <div class="ccard-count">{count_str}</div>\n'
                f'        </div>\n'
                f'      </div>\n'
                f'      <div class="ccard-desc">{desc}</div>\n'
                f'      <ul class="ccard-items">\n'
                f'{items_html}\n'
                f'      </ul>\n'
                f'    </div>'
            )
        else:
            count_str = "Coming soon"
            ph = {
                "accent": "🎧", "speaking": "💬", "exam": "📚",
                "grammar": "🔤", "business": "💼", "topics": "🌍",
                "young": "🧒", "listening": "🎵", "writing": "📝",
            }.get(cat_key, "📁")
            card = (
                f'    <div class="ccard" data-keywords="{cat_def.get("desc_key", cat_key)}">\n'
                f'      <div class="ccard-top">\n'
                f'        <span class="ccard-icon">{cat_def["icon"]}</span>\n'
                f'        <div>\n'
                f'          <div class="ccard-title">{cat_def["title"]}</div>\n'
                f'          <div class="ccard-count">{count_str}</div>\n'
                f'        </div>\n'
                f'      </div>\n'
                f'      <div class="ccard-desc">{desc}</div>\n'
                f'      <div class="ccard-placeholder">\n'
                f'        <div class="placeholder-icon">{ph}</div>\n'
                f'        <p>Materials in development.<br>Uploaded here when ready.</p>\n'
                f'      </div>\n'
                f'    </div>'
            )
        all_cards.append(card)

    grid_content = '\n\n'.join(all_cards)

    # Replace everything between the grid markers
    GRID_START = '<div class="cgrid" id="cardGrid">'
    GRID_END = '  </div><!-- end cgrid -->'
    start_idx = html.find(GRID_START)
    end_idx = html.find(GRID_END)
    if start_idx == -1 or end_idx == -1:
        print("  ERROR: could not find grid markers in index.html")
        return

    new_html = html[:start_idx] + GRID_START + '\n\n' + grid_content + '\n\n' + GRID_END + html[end_idx + len(GRID_END):]
    INDEX_FILE.write_text(new_html, encoding='utf-8')
    print(f"  index.html regenerated ({len(cat['lessons'])} lessons)")

# ─── Commands ────────────────────────────────────────────────────────────────

def cmd_add(args):
    filepath = Path(args.file)
    if not filepath.exists():
        print(f"ERROR: file not found: {filepath}")
        return 1

    title = getattr(args, 'title', None)
    if not title:
        # Try to extract <title> from HTML
        content = filepath.read_text(encoding='utf-8', errors='ignore')
        m = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
        title = m.group(1).strip() if m else filepath.stem.replace('-', ' ').replace('_', ' ').title()

    category = getattr(args, 'category', 'speaking')
    if category not in CATEGORIES:
        print(f"ERROR: unknown category '{category}'. Valid: {', '.join(CATEGORIES)}")
        return 1

    meta = getattr(args, 'meta', '')
    order = getattr(args, 'order', 999)

    slug = slugify(title)
    dest_filename = f"{slug}.html"

    # Copy file to repo
    dest = REPO_DIR / dest_filename
    shutil.copy2(filepath, dest)

    # Update catalog
    cat = load_catalog()
    cat["lessons"][slug] = {
        "title": title,
        "file": dest_filename,
        "category": category,
        "meta": meta,
        "icon": get_icon_for(title, category),
        "order": order,
        "added": datetime.now(timezone.utc).isoformat(),
        "source": str(filepath),
    }
    save_catalog(cat)

    print(f"  Added: {title}")
    print(f"  File:  {dest_filename} ({dest.stat().st_size // 1024}KB)")
    print(f"  Category: {CATEGORIES[category]['title']}")
    print(f"  Slug:  {slug}")
    print(f"  URL:   https://williamthomason.github.io/ESL-Edutech/{dest_filename}")
    return 0

def cmd_remove(args):
    slug = args.slug
    cat = load_catalog()
    if slug not in cat["lessons"]:
        print(f"ERROR: lesson '{slug}' not found. Run 'list' to see slugs.")
        return 1

    lesson = cat["lessons"].pop(slug)
    file_path = REPO_DIR / lesson["file"]
    if file_path.exists():
        file_path.unlink()
        print(f"  Deleted: {lesson['file']}")
    else:
        print(f"  File not in repo (already removed?): {lesson['file']}")

    save_catalog(cat)
    print(f"  Removed: {lesson['title']} ({slug})")
    return 0

def cmd_rename(args):
    slug = args.slug
    cat = load_catalog()
    if slug not in cat["lessons"]:
        print(f"ERROR: lesson '{slug}' not found.")
        return 1

    lesson = cat["lessons"][slug]
    if getattr(args, 'title', None):
        lesson["title"] = args.title
    if getattr(args, 'meta', None):
        lesson["meta"] = args.meta
    if getattr(args, 'icon', None):
        lesson["icon"] = args.icon

    save_catalog(cat)
    print(f"  Updated: {lesson['title']} ({slug})")
    return 0

def cmd_category(args):
    slug = args.slug
    new_cat = args.cat
    if new_cat not in CATEGORIES:
        print(f"ERROR: unknown category '{new_cat}'. Valid: {', '.join(CATEGORIES)}")
        return 1
    cat = load_catalog()
    if slug not in cat["lessons"]:
        print(f"ERROR: lesson '{slug}' not found.")
        return 1
    old_cat = cat["lessons"][slug]["category"]
    cat["lessons"][slug]["category"] = new_cat
    save_catalog(cat)
    print(f"  Moved: {cat['lessons'][slug]['title']}  {CATEGORIES[old_cat]['title']} → {CATEGORIES[new_cat]['title']}")
    return 0

def cmd_list(args):
    cat = load_catalog()
    lessons = cat.get("lessons", {})
    if not lessons:
        print("  No lessons in catalog. Use 'add' to upload.")
        return 0

    # Group by category
    by_cat = {}
    for slug, l in lessons.items():
        c = l.get("category", "uncategorised")
        by_cat.setdefault(c, []).append((slug, l))

    total = 0
    for cat_key in list(CATEGORIES.keys()) + list(set(by_cat.keys()) - set(CATEGORIES.keys())):
        items = by_cat.get(cat_key, [])
        if not items:
            continue
        cat_name = CATEGORIES.get(cat_key, {}).get("title", cat_key)
        icon = CATEGORIES.get(cat_key, {}).get("icon", "📁")
        print(f"\n  {icon} {cat_name} ({len(items)})")
        print(f"  {'─' * 60}")
        for slug, l in sorted(items, key=lambda x: x[1].get('order', 999)):
            meta = l.get("meta", "")
            fsize = (REPO_DIR / l["file"]).stat().st_size // 1024 if (REPO_DIR / l["file"]).exists() else 0
            print(f"  {l.get('icon','📄')} {l['title']}")
            print(f"     slug: {slug}  file: {l['file']}  {fsize}KB  {meta}")
            total += 1

    print(f"\n  Total: {total} lessons")
    return 0

def cmd_push(args):
    """git add + commit + push"""
    os.chdir(REPO_DIR)

    # Check if there are changes
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if not result.stdout.strip():
        print("  Nothing to commit — no changes.")
        return 0

    # Stage all
    subprocess.run(["git", "add", "-A"], check=True)

    # Commit
    msg = getattr(args, 'message', None) or f"Update knowledge base — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    result = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Commit failed: {result.stderr}")
        return 1
    print(f"  Committed: {msg}")

    # Push
    result = subprocess.run(
        ["git", "push", GIT_REMOTE, GIT_BRANCH],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  Push failed: {result.stderr}")
        print("  Hint: if using HTTPS, set up credentials. If SSH, add your key to GitHub.")
        return 1
    print(f"  Pushed to {GIT_REMOTE}/{GIT_BRANCH}")
    print(f"  Live at: https://williamthomason.github.io/ESL-Edutech/")
    return 0

def cmd_sync(args):
    """Regenerate index.html from catalog and push."""
    cat = load_catalog()
    regenerate_index(cat)
    save_catalog(cat)
    return cmd_push(args)

def cmd_init(args):
    """Scan repo for HTML files not in catalog and add them."""
    cat = load_catalog()
    existing_files = {l["file"] for l in cat["lessons"].values()}
    added = 0
    for f in sorted(REPO_DIR.glob("*.html")):
        if f.name in ("index.html",) or f.name in existing_files:
            continue
        cat["lessons"][f.stem] = {
            "title": f.stem.replace('-', ' ').replace('_', ' ').title(),
            "file": f.name,
            "category": "speaking",
            "meta": f"{f.stat().st_size // 1024}KB",
            "icon": "📄",
            "order": 999,
            "added": datetime.now(timezone.utc).isoformat(),
            "source": "init-scan",
        }
        existing_files.add(f.name)
        added += 1
        print(f"  Registered: {f.name} ({f.stem})")

    save_catalog(cat)
    print(f"\n  {added} files added to catalog.")
    print("  Run 'list' to see all lessons, then reassign categories as needed.")
    return 0

def cmd_import(args):
    """Bulk import all HTML files from a directory."""
    src_dir = Path(args.directory)
    if not src_dir.is_dir():
        print(f"ERROR: not a directory: {src_dir}")
        return 1

    cat = load_catalog()
    existing_slugs = set(cat["lessons"].keys())
    added = 0
    skipped = 0

    for f in sorted(src_dir.glob("*.html")):
        slug = f.stem
        if slug in existing_slugs:
            skipped += 1
            continue

        dest = REPO_DIR / f.name
        shutil.copy2(f, dest)
        cat["lessons"][slug] = {
            "title": slug.replace('-', ' ').replace('_', ' ').title(),
            "file": f.name,
            "category": getattr(args, 'category', 'speaking'),
            "meta": f"{f.stat().st_size // 1024}KB",
            "icon": get_icon_for(f.stem, getattr(args, 'category', 'speaking')),
            "order": 999,
            "added": datetime.now(timezone.utc).isoformat(),
            "source": str(f),
        }
        existing_slugs.add(slug)
        added += 1
        print(f"  Imported: {f.name}")

    save_catalog(cat)
    print(f"\n  Imported: {added} files  |  Skipped (already in catalog): {skipped}")
    return 0

# ─── CLI Parser ───────────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Eloquenta ESL Knowledge Base — Lesson Manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("          Examples:\n            kb.py add lesson.html --title \"Past Perfect\" --category grammar --meta \"B1 - Quiz\"\n            kb.py remove past-perfect\n            kb.py rename past-perfect --title \"Past Perfect Tense\"\n            kb.py category past-perfect --cat speaking\n            kb.py list\n            kb.py push\n            kb.py sync\n            kb.py init\n            kb.py import /path/to/lessons/ --category grammar\n        ")
    )
    sub = parser.add_subparsers(dest="command")

    # add
    p_add = sub.add_parser("add", help="Upload a new lesson HTML file")
    p_add.add_argument("file", help="Path to HTML file")
    p_add.add_argument("--title", help="Display title (auto-detected from <title> if omitted)")
    p_add.add_argument("--category", default="speaking", help=f"Category: {', '.join(CATEGORIES)}")
    p_add.add_argument("--meta", default="", help="Short metadata label (e.g. 'B1 · 10 topics')")
    p_add.add_argument("--order", type=int, default=999, help="Sort order (lower = first)")

    # remove
    p_rm = sub.add_parser("remove", help="Delete a lesson")
    p_rm.add_argument("slug", help="Lesson slug")

    # rename
    p_rn = sub.add_parser("rename", help="Rename / update metadata")
    p_rn.add_argument("slug", help="Lesson slug")
    p_rn.add_argument("--title", help="New title")
    p_rn.add_argument("--meta", help="New metadata")
    p_rn.add_argument("--icon", help="New icon emoji")

    # category
    p_cat = sub.add_parser("category", help="Move a lesson to a different category")
    p_cat.add_argument("slug", help="Lesson slug")
    p_cat.add_argument("--cat", required=True, help=f"New category: {', '.join(CATEGORIES)}")

    # list
    sub.add_parser("list", help="List all lessons by category")

    # push
    p_push = sub.add_parser("push", help="Commit and push to GitHub")
    p_push.add_argument("--message", "-m", help="Commit message")

    # sync
    p_sync = sub.add_parser("sync", help="Regenerate index.html + push")
    p_sync.add_argument("--message", "-m", help="Commit message")

    # init
    sub.add_parser("init", help="Scan repo for existing HTML files and register in catalog")

    # import
    p_imp = sub.add_parser("import", help="Bulk import HTML files from a directory")
    p_imp.add_argument("directory", help="Source directory")
    p_imp.add_argument("--category", default="speaking", help="Category for all imported files")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return 0

    dispatch = {
        "add": cmd_add,
        "remove": cmd_remove,
        "rename": cmd_rename,
        "category": cmd_category,
        "list": cmd_list,
        "push": cmd_push,
        "sync": cmd_sync,
        "init": cmd_init,
        "import": cmd_import,
    }

    handler = dispatch.get(args.command)
    if handler:
        return handler(args)
    parser.print_help()
    return 0

if __name__ == "__main__":
    sys.exit(main())
