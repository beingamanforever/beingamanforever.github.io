#!/usr/bin/env python3
"""Render a per-post Open Graph image as SVG.

Usage:
    render_og.py --slug <slug> --title "..." --tags "..." --out <path>
"""
import argparse
import html
import textwrap


SVG = '''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0A0A"/>
      <stop offset="100%" stop-color="#1e1e1e"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f1f1f" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="60" y="60" width="6" height="120" fill="#58a6ff"/>
  <text x="100" y="100" font-family="ui-monospace, Menlo, monospace" font-size="22" fill="#888" letter-spacing="2">
    {tag_label}
  </text>
  <text x="100" y="145" font-family="ui-monospace, Menlo, monospace" font-size="22" fill="#58a6ff" letter-spacing="1">
    aman behera
  </text>
{title_tspans}
  <text x="60" y="570" font-family="ui-monospace, Menlo, monospace" font-size="20" fill="#888">
    beingamanforever.io
  </text>
</svg>
'''


def wrap_title(title: str, max_chars: int = 28) -> list[str]:
    return textwrap.wrap(title, width=max_chars) or [title]


def render_title(lines: list[str]) -> str:
    out = []
    y = 290
    for line in lines[:4]:
        out.append(
            f'  <text x="60" y="{y}" font-family="\'IBM Plex Sans\', sans-serif" '
            f'font-size="72" font-weight="600" fill="#e8e8e8" letter-spacing="-1.5">'
            f'{html.escape(line)}</text>'
        )
        y += 86
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--tags", default="")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    tag_label = (args.tags or "post").upper()
    svg = SVG.format(
        tag_label=html.escape(tag_label),
        title_tspans=render_title(wrap_title(args.title)),
    )
    with open(args.out, "w") as f:
        f.write(svg)


if __name__ == "__main__":
    main()
