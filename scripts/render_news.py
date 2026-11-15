#!/usr/bin/env python3
"""Render data/news.json into the dated news list on the home page."""

import argparse
import html
import json
from pathlib import Path

TONE = {"Paper": "lavender", "Research": "sky", "Safety": "pink", "Writing": "green", "Launch": "green", "Career": "peach",
        "Award": "yellow", "Open source": "pink"}


def item(entry: dict, first: bool) -> str:
    tone = TONE.get(entry.get("category", ""), "sky")
    detail = f' <span class="news-detail">{entry["detail"]}</span>' if entry.get("detail") else ""
    return (f'                <li class="reveal{" news-new" if first else ""}"><span class="news-date">{html.escape(entry["date"])}</span>'
            f'<p class="news-text"><span class="news-tag tone-{tone}">{html.escape(entry.get("category", "News"))}</span>'
            f'<b>{html.escape(entry["title"])}</b>.{detail}</p></li>\n')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    news = json.loads(Path(args.input).read_text(encoding="utf-8"))
    Path(args.out).write_text("".join(item(entry, i == 0) for i, entry in enumerate(news)), encoding="utf-8")


if __name__ == "__main__":
    main()
