// Theme toggle: persists choice in localStorage; respects prefers-color-scheme
// when the user has never explicitly toggled.
(function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    document.body.classList.toggle('dark-mode', isDark);
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

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
            h.appendChild(a);
        });
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
