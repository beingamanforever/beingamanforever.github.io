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
