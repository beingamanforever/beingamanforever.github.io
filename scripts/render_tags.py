#!/usr/bin/env python3
"""Render the tag index page from the posts TSV index.

Reads stdin lines: slug<TAB>title<TAB>date<TAB>desc<TAB>tags<TAB>reading_time
Writes a grouped HTML fragment to --out.
"""
import argparse
import html
import sys
from collections import defaultdict


def slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    by_tag: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    for line in sys.stdin:
        line = line.rstrip("\n")
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 6:
            continue
        slug, title, date, desc, tags, _rt = parts[:6]
        for tag in (t.strip() for t in tags.split(",") if t.strip()):
            by_tag[tag].append((slug, title, date))

    out = []
    for tag in sorted(by_tag):
        posts = sorted(by_tag[tag], key=lambda p: p[2], reverse=True)
        out.append(f'                <section class="tag-section" id="tag-{html.escape(slugify(tag))}">')
        out.append(f'                    <h2 class="tag-section-title">#{html.escape(tag)} <span class="tag-count">({len(posts)})</span></h2>')
        out.append('                    <ul class="tag-post-list">')
        for slug, title, date in posts:
            out.append(
                f'                        <li><time datetime="{html.escape(date)}">{html.escape(date)}</time> '
                f'<a href="posts/{html.escape(slug)}.html">{html.escape(title)}</a></li>'
            )
        out.append('                    </ul>')
        out.append('                </section>')

    with open(args.out, "w") as f:
        f.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
