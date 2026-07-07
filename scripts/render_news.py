#!/usr/bin/env python3
"""Render the homepage News list from data/news.json.

Each entry:
  - date: "YYYY-MM" (rendered as "May 2026")
  - html: the item text; inline HTML (links, <em>) is passed through as-is.

Entries are sorted newest-first regardless of file order, so maintaining
the file is append-anywhere. Only the newest `--limit` entries render.
"""
import argparse
import json
from datetime import datetime
from pathlib import Path

ITEM = """\
                <li class="news-item">
                    <span class="news-date">{date}</span>
                    <span class="news-text">{html}</span>
                </li>
"""


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
        ITEM.format(date=pretty_date(e.get("date", "")), html=e.get("html", ""))
        for e in entries[: args.limit]
    )
    Path(args.out).write_text(items)


if __name__ == "__main__":
    main()
