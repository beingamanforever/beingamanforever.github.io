// Sets html.dark before first paint (loaded without defer, in <head>).
// Preference order: explicit choice in localStorage, then OS setting.
(function () {
    try {
        var stored = localStorage.getItem('theme');
        var dark = stored
            ? stored === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (dark) document.documentElement.classList.add('dark');
    } catch (e) { /* storage blocked: default to light */ }
})();
