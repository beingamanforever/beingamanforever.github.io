"""Thin line icons (Lucide paths, ISC licence) shared by the renderers.

Inline SVG keeps the strict Content-Security-Policy intact: no icon font or external sprite.
"""

PATHS = {
    "code": '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    "paper": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>'
    '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "page": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>'
    '<path d="M2 12h20"/>',
    "dataset": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/>'
    '<path d="M3 12a9 3 0 0 0 18 0"/>',
    "model": '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4'
    'a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    "demo": '<path d="M6 3 20 12 6 21Z"/>',
    "accepted": '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74'
    ' 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    "pending": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "topic": '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/>',
    "link": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
}

# Link labels in data/*.json map onto an icon; anything else gets the generic arrow.
LABEL_ICONS = {
    "code": "code",
    "paper": "paper",
    "project page": "page",
    "dataset": "dataset",
    "hugging face": "model",
    "live demo": "demo",
}


def icon(name: str) -> str:
    return (
        '<svg class="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" '
        'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        f"{PATHS.get(name, PATHS['link'])}</svg>"
    )


def label_icon(label: str) -> str:
    return icon(LABEL_ICONS.get(label.strip().lower(), "link"))
