#!/usr/bin/env python3
"""Render data/projects.json into project cards. Projects that already appear in research.json are skipped."""

import argparse
import html
import json
from pathlib import Path

from hover import hover_layer


def image_of(entry: dict) -> str:
    if entry.get("image"):
        return entry["image"]
    if entry.get("gallery"):
        return entry["gallery"][0]["image"]
    return ""


def card(entry: dict) -> str:
    src = image_of(entry)
    picture = (f'<div class="project-img"><img src="{src}" alt="" loading="lazy">{hover_layer(entry.get("hover", ""))}</div>'
               if src else "")
    return f"""\
                <a class="project reveal" href="{html.escape(entry['url'], quote=True)}" target="_blank" rel="noopener noreferrer">
                    {picture}
                    <div class="project-body">
                        <h3>{html.escape(entry['title'])}</h3>
                        <p>{html.escape(entry['description'])}</p>
                    </div>
                </a>
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--research", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    research = {entry["title"] for entry in json.loads(Path(args.research).read_text(encoding="utf-8"))}
    projects = [entry for entry in json.loads(Path(args.input).read_text(encoding="utf-8"))
                if entry.get("featured", True) and entry["title"] not in research]
    Path(args.out).write_text("".join(card(entry) for entry in projects), encoding="utf-8")


if __name__ == "__main__":
    main()
