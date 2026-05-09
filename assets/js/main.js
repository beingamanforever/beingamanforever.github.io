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

    // Hero quote: pick a random quote on every page load. SSR-rendered fallback
    // stays put if the JSON payload is missing or unparseable.
    (function rotateQuote() {
        const dataEl = document.getElementById('quotes-data');
        const textEl = document.getElementById('quote-text');
        const authorEl = document.getElementById('quote-author');
        if (!dataEl || !textEl || !authorEl) return;
        let quotes;
        try {
            quotes = JSON.parse(dataEl.textContent || '[]');
        } catch {
            return;
        }
        if (!Array.isArray(quotes) || quotes.length === 0) return;
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        if (q && typeof q.text === 'string' && typeof q.author === 'string') {
            textEl.textContent = q.text;
            authorEl.textContent = q.author;
        }
    })();

    // Blog tag filter: click a sidebar button to show only matching post-cards.
    // Hash-based deep links: /blog.html#tag=systems pre-selects that tag.
    (function tagFilter() {
        const buttons = document.querySelectorAll('.tag-filter-btn');
        const cards = document.querySelectorAll('#blog-container .post-card');
        const empty = document.querySelector('.blog-empty');
        if (buttons.length === 0 || cards.length === 0) return;

        const apply = (tag) => {
            let visible = 0;
            cards.forEach((card) => {
                const cardTags = (card.getAttribute('data-tags') || '').split(',').map((t) => t.trim()).filter(Boolean);
                const match = !tag || cardTags.includes(tag);
                card.hidden = !match;
                if (match) visible += 1;
            });
            if (empty) empty.hidden = visible !== 0;
            buttons.forEach((b) => b.classList.toggle('is-active', (b.getAttribute('data-tag') || '') === tag));
        };

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const tag = btn.getAttribute('data-tag') || '';
                if (tag) {
                    history.replaceState(null, '', '#tag=' + encodeURIComponent(tag));
                } else {
                    history.replaceState(null, '', location.pathname + location.search);
                }
                apply(tag);
            });
        });

        // Initial state from hash
        const m = location.hash.match(/^#tag=(.+)$/);
        const initial = m ? decodeURIComponent(m[1]) : '';
        apply(initial);
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
