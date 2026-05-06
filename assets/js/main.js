// Theme Toggle Logic
const initTheme = () => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
};

const toggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});
