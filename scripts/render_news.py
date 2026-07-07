#!/usr/bin/env python3
"""Render the homepage News list from data/news.json.

Each entry:
  - date:   "YYYY-MM" (rendered as "May 2026")
  - title:  short bold headline (serif) — the "what"
  - detail: the supporting line (muted mono); inline HTML (links) passes through
  - html:   legacy single-field form, still honoured (renders as the detail)

Entries are sorted newest-first regardless of file order, so maintaining
the file is append-anywhere. Only the newest `--limit` entries render.
"""
import argparse
import html as _html
import json
from datetime import datetime
from pathlib import Path

ITEM = """\
                <li class="news-item">
                    <span class="news-date">{date}</span>
                    <span class="news-text">{body}</span>
                </li>
"""


def render_body(e: dict) -> str:
    title = e.get("title", "").strip()
    detail = e.get("detail", e.get("html", "")).strip()
    parts = []
    if title:
        parts.append(f'<span class="news-title">{_html.escape(title)}</span>')
    if detail:
        parts.append(f'<span class="news-detail">{detail}</span>')
    return "".join(parts)


def pretty_date(ym: str) -> str:
    try:
        return datetime.strptime(ym, "%Y-%m").strftime("%b %Y")
    except ValueError:
        return ym


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--limit", type=int, default=8)
    args = ap.parse_args()

    entries = json.load(open(args.input))
    entries.sort(key=lambda e: e.get("date", ""), reverse=True)
    items = "".join(
        ITEM.format(date=pretty_date(e.get("date", "")), body=render_body(e))
        for e in entries[: args.limit]
    )
    Path(args.out).write_text(items)


if __name__ == "__main__":
    main()
