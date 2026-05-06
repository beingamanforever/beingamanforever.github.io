# Blogging Playbook

This repo is intentionally static. To publish a post, touch only the files below.

1. Copy the template.

```sh
cp blog/template.html blog/my-post-slug.html
```

2. Edit the title, metadata, and article body in `blog/my-post-slug.html`.

3. Add one object to the `writings` array in `js/main.js`.

```js
{
    title: "My Post Title",
    date: "May 7, 2026",
    readTime: "6 min",
    words: "1200 words",
    author: "Aman",
    excerpt: "One clean sentence that makes someone want to open it.",
    tags: ["systems"],
    url: "blog/my-post-slug.html"
}
```

4. Add the same URL to `sitemap.xml` and a matching item to `feed.xml` when the post is ready.

5. Run the site locally.

```sh
npm run dev
```

Open `http://localhost:3000/blogs.html`, search for the title, and click through once.
