# Blogging from HackMD

Posts are Markdown files in `blog/`.
Every push to `main` rebuilds the site, so publishing a post is one HackMD button.

## One-time setup

1. In HackMD, open **Settings → GitHub** and connect your GitHub account.
2. Grant it access to `beingamanforever/beingamanforever.github.io`.

## Write and publish

1. Create a note in HackMD and start it with this header (copy `blog/_template.md`):

   ```yaml
   ---
   title: "Post title"
   date: 2026-10-04
   description: "One sentence for the card."
   tags: rag, graphs
   tile: Leiden
   ---
   ```

2. Write normally. Pasted images upload to HackMD and keep working on the site. Math (`$x$`, `$$...$$`), tables, code blocks and `:::info` boxes render too.

   Optional header lines:

   ```yaml
   cover: assets/images/posts/<slug>/cover.jpg   # thumbnail in lists and the social card
   hero: false                                    # keep the cover off the top of the post
   film: true                                     # adds a Film badge to the thumbnail
   series: Seeing straight                        # with part: 1, 2, 3 ... adds a series box and next/previous links
   part: 1
   canonical: https://...                         # where the post first appeared
   ```

   Headings (`##`, `###`) build the "On this page" box automatically.
   Interactive pages live in `viz/<name>/index.html` and embed with an `.embed` iframe, as in `blog/fourier-for-images.md`.
3. Open the note menu **⋯ → Versions and GitHub Sync → Push**.
   Pick the repository, branch `main`, and file path `blog/<slug>.md`.
   The slug becomes the URL: `beingamanforever.github.io/blog/<slug>`.
4. GitHub Actions builds and deploys in about a minute.

Edit later from the same note and push again.
Add `draft: true` to the header to keep a pushed post off the site.

## Local preview

```sh
./scripts/build.sh
python3 scripts/serve.py 3456
```

The build needs [Pandoc](https://pandoc.org/installing.html) 3.8 or newer.
