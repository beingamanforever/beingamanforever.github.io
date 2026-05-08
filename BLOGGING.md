# Blogging Playbook

Posts are plain Markdown. The build script regenerates everything
deterministic — page HTML, blog index, sitemap, and feed.

## Add a post

```sh
./scripts/new-post.sh "My Post Title"
```

This creates `content/posts/YYYY-MM-DD-my-post-title.md` with metadata
prefilled. Edit it:

```text
Title: My Post Title
Date: 2026-05-07
Desc: One clean sentence that makes someone want to open it.
Tags: systems, performance

---

Write Markdown here. Pandoc converts it to HTML.

```c
// Code blocks get syntax highlighting via Prism.
int main() { return 0; }
```
```

## Build

```sh
./scripts/build.sh
```

That's it. The script:

- Renders every `content/posts/*.md` to `posts/*.html` via Pandoc.
- Rebuilds `index.html`, `blog.html`, `work.html`, `contact.html`,
  `404.html` from their `*_template.html` sources.
- Substitutes `_partials/{nav,footer,head_common}.html` into every page.
- Stamps `$YEAR$` and `$CACHEBUST$` (current year + git short SHA).
- Regenerates `sitemap.xml` and `feed.xml` from post metadata.

## Preview locally

```sh
python3 -m http.server 3456
```

Open <http://localhost:3456/blog.html>.

## What you should *not* edit by hand

These files are generated; changes will be overwritten next build:

- `index.html`, `work.html`, `contact.html`, `blog.html`, `404.html`
- `posts/*.html`
- `sitemap.xml`, `feed.xml`

Edit the corresponding `*_template.html`, `template.html`, partials
under `_partials/`, or `data/projects.json` instead.
