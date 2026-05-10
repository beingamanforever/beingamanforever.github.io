#!/usr/bin/env python3
"""Build a tiny client-side search index over notes.

Reads stdin (posts.index TSV: slug<TAB>title<TAB>date<TAB>desc<TAB>tags<TAB>rt<TAB>updated<TAB>links)
and the post body markdown to derive a short snippet. Emits a single JSON
file that the blog-page search input loads at runtime.

Index entry shape:
  { slug, title, date, tags, snippet, url }

Snippet is a stripped, ~200-char preview of the post body — enough to make
substring search useful without bloating the JSON.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path


WORD_LIMIT = 40
SNIPPET_CHARS = 220


def make_snippet(md_path: Path) -> str:
    if not md_path.exists():
        return ""
    text = md_path.read_text(encoding="utf-8", errors="ignore")
    # Strip frontmatter delimiter
    text = re.sub(r"^.*?^---\s*$", "", text, count=1, flags=re.M | re.S)
    # Strip code blocks (fenced + inline)
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`[^`\n]*`", " ", text)
    # Strip markdown link syntax but keep the link text
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    # Strip headings, emphasis, list markers
    text = re.sub(r"^[#>*\-]+\s*", "", text, flags=re.M)
    text = re.sub(r"[*_]+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= SNIPPET_CHARS:
        return text
    return text[:SNIPPET_CHARS].rsplit(" ", 1)[0] + "…"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--posts-dir", default="content/posts", help="Markdown source dir")
    args = ap.parse_args()

    entries = []
    for line in sys.stdin:
        line = line.rstrip("\n")
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        slug, title, date, desc, tags = parts[:5]
        md_path = Path(args.posts_dir) / f"{slug}.md"
        snippet = make_snippet(md_path) or desc
        entries.append({
            "slug": slug,
            "title": title,
            "date": date,
            "tags": [t.strip() for t in tags.split(",") if t.strip()],
            "snippet": snippet,
            "url": f"posts/{slug}.html",
            "desc": desc,
        })

    Path(args.out).write_text(json.dumps(entries, ensure_ascii=False))


if __name__ == "__main__":
    main()
