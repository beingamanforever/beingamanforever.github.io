#!/usr/bin/env python3
"""Render a per-post Open Graph card as PNG (1200x630).

Twitter, LinkedIn, and most chat unfurlers reject SVG OG images, so we render
PNG via Pillow. Falls back to a tiny SVG file if Pillow is unavailable so the
build never breaks — but the og:image meta should reference the PNG.

Font dependency: this script tries DejaVu / Liberation / Helvetica in that order.
GitHub Actions runners have DejaVu installed by default, so CI output is the
canonical render. macOS only has DejaVu if you `brew install --cask font-dejavu`;
without it, the local OG falls through to Helvetica and looks slightly different
from the CI image. Either install DejaVu locally for parity, or just trust that
the next CI run will overwrite the committed PNG with the canonical one.

Usage:
    render_og.py --slug <slug> --title "..." --tags "..." --site "..." --out <path>
"""
import argparse
import html
import sys
import textwrap


WIDTH, HEIGHT = 1200, 630
BG_TOP = (10, 10, 10)
BG_BOTTOM = (30, 30, 30)
ACCENT = (88, 166, 255)
TEXT_PRIMARY = (232, 232, 232)
TEXT_SECONDARY = (136, 136, 136)


def wrap_title(title: str, max_chars: int = 26) -> list[str]:
    return textwrap.wrap(title, width=max_chars) or [title]


def load_font(size: int, mono: bool = False, bold: bool = False):
    """Try a list of fonts available on common dev/CI systems."""
    from PIL import ImageFont

    if mono:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
            "/System/Library/Fonts/Menlo.ttc",
            "/Library/Fonts/Menlo.ttc",
            "DejaVuSansMono.ttf",
        ]
    elif bold:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "DejaVuSans-Bold.ttf",
        ]
    else:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "DejaVuSans.ttf",
        ]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def render_png(slug: str, title: str, tags: str, site: str, out: str) -> None:
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (WIDTH, HEIGHT), color=BG_TOP)
    draw = ImageDraw.Draw(img)

    # Vertical gradient.
    for y in range(HEIGHT):
        t = y / (HEIGHT - 1)
        c = (lerp(BG_TOP[0], BG_BOTTOM[0], t),
             lerp(BG_TOP[1], BG_BOTTOM[1], t),
             lerp(BG_TOP[2], BG_BOTTOM[2], t))
        draw.line([(0, y), (WIDTH, y)], fill=c)

    # Subtle grid (every 40px) for texture.
    grid = (31, 31, 31)
    for x in range(0, WIDTH, 40):
        draw.line([(x, 0), (x, HEIGHT)], fill=grid)
    for y in range(0, HEIGHT, 40):
        draw.line([(0, y), (WIDTH, y)], fill=grid)

    # Accent stripe in top-left.
    draw.rectangle([60, 60, 66, 180], fill=ACCENT)

    # Tag label (uppercase).
    mono_22 = load_font(22, mono=True)
    tag_label = (tags or "post").upper()
    draw.text((100, 80), tag_label, fill=TEXT_SECONDARY, font=mono_22)

    # Author byline.
    draw.text((100, 130), "aman behera", fill=ACCENT, font=mono_22)

    # Title (wrapped, big bold sans).
    title_font = load_font(70, bold=True)
    y = 290
    for line in wrap_title(title)[:4]:
        draw.text((60, y), line, fill=TEXT_PRIMARY, font=title_font)
        y += 86

    # Footer: site domain.
    foot_font = load_font(20, mono=True)
    draw.text((60, 570), site, fill=TEXT_SECONDARY, font=foot_font)

    img.save(out, "PNG", optimize=True)


SVG_FALLBACK = '''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0A0A0A"/>
  <rect x="60" y="60" width="6" height="120" fill="#58a6ff"/>
  <text x="100" y="100" font-family="ui-monospace, Menlo, monospace" font-size="22" fill="#888">{tag_label}</text>
  <text x="100" y="145" font-family="ui-monospace, Menlo, monospace" font-size="22" fill="#58a6ff">aman behera</text>
{title_text}
  <text x="60" y="570" font-family="ui-monospace, Menlo, monospace" font-size="20" fill="#888">{site}</text>
</svg>
'''


def render_svg_fallback(title: str, tags: str, site: str, out: str) -> None:
    lines = wrap_title(title)
    y = 290
    title_text = []
    for line in lines[:4]:
        title_text.append(
            f'  <text x="60" y="{y}" font-family="\'IBM Plex Sans\', sans-serif" '
            f'font-size="72" font-weight="600" fill="#e8e8e8" letter-spacing="-1.5">'
            f'{html.escape(line)}</text>'
        )
        y += 86
    svg = SVG_FALLBACK.format(
        tag_label=html.escape((tags or "post").upper()),
        title_text="\n".join(title_text),
        site=html.escape(site),
    )
    with open(out, "w") as f:
        f.write(svg)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--tags", default="")
    ap.add_argument("--site", default="beingamanforever.github.io")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    try:
        render_png(args.slug, args.title, args.tags, args.site, args.out)
    except ImportError:
        # Pillow missing — emit SVG with the same name so the build still works,
        # but the og:image meta will be stale until Pillow is installed.
        sys.stderr.write(
            "warning: Pillow not installed; writing SVG fallback to {}\n".format(args.out)
        )
        if args.out.endswith(".png"):
            args.out = args.out[:-4] + ".svg"
        render_svg_fallback(args.title, args.tags, args.site, args.out)


if __name__ == "__main__":
    main()
