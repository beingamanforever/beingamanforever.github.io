# Aman Behera portfolio

A small, data-driven static portfolio with About, Research, and Athletics pages.

## Build

```sh
./scripts/build.sh
```

The build writes the complete preview to `_site/` and refreshes the root HTML entry files used by GitHub Pages.
It requires only Bash, Python 3, and standard Unix tools.

## Preview

```sh
python3 -m http.server 3456 --directory _site
```

Then open `http://localhost:3456`.

## Sources

- `index_template.html` contains the biography and homepage structure.
- `research_template.html` contains the research page structure.
- `athletics_template.html` contains the Athletics page structure and personal records.
- `_partials/` contains the shared header, metadata, and footer.
- `assets/css/style.css` contains the site styles.
- `assets/fonts/` contains the local Font Awesome brand icon font.
- `assets/icons/` contains the cache-safe browser and touch icons.
- `assets/images/projects/` contains the Selected Projects figures.
- `assets/images/research/` contains Research figures.
- `assets/images/athletics/` contains the Athletics photo.
- `assets/og-home-v2.png` is the current social preview card.
- `data/projects.json` drives Selected Projects.
- `data/news.json` drives News and supports optional grouped `details`.
- `data/research.json` drives every research entry.
- `scripts/build.sh` assembles the site.

Edit source files and rerun the build.
Do not edit files inside `_site/` or generated root HTML files by hand.
