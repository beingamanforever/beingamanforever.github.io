#!/usr/bin/env python3
"""Render the homepage News list from data/news.json.

Each entry:
  - date:   "YYYY-MM" (rendered as "May 2026")
  - title:  short headline describing the update
  - detail: supporting text; inline HTML links pass through
  - html:   legacy single-field form, still honoured (renders as the detail)
  - details: optional list of supporting points; inline HTML links pass through
  - category: card meta label; picks the card colour
  - tag:    short label printed on the card art

Entries are sorted newest-first regardless of file order, so maintaining
the file is append-anywhere. All entries render unless `--limit` is set.
"""
import argparse
import html as _html
import json
from datetime import datetime
from pathlib import Path

ITEM = """\
                <article class="news-card tone-{tone}">
                    <div class="card-art" aria-hidden="true"><span>{tag}</span></div>
                    <p class="card-meta"><span>{date}</span><span>{category}</span></p>
                    {body}
                </article>
"""

# One card colour per kind of news, so similar items read alike.
TONES = {"paper": "lavender", "research": "orange", "launch": "green", "open source": "green",
         "career": "sky", "award": "pink"}


def render_body(e: dict) -> str:
    title = e.get("title", "").strip()
    detail = e.get("detail", e.get("html", "")).strip()
    parts = []
    if title:
        parts.append(f'<h3 class="card-title">{_html.escape(title)}</h3>')
    if detail:
        parts.append(f'<p class="card-detail">{detail}</p>')
    details = e.get("details") or []
    if details:
        items = "".join(f"<li>{item}</li>" for item in details)
        parts.append(f'<ul class="news-details">{items}</ul>')
    return "".join(parts)


def parse_date(value: str) -> datetime:
    for date_format in ("%Y-%m", "%b %Y", "%B %Y"):
        try:
            return datetime.strptime(value, date_format)
        except ValueError:
            continue
    return datetime.min


def pretty_date(value: str) -> str:
    parsed = parse_date(value)
    return parsed.strftime("%b %Y") if parsed != datetime.min else value


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    entries = json.loads(Path(args.input).read_text(encoding="utf-8"))
    entries.sort(key=lambda e: parse_date(e.get("date", "")), reverse=True)
    visible_entries = entries[: args.limit] if args.limit > 0 else entries
    items = "".join(
        ITEM.format(
            date=_html.escape(pretty_date(e.get("date", ""))),
            body=render_body(e),
            category=_html.escape(e.get("category", "")),
            tag=_html.escape(e.get("tag", "")),
            tone=TONES.get(e.get("category", "").lower(), "sky"),
        )
        for e in visible_entries
    )
    Path(args.out).write_text(items, encoding="utf-8")


if __name__ == "__main__":
    main()
