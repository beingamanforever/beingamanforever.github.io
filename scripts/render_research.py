#!/usr/bin/env python3
"""Render data/research.json into publication rows grouped by theme (Research page and home page)."""

import argparse
import html
import json
from pathlib import Path

THEMES = [
    ("safety", "Safety and alignment",
     "Whether agents can be verified, whether defenses hold outside English, and how models are steered and checked."),
    ("documents", "Document intelligence", "Reading real pages: orientation, layout and text you can check."),
    ("models", "How language models behave", "Where sequence models look, and why the architecture matters."),
]


def image_of(entry: dict) -> tuple[str, str]:
    if entry.get("image"):
        return entry["image"], entry.get("image_alt", "")
    if entry.get("gallery"):
        return entry["gallery"][0]["image"], entry["gallery"][0].get("alt", "")
    return "", ""


def authors(entry: dict) -> str:
    names = [f"<b>{html.escape(n)}</b>" if n == "Aman Behera" else html.escape(n) for n in entry.get("authors", ["Aman Behera"])]
    return ", ".join(names)


def pub(entry: dict, compact: bool) -> str:
    src, alt = image_of(entry)
    title = html.escape(entry["title"])
    url = html.escape(entry["url"], quote=True)
    picture = (f'<a class="pub-thumb" href="{url}" tabindex="-1" aria-hidden="true"><img src="{src}" alt="" loading="lazy"></a>'
               if src else "")
    links = "".join(
        f'<a href="{html.escape(link["url"], quote=True)}"'
        + ("" if link["url"].startswith("blog/") else ' target="_blank" rel="noopener noreferrer"')
        + f'>{html.escape(link["label"])}</a>'
        for link in entry.get("links", []))
    desc = f'<p class="pub-desc">{html.escape(entry.get("short") or entry["desc"])}</p>'
    return f"""\
                <article class="pub reveal">
                    {picture}
                    <div class="pub-body">
                        <h4 class="pub-title"><a href="{url}" target="_blank" rel="noopener noreferrer">{title}</a></h4>
                        <p class="pub-authors">{authors(entry)}</p>
                        <p class="venue">{html.escape(entry['venue'])}</p>
                        {desc}
                        <div class="pub-links">{links}</div>
                    </div>
                </article>
"""


def render(items: list[dict], compact: bool) -> str:
    out = []
    for key, name, blurb in THEMES:
        group = [entry for entry in items if entry.get("theme") == key]
        if not group:
            continue
        lead = "" if compact else f'<p class="theme-blurb">{html.escape(blurb)}</p>'
        out.append(f"""\
            <div class="theme-group" id="theme-{key}">
                <h3 class="theme-title">{name}</h3>
                {lead}
{"".join(pub(entry, compact) for entry in group)}            </div>
""")
    return "".join(out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--home-out", required=True)
    args = parser.parse_args()
    items = json.loads(Path(args.input).read_text(encoding="utf-8"))
    Path(args.out).write_text(render(items, compact=False), encoding="utf-8")
    Path(args.home_out).write_text(render(items, compact=True), encoding="utf-8")


if __name__ == "__main__":
    main()
