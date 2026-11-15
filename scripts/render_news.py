#!/usr/bin/env python3
"""Render data/news.json into the dated news list on the home page: date, headline, short detail."""

import argparse
import html
import json
from pathlib import Path


def item(entry: dict) -> str:
    detail = f' <span class="news-links">{entry["detail"]}</span>' if entry.get("detail") else ""
    return (f'                <li class="reveal"><span class="news-date">{html.escape(entry["date"])}</span>'
            f'<p class="news-text">{html.escape(entry["title"])}.{detail}</p></li>\n')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    news = json.loads(Path(args.input).read_text(encoding="utf-8"))
    Path(args.out).write_text("".join(item(entry) for entry in news), encoding="utf-8")


if __name__ == "__main__":
    main()
