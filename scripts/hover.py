"""The hover layer shared by research rows and project cards: a second picture, or a clip site.js plays on hover."""

import html


def hover_layer(src: str) -> str:
    if not src:
        return ""
    src = html.escape(src, quote=True)
    if src.endswith(".mp4"):
        return f'<video class="swap" src="{src}" muted loop playsinline preload="none" aria-hidden="true"></video>'
    return f'<img class="swap" src="{src}" alt="" loading="lazy">'
