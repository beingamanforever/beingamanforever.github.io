// Tiny ephemeral toast for "copied" / "saved" feedback. Reusable across
// heading-anchor clicks, code copy, contact copy.
function flashToast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
        el = document.createElement('div');
        el.className = 'toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(flashToast._t);
    flashToast._t = setTimeout(() => el.classList.remove('is-visible'), 1400);
}

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle: theme.js applied the initial html.dark class pre-paint;
    // this button flips it and persists the explicit choice.
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const dark = document.documentElement.classList.toggle('dark');
            try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
        });
    }

    // Client-side blog search: lightweight substring scoring over title +
    // tags + snippet, fed by assets/data/search-index.json. Results overwrite
    // the visible post list. Empty query restores the full list (and the
    // active tag filter, which the next IIFE re-applies).
    (function blogSearch() {
        const input = document.getElementById('blog-search-input');
        const container = document.getElementById('blog-container');
        if (!input || !container) return;
        let index = null;
        const fetchIndex = async () => {
            if (index) return index;
            try {
                const r = await fetch('assets/data/search-index.json', { cache: 'no-store' });
                index = await r.json();
            } catch {
                index = [];
            }
            return index;
        };
        const score = (entry, q) => {
            const ql = q.toLowerCase();
            const titleHit = entry.title.toLowerCase().includes(ql) ? 5 : 0;
            const tagHit = (entry.tags || []).some((t) => t.toLowerCase().includes(ql)) ? 3 : 0;
            const snipHit = (entry.snippet || '').toLowerCase().includes(ql) ? 1 : 0;
            return titleHit + tagHit + snipHit;
        };
        const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const renderCard = (e) => `
                <article class="post-card" data-tags="${escape((e.tags || []).join(','))}">
                    <h3 class="post-card-title"><a href="${escape(e.url)}">${escape(e.title)}</a></h3>
                    <p class="post-card-desc">${escape(e.desc || e.snippet || '')}</p>
                    <div class="post-card-meta">
                        <time class="post-card-date" datetime="${escape(e.date)}">${escape(e.date)}</time>
                        <span class="post-card-sep">·</span>
                        <span class="post-card-tags">${escape((e.tags || []).join(', '))}</span>
                    </div>
                </article>`;
        const original = container.innerHTML;
        let timer = 0;
        const apply = async () => {
            const q = input.value.trim();
            if (!q) {
                container.innerHTML = original;
                container.dataset.search = '';
                return;
            }
            const idx = await fetchIndex();
            const ranked = idx
                .map((e) => ({ e, s: score(e, q) }))
                .filter((r) => r.s > 0)
                .sort((a, b) => b.s - a.s)
                .map((r) => r.e);
            container.dataset.search = q;
            container.innerHTML = ranked.length
                ? ranked.map(renderCard).join('\n')
                + '\n                <p class="blog-empty" hidden>No posts match this tag yet.</p>'
                : '<p class="blog-empty">No matches.</p>';
        };
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(apply, 80);
        });
    })();

    // Generic sidebar filter — works for both /blog (data-tag, data-tags on posts)
    // and /work (data-category on a single value per project). Hash-based deep
    // links: /blog.html#tag=systems or /work.html#category=ml pre-selects.
    (function sidebarFilter() {
        const cfg = (() => {
            if (document.querySelector('.tag-filter-btn[data-tag]')) {
                return {
                    btnAttr: 'data-tag',
                    cardAttr: 'data-tags',
                    multi: true,
                    cardSel: '#blog-container .post-card',
                    hashKey: 'tag',
                };
            }
            if (document.querySelector('.tag-filter-btn[data-category]')) {
                return {
                    btnAttr: 'data-category',
                    cardAttr: 'data-category',
                    multi: false,
                    cardSel: '.project-card',
                    hashKey: 'category',
                };
            }
            return null;
        })();
        if (!cfg) return;

        const buttons = document.querySelectorAll(`.tag-filter-btn[${cfg.btnAttr}]`);
        const cards = document.querySelectorAll(cfg.cardSel);
        const empty = document.querySelector('.blog-empty');
        if (buttons.length === 0 || cards.length === 0) return;

        const cardMatches = (card, value) => {
            if (!value) return true;
            if (cfg.multi) {
                const csv = (card.getAttribute(cfg.cardAttr) || '').split(',').map((t) => t.trim()).filter(Boolean);
                return csv.includes(value);
            }
            return (card.getAttribute(cfg.cardAttr) || '').trim() === value;
        };

        const apply = (value) => {
            let visible = 0;
            cards.forEach((card) => {
                const match = cardMatches(card, value);
                card.hidden = !match;
                if (match) visible += 1;
            });
            if (empty) empty.hidden = visible !== 0;
            buttons.forEach((b) => b.classList.toggle('is-active', (b.getAttribute(cfg.btnAttr) || '') === value));
        };

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const value = btn.getAttribute(cfg.btnAttr) || '';
                if (value) {
                    history.replaceState(null, '', `#${cfg.hashKey}=` + encodeURIComponent(value));
                } else {
                    history.replaceState(null, '', location.pathname + location.search);
                }
                apply(value);
            });
        });

        const re = new RegExp(`^#${cfg.hashKey}=(.+)$`);
        const m = location.hash.match(re);
        apply(m ? decodeURIComponent(m[1]) : '');
    })();

    // Reading progress + back-to-top button: only on post pages.
    // The progress bar tracks scroll position through .post-content.
    // The back-to-top button appears once the reader is past 80% through.
    (function postReadingAffordances() {
        const article = document.querySelector('.post-content');
        if (!article) return;

        const bar = document.createElement('div');
        bar.className = 'reading-progress';
        document.body.appendChild(bar);

        const top = document.createElement('button');
        top.type = 'button';
        top.className = 'back-to-top';
        top.setAttribute('aria-label', 'Back to top');
        top.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(top);

        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = article.getBoundingClientRect();
            const total = Math.max(1, article.offsetHeight - window.innerHeight);
            const scrolled = -rect.top;
            const pct = Math.max(0, Math.min(1, scrolled / total));
            bar.style.transform = `scaleX(${pct})`;
            top.classList.toggle('is-visible', pct >= 0.8);
        };
        const schedule = () => {
            if (raf) return;
            raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
    })();

    // Email obfuscation: anchors marked .js-email carry data-user/data-domain
    // (split address parts) — we assemble the mailto: at runtime so scrapers
    // grepping for `mailto:` against rendered HTML come up empty.
    (function emailObfuscation() {
        document.querySelectorAll('.js-email').forEach((el) => {
            const u = el.getAttribute('data-user');
            const d = el.getAttribute('data-domain');
            if (!u || !d) return;
            const addr = `${u}@${d}`;
            el.setAttribute('href', `mailto:${addr}`);
            el.removeAttribute('data-user');
            el.removeAttribute('data-domain');
            // If the link uses a placeholder label, swap to the real address.
            if (el.dataset.emailReveal === 'true' || el.textContent.trim() === '[email]') {
                el.textContent = addr;
            }
        });
    })();

    // Heading anchors inside post content. Adds a hover-revealed `#` link.
    (function headingAnchors() {
        const slugify = (text) => text.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        const used = new Set();
        document.querySelectorAll('.post-content h2, .post-content h3').forEach((h) => {
            if (h.querySelector('.heading-anchor')) return;
            let id = h.id || slugify(h.textContent || '');
            if (!id) return;
            let unique = id;
            let i = 1;
            while (used.has(unique) || (id !== h.id && document.getElementById(unique))) {
                i += 1;
                unique = `${id}-${i}`;
            }
            used.add(unique);
            h.id = unique;
            const a = document.createElement('a');
            a.className = 'heading-anchor';
            a.href = `#${unique}`;
            a.setAttribute('aria-label', `Permalink to ${h.textContent}`);
            a.textContent = '#';
            // Click also copies the deep-link URL and flashes a toast.
            a.addEventListener('click', async (ev) => {
                const url = `${location.origin}${location.pathname}#${unique}`;
                try {
                    await navigator.clipboard.writeText(url);
                    flashToast('Link copied');
                } catch {
                    // Clipboard blocked: fall through, browser still handles the # navigation.
                }
            });
            h.appendChild(a);
        });
    })();

    // Post table of contents: right-rail sticky list of H2/H3 in .post-content.
    // Highlights the active section via IntersectionObserver. Hidden by CSS on
    // narrow viewports; only injected when there are at least 2 headings.
    (function postToc() {
        const article = document.querySelector('.post-content');
        const container = document.querySelector('.post-container');
        if (!article || !container) return;
        const headings = Array.from(article.querySelectorAll('h2[id], h3[id]'));
        if (headings.length < 2) return;

        const aside = document.createElement('aside');
        aside.className = 'post-toc';
        aside.setAttribute('aria-label', 'Table of contents');
        aside.innerHTML = '<h2 class="post-toc-heading">On this page</h2>';
        const list = document.createElement('ol');
        list.className = 'post-toc-list';
        const linkById = new Map();
        headings.forEach((h) => {
            const li = document.createElement('li');
            li.className = h.tagName === 'H3' ? 'post-toc-item is-h3' : 'post-toc-item';
            const a = document.createElement('a');
            a.href = `#${h.id}`;
            a.textContent = h.textContent.replace(/#$/, '').trim();
            li.appendChild(a);
            list.appendChild(li);
            linkById.set(h.id, a);
        });
        aside.appendChild(list);
        container.appendChild(aside);

        // Highlight: a heading is "active" if it is the most recent one whose
        // top has crossed below the navbar boundary.
        const setActive = (id) => {
            linkById.forEach((a, key) => a.classList.toggle('is-active', key === id));
        };
        const onScroll = () => {
            let activeId = headings[0].id;
            const cutoff = 120;
            for (const h of headings) {
                if (h.getBoundingClientRect().top - cutoff <= 0) {
                    activeId = h.id;
                } else {
                    break;
                }
            }
            setActive(activeId);
        };
        let raf = 0;
        const schedule = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => { raf = 0; onScroll(); });
        };
        onScroll();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
    })();

    // Code block toolbar: language label + Copy button. Pandoc emits
    // `<pre class="sourceCode <lang>"><code class="sourceCode <lang>">...`.
    (function codeBlockToolbar() {
        document.querySelectorAll('.post-content pre').forEach((pre) => {
            if (pre.parentElement?.classList.contains('code-block-wrapper')) return;
            const code = pre.querySelector('code');
            const classes = (code?.className || pre.className || '').split(/\s+/);
            const lang = classes.find((c) => c && c !== 'sourceCode') || '';

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            wrapper.appendChild(toolbar);

            if (lang) {
                const label = document.createElement('span');
                label.className = 'code-block-lang';
                label.textContent = lang;
                toolbar.appendChild(label);
            }

            // Compiler Explorer (godbolt) "Run" button for C / C++ blocks. Encodes
            // the snippet as a clientstate payload and opens it with -O3
            // -march=native on a recent compiler.
            if (lang === 'c' || lang === 'cpp' || lang === 'c++') {
                const runBtn = document.createElement('a');
                runBtn.className = 'code-block-godbolt';
                runBtn.target = '_blank';
                runBtn.rel = 'noopener noreferrer';
                runBtn.textContent = 'godbolt ↗';
                runBtn.title = 'Open this snippet on Compiler Explorer';
                runBtn.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    const src = (code || pre).textContent || '';
                    const compilerId = (lang === 'c') ? 'cg132' : 'g132';
                    const ceLang = (lang === 'c') ? 'c' : 'c++';
                    const state = {
                        sessions: [{
                            id: 1,
                            language: ceLang,
                            source: src,
                            compilers: [{
                                id: compilerId,
                                options: '-O3 -march=native -std=c++20',
                                libs: [],
                            }],
                        }],
                    };
                    // base64-url encode the JSON for the clientstate URL.
                    const json = JSON.stringify(state);
                    const b64 = btoa(unescape(encodeURIComponent(json)))
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/, '');
                    window.open('https://godbolt.org/clientstate/' + b64, '_blank', 'noopener');
                });
                toolbar.appendChild(runBtn);
            }

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'code-block-copy';
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', async () => {
                const text = (code || pre).textContent || '';
                try {
                    await navigator.clipboard.writeText(text);
                } catch {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch {}
                    ta.remove();
                }
                copyBtn.classList.add('is-copied');
                copyBtn.textContent = 'Copied';
                flashToast('Code copied');
                setTimeout(() => {
                    copyBtn.classList.remove('is-copied');
                    copyBtn.textContent = 'Copy';
                }, 1400);
            });
            toolbar.appendChild(copyBtn);
        });
    })();

    // Copy-to-clipboard buttons used on the contact page.
    document.querySelectorAll('.copy-btn[data-copy-text]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy-text');
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch {}
                ta.remove();
            }
            const original = btn.textContent;
            btn.classList.add('is-copied');
            btn.textContent = 'Copied';
            setTimeout(() => {
                btn.classList.remove('is-copied');
                btn.textContent = original;
            }, 1200);
        });
    });
});
