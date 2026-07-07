#!/usr/bin/env python3
"""Render research entries from data/research.json into HTML fragments.

Each entry:
  - title: work name
  - venue: short tag shown on the right (e.g. "EMNLP '26 target", "... · winner")
  - url:   optional; when present the title links to it
  - desc:  one paragraph; inline HTML (links) passes through as-is

Emits two fragments: a homepage-featured list (newest/first `--limit`) and the
full list for the dedicated /research page. File order is display order.
"""
import argparse
import html
import json
from pathlib import Path

ITEM = """\
                <article class="research-item">
                    <div class="research-header">
                        <h3 class="research-title">{title}</h3>
                        <span class="research-venue">{venue}</span>
                    </div>
                    <p class="research-desc">{desc}</p>
                </article>
"""


def render_item(e: dict) -> str:
    title = html.escape(e.get("title", "Untitled"))
    url = (e.get("url") or "").strip()
    if url:
        is_external = url.startswith("http://") or url.startswith("https://")
        rel_attr = ' target="_blank" rel="noopener noreferrer"' if is_external else ""
        title = f'<a href="{html.escape(url, quote=True)}"{rel_attr}>{title}</a>'
    return ITEM.format(
        title=title,
        venue=html.escape(e.get("venue", "")),
        desc=e.get("desc", ""),
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--featured-out", required=True)
    ap.add_argument("--all-out", required=True)
    ap.add_argument("--limit", type=int, default=3,
                    help="fallback homepage count when no items set featured=true")
    args = ap.parse_args()

    entries = json.load(open(args.input))
    # Homepage preview: explicit featured flags if any, else the first --limit.
    featured = [e for e in entries if e.get("featured")]
    if not featured:
        featured = entries[: args.limit]
    Path(args.featured_out).write_text("".join(render_item(e) for e in featured))
    Path(args.all_out).write_text("".join(render_item(e) for e in entries))


if __name__ == "__main__":
    main()
