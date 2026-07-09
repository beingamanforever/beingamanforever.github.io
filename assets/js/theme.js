// Sets html.dark before first paint (loaded without defer, in <head>).
// Default to light; only use dark after an explicit saved choice.
(function () {
    try {
        var stored = localStorage.getItem('theme');
        if (stored === 'dark') document.documentElement.classList.add('dark');
    } catch (e) { /* storage blocked: default to light */ }
})();
