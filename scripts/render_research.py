#!/usr/bin/env python3
"""Render data/research.json into publication rows grouped by theme (Research page and home page)."""

import argparse
import html
import json
from pathlib import Path

THEMES = [
    ("safety", "Safety and alignment", "pink",
     "Whether agents can be verified, whether defenses hold outside English, and how models are steered and checked.",
     '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'),
    ("documents", "Document intelligence", "sky",
     "Reading real pages: orientation, layout and text you can check.",
     '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    ("models", "How language models behave", "lavender",
     "Where sequence models look, and why the architecture matters.",
     '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 11 7.6-3.8M8.2 13l7.6 3.8"/>'),
]


def venue_tone(venue: str) -> str:
    if venue.startswith("Accepted"):
        return "green"
    if "submitted" in venue.lower() or "review" in venue.lower():
        return "peach"
    if "hackathon" in venue.lower():
        return "yellow"
    return "lavender"


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
        f'<a class="pill small" href="{html.escape(link["url"], quote=True)}"'
        + ("" if link["url"].startswith("blog/") else ' target="_blank" rel="noopener noreferrer"')
        + f'>{html.escape(link["label"])}</a>'
        for link in entry.get("links", []))
    desc = "" if compact else f'<p class="pub-desc">{html.escape(entry["desc"])}</p>'
    return f"""\
                <article class="pub reveal">
                    {picture}
                    <div class="pub-body">
                        <h4 class="pub-title"><a href="{url}" target="_blank" rel="noopener noreferrer">{title}</a></h4>
                        <p class="pub-authors">{authors(entry)}</p>
                        <span class="venue tone-{venue_tone(entry['venue'])}">{html.escape(entry['venue'])}</span>
                        {desc}
                        <div class="pub-links">{links}</div>
                    </div>
                </article>
"""


def render(items: list[dict], compact: bool) -> str:
    out = []
    for key, name, tone, blurb, icon in THEMES:
        group = [entry for entry in items if entry.get("theme") == key]
        if not group:
            continue
        lead = "" if compact else f'<p class="theme-blurb">{html.escape(blurb)}</p>'
        out.append(f"""\
            <div class="theme-group" id="theme-{key}">
                <h3 class="theme-title"><span class="theme-icon tone-{tone}" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></span>{name}</h3>
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
