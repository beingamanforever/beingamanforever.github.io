// Dark mode functionality
let darkMode = localStorage.getItem('darkMode') === 'true';

// Text decoding animation
function decodeText(element) {
    const text = element.getAttribute('data-decode') || element.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let iterations = 0;
    const speed = 30; // ms per frame
    const cycles = 3; // how many times to glitch each character
    
    const interval = setInterval(() => {
        element.textContent = text
            .split('')
            .map((char, index) => {
                if (char === ' ') return ' ';
                if (index < iterations / cycles) {
                    return text[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        
        iterations++;
        
        if (iterations >= text.length * cycles) {
            clearInterval(interval);
            element.textContent = text;
        }
    }, speed);
}

// Command palette functionality
let commandPaletteOpen = false;

function openCommandPalette() {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('command-input');
    const output = document.getElementById('command-output');
    palette.style.display = 'flex';
    input.value = '';
    
    // Show available commands on open
    output.innerHTML = `<div style="opacity: 0.7; margin-bottom: 0.5rem;">Available commands:</div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; font-size: 0.85rem;">
            <span>home</span><span style="opacity: 0.6;">→ Home page</span>
            <span>work</span><span style="opacity: 0.6;">→ All projects page</span>
            <span>blogs</span><span style="opacity: 0.6;">→ Blog posts</span>
            <span>contact</span><span style="opacity: 0.6;">→ Contact page</span>
            <span>verify</span><span style="opacity: 0.6;">→ PGP verification</span>
            <span>rss</span><span style="opacity: 0.6;">→ RSS feed</span>
            <span>github</span><span style="opacity: 0.6;">→ Open GitHub profile</span>
            <span>resume</span><span style="opacity: 0.6;">→ View resume PDF</span>
            <span>dashboard</span><span style="opacity: 0.6;">→ Analytics dashboard</span>
            <span>ping</span><span style="opacity: 0.6;">→ Test latency</span>
            <span>clear</span><span style="opacity: 0.6;">→ Clear terminal</span>
            <span>help</span><span style="opacity: 0.6;">→ Show this help</span>
        </div>`;
    
    input.focus();
    commandPaletteOpen = true;
}

function closeCommandPalette() {
    document.getElementById('command-palette').style.display = 'none';
    commandPaletteOpen = false;
}

function executeCommand(cmd) {
    const output = document.getElementById('command-output');
    const commands = {
        'home': () => window.location.href = 'index.html',
        'work': () => window.location.href = 'work.html',
        'blogs': () => window.location.href = 'blogs.html',
        'contact': () => window.location.href = 'contact.html',
        'verify': () => window.location.href = 'verify.html',
        'rss': () => window.location.href = 'rss.html',
        'github': () => window.open('https://github.com/beingamanforever', '_blank'),
        'resume': () => window.open('assets/resume/resume.pdf', '_blank'),
        'dashboard': () => window.location.href = 'dashboard.html',
        'ping': () => { output.textContent = 'pong (14ms)'; setTimeout(closeCommandPalette, 1000); },
        'clear': () => openCommandPalette(), // Reopen to show help
        'help': () => openCommandPalette()
    };
    
    if (commands[cmd]) {
        commands[cmd]();
    } else {
        output.innerHTML = `<span style="color: #ff3b30;">command not found: ${cmd}</span><br><span style="opacity: 0.6; font-size: 0.85rem;">Type 'help' to see available commands</span>`;
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
}

function applyTheme() {
    const body = document.body;
    if (darkMode) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
    
    // Update toggle icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.innerHTML = darkMode 
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
}

// Random quote functionality
const quotes = [
    { text: "I am not in danger. I am the danger.", author: "Walter White, Breaking Bad (2008)" },
    { text: "Say my name.", author: "Walter White, Breaking Bad (2008)" },
    { text: "No more half measures.", author: "Walter White, Breaking Bad (2008)" },
    { text: "You clearly don't know who you're talking to, so let me clue you in.", author: "Walter White, Breaking Bad (2008)" },
    { text: "Say my name....Heisenberg", author: "Walter White, Breaking Bad (2008)" },
    { text: "I am awake.", author: "Walter White, Breaking Bad (2008)" },
    { text: "I'm the one who knocks.", author: "Walter White, Breaking Bad (2008)" },
    { text: "I did it for me, I liked it, I was good at it, I was alive.", author: "Walter White, Breaking Bad (2008)" },
    { text: "Chemistry is the study of matter, but I prefer to see it as the study of change.", author: "Walter White, Breaking Bad (2008)" },
    { text: "I have to return some videotapes.", author: "Patrick Bateman, American Psycho (2000)" },
    { text: "I simply am not there.", author: "Patrick Bateman, American Psycho (2000)" },
    { text: "I have all the characteristics of a human being, but not a single clear, identifiable emotion.", author: "Patrick Bateman, American Psycho (2000)" },
    { text: "This confession has meant nothing.", author: "Patrick Bateman, American Psycho (2000)" },
    { text: "There is an idea of a Patrick Bateman.", author: "Patrick Bateman, American Psycho (2000)" },
    { text: "The only thing standing between you and your goal is the story you keep telling yourself.", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "Successful people are 100% convinced that they are masters of their own destiny.", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "I refuse to settle for mediocrity.", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "Without action, the best intentions in the world are nothing more than that.", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "Winners use words that say 'must' and 'will.'", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "Act as if.", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "There is no nobility in poverty.", author: "Jordan Belfort, The Wolf of Wall Street (2013)" },
    { text: "Chaos isn't a pit. Chaos is a ladder.", author: "Petyr Baelish" }
];

function displayRandomQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteText = document.querySelector('.quote-text');
    const quoteAuthor = document.querySelector('.quote-author');
    
    if (quoteText && quoteAuthor) {
        quoteText.textContent = `"${randomQuote.text}"`;
        quoteAuthor.textContent = `— ${randomQuote.author}`;
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Projects data
const projects = [
    {
        title: "LLM Text Detection",
        description: "AI-Text detection using BERT (Bi-directional encoder representation transformer) to predict if a text is AI-generated or human-authored.",
        tags: ["Python", "BERT", "Transformers"],
        github: "https://github.com/beingamanforever/LLM-Text-Detection",
        stars: "58"
    },
    {
        title: "Tech-Enhanced AI Interview Learning Platform",
        description: "Sophisticated machine learning model generating diverse interview questions aligned with specific topics, with advanced Natural Language Processing integration.",
        tags: ["Python", "Machine Learning", "NLP"],
        github: "https://github.com/beingamanforever/Tech-Enhanced-AI-Interview-Learning-Platform",
        stars: "41"
    },
    {
        title: "Inference Optimization",
        description: "Experimentation with ML inference techniques, testing different optimization methods and benchmarking performance across various models.",
        tags: ["Python", "ML Optimization", "Benchmarking"],
        github: "https://github.com/beingamanforever/Inference-Optimization",
        stars: "2"
    },
    {
        title: "HiLabs",
        description: "Healthcare provider data cleaning solution addressing duplication, inconsistent formatting, missing identifiers, and expired licenses for reliable analysis.",
        tags: ["TypeScript", "Data Processing", "Healthcare"],
        github: "https://github.com/beingamanforever/hilabs"
    },
    {
        title: "Discussions I Took",
        description: "Repository hosting all discussions on Machine Learning, Deep Learning, and Theoretical Computer Science with materials and demonstration notes.",
        tags: ["C++", "Machine Learning", "Theory"],
        github: "https://github.com/beingamanforever/Discussions-I-took",
        stars: "2"
    },
    {
        title: "LexLuthor",
        description: "Superman's core nemesis - A competitive programming and algorithms project.",
        tags: ["C++", "Algorithms", "DSA"],
        github: "https://github.com/beingamanforever/LexLuthor",
        stars: "2"
    }
];

// Writing data
const writings = [
    {
        title: "On the Nature of Systems",
        date: "January 3, 2026",
        readTime: "8 min",
        words: "1593 words",
        author: "Aman",
        excerpt: "Everything is a system. The only question is: do you understand yours?",
        tags: ["systems", "distributed"]
    },
    {
        title: "Notes on Learning",
        date: "December 28, 2025",
        readTime: "5 min",
        words: "987 words",
        author: "Aman",
        excerpt: "The best way to learn is to build. The second best way is to teach.",
        tags: ["learning"]
    }
];

// Notes data
const notes = [
    { title: "Complexity Theory", category: "CS", updated: "Jan 2026" },
    { title: "Thermodynamics", category: "Physics", updated: "Dec 2025" },
    { title: "Game Theory", category: "Mathematics", updated: "Nov 2025" },
    { title: "Unix Philosophy", category: "Systems", updated: "Nov 2025" }
];

// Load projects
function loadProjects(limit = 4) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    const projectsToShow = projects.slice(0, limit);
    container.innerHTML = projectsToShow.map(project => `
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">${project.title}</h3>
                ${project.stars ? `<span class="project-stars">★ ${project.stars}</span>` : ''}
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
            <a href="${project.github}" target="_blank" class="project-link">
                View on GitHub →
            </a>
        </div>
    `).join('');
}

// Load writing
function loadWriting() {
    const container = document.getElementById('writing-container');
    if (!container) return; // Exit if container doesn't exist on this page
    container.innerHTML = writings.map(post => `
        <article class="post-item">
            <h3 class="post-title"><a href="#">${post.title}</a></h3>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-meta">
                <span class="post-meta-item">${post.date}</span>
                <span class="post-meta-separator">·</span>
                <span class="post-meta-item">${post.readTime}</span>
                <span class="post-meta-separator">·</span>
                <span class="post-meta-item">${post.words}</span>
                <span class="post-meta-separator">·</span>
                <span class="post-meta-item">${post.author}</span>
            </div>
        </article>
    `).join('');
}

// Load notes
function loadNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = notes.map(note => `
        <div class="note-card">
            <div class="note-category">${note.category}</div>
            <h3 class="note-title"><a href="#">${note.title}</a></h3>
            <div class="note-date">${note.updated}</div>
        </div>
    `).join('');
}

// Copy to clipboard function
function copyToClipboard(text, sourceEl) {
    const targetEl = sourceEl || (typeof event !== 'undefined' ? event.target : null);
    const showFeedback = () => {
        if (!targetEl) return;

        if (targetEl.tagName === 'BUTTON') {
            const btn = targetEl;
            const original = btn.dataset.copyLabel || btn.textContent;
            btn.dataset.copyLabel = original;

            // Prevent layout shift during label swap
            const lockedWidth = btn.offsetWidth;
            if (lockedWidth > 0) {
                btn.style.minWidth = `${lockedWidth}px`;
            }

            btn.classList.add('is-copied');
            btn.textContent = 'Copied ✓';

            if (btn._copyResetTimer) {
                clearTimeout(btn._copyResetTimer);
            }
            btn._copyResetTimer = setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('is-copied');
                btn.style.minWidth = '';
            }, 900);
        }
    };

    const fallbackCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showFeedback();
        } catch (err) {
            console.error('Copy failed:', err);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showFeedback).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); // Apply saved theme preference
    displayRandomQuote();
    loadProjects();
    loadWriting();
    
    // Text decoding animation for nav logo
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        setTimeout(() => decodeText(navLogo), 500);
    }
    
    // Command palette keyboard shortcut
    document.addEventListener('keydown', (e) => {
        // CMD+K or CTRL+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        // ESC to close
        if (e.key === 'Escape' && commandPaletteOpen) {
            closeCommandPalette();
        }
    });
    
    // Command palette input handler
    const commandInput = document.getElementById('command-input');
    if (commandInput) {
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = e.target.value.trim().toLowerCase();
                if (cmd) executeCommand(cmd);
            }
        });
    }
    
    // Click outside to close palette
    const commandPalette = document.getElementById('command-palette');
    if (commandPalette) {
        commandPalette.addEventListener('click', (e) => {
            if (e.target === commandPalette) {
                closeCommandPalette();
            }
        });
    }
    
    // Add scroll listener for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        
        // Hide scroll indicator after scrolling
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100 && scrollIndicator) {
                scrollIndicator.style.opacity = '0';
            } else if (scrollIndicator) {
                scrollIndicator.style.opacity = '0.5';
            }
            lastScroll = window.scrollY;
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Image loading states
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    const indicator = document.getElementById('kbd-indicator');
    
    // Navigation shortcuts (g + another key)
    if (e.key === 'g' && !window.lastKeyWasG) {
        window.lastKeyWasG = true;
        setTimeout(() => { window.lastKeyWasG = false; }, 1000);
        return;
    }
    
    if (window.lastKeyWasG) {
        window.lastKeyWasG = false;
        switch(e.key) {
            case 'h':
                window.location.href = 'index.html';
                return;
            case 'w':
                window.location.href = 'work.html';
                return;
            case 'b':
                window.location.href = 'blogs.html';
                return;
            case 'c':
                window.location.href = 'contact.html';
                return;
            case 'v':
                window.location.href = 'verify.html';
                return;
            case 'r':
                window.location.href = 'rss.html';
                return;
            case 'g':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
        }
    }
    
    switch(e.key) {
        case 'j':
            // Scroll down
            window.scrollBy({ top: 100, behavior: 'smooth' });
            if (indicator) {
                indicator.textContent = '↓';
                indicator.classList.add('show');
                setTimeout(() => indicator.classList.remove('show'), 200);
            }
            break;
        case 'k':
            // Scroll up
            window.scrollBy({ top: -100, behavior: 'smooth' });
            if (indicator) {
                indicator.textContent = '↑';
                indicator.classList.add('show');
                setTimeout(() => indicator.classList.remove('show'), 200);
            }
            break;
        case 'G':
            // Scroll to bottom
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            if (indicator) {
                indicator.textContent = '⇣';
                indicator.classList.add('show');
                setTimeout(() => indicator.classList.remove('show'), 200);
            }
            break;
        case '/':
            // Focus search if it exists
            e.preventDefault();
            const searchInput = document.getElementById('blog-search-input');
            if (searchInput) {
                searchInput.focus();
            }
            break;
        case '?':
            // Show keyboard shortcuts modal
            e.preventDefault();
            toggleShortcutsModal();
            break;
        case 'Escape':
            // Close modal if open
            closeShortcutsModal();
            break;
    }
});

// Keyboard shortcuts modal
function toggleShortcutsModal() {
    let modal = document.getElementById('shortcuts-modal');
    let overlay = document.getElementById('modal-overlay');
    
    if (!modal) {
        // Create modal if it doesn't exist
        createShortcutsModal();
        modal = document.getElementById('shortcuts-modal');
        overlay = document.getElementById('modal-overlay');
    }
    
    modal.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (modal) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function createShortcutsModal() {
    const modalHTML = `
        <div id="modal-overlay" class="modal-overlay" onclick="closeShortcutsModal()"></div>
        <div id="shortcuts-modal" class="keyboard-shortcuts-modal">
            <div class="modal-header">
                <h3 class="modal-title">$ man shortcuts</h3>
                <button class="modal-close" onclick="closeShortcutsModal()">&times;</button>
            </div>
            <ul class="shortcuts-list">
                <li>
                    <span class="shortcut-category">NAVIGATION</span>
                </li>
                <li>
                    <span>Home</span>
                    <span class="shortcut-key">g h</span>
                </li>
                <li>
                    <span>Work</span>
                    <span class="shortcut-key">g w</span>
                </li>
                <li>
                    <span>Blogs</span>
                    <span class="shortcut-key">g b</span>
                </li>
                <li>
                    <span>Contact</span>
                    <span class="shortcut-key">g c</span>
                </li>
                <li>
                    <span>Verify</span>
                    <span class="shortcut-key">g v</span>
                </li>
                <li>
                    <span>RSS</span>
                    <span class="shortcut-key">g r</span>
                </li>
                <li>
                    <span class="shortcut-category">SCROLLING</span>
                </li>
                <li>
                    <span>Scroll down</span>
                    <span class="shortcut-key">j</span>
                </li>
                <li>
                    <span>Scroll up</span>
                    <span class="shortcut-key">k</span>
                </li>
                <li>
                    <span>Top of page</span>
                    <span class="shortcut-key">g g</span>
                </li>
                <li>
                    <span>Bottom of page</span>
                    <span class="shortcut-key">Shift+G</span>
                </li>
                <li>
                    <span class="shortcut-category">ACTIONS</span>
                </li>
                <li>
                    <span>Focus search</span>
                    <span class="shortcut-key">/</span>
                </li>
                <li>
                    <span>Toggle shortcuts</span>
                    <span class="shortcut-key">?</span>
                </li>
                <li>
                    <span>Close modal</span>
                    <span class="shortcut-key">Esc</span>
                </li>
            </ul>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Update timestamp in footer
function updateTimestamp() {
    const timestampElement = document.getElementById('footer-timestamp');
    if (timestampElement) {
        const now = new Date();
        
        // Current time in IST
        const timeStr = now.toLocaleString('en-US', { 
            timeZone: 'Asia/Kolkata', 
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
        });
        
        // IIT Roorkee coordinates (current)
        const coordsLat = 29.86622359903455;
        const coordsLng = 77.890479390615;
        const coords = `${coordsLat.toFixed(6)}, ${coordsLng.toFixed(6)}`;
        
        // Create clickable time link to world clock
        const timeLink = `<a href="https://www.timeanddate.com/worldclock/converter.html?iso=20260101T000000&p1=tz_ist&p2=0" target="_blank" class="footer-link" title="Compare with your timezone">${timeStr} IST</a>`;
        
        // Create clickable location link to Google Maps
        const locationLink = `<a href="https://www.google.com/maps?q=${coordsLat},${coordsLng}" target="_blank" class="footer-link" title="View on Google Maps">Loc: ${coords}</a>`;
        
        timestampElement.innerHTML = `${timeLink} :: ${locationLink}`;
        timestampElement.style.visibility = '';
    }
}

// Calculate and display performance metrics
function updateMetrics() {
    const metricsElement = document.getElementById('footer-metrics');
    if (metricsElement) {
        const html = document.documentElement ? document.documentElement.outerHTML : '';
        if (!html) {
            metricsElement.remove();
            return;
        }

        // HTML byte size (UTF-8). This is not transfer size.
        let htmlBytes = html.length;
        if (window.TextEncoder) {
            try {
                htmlBytes = new TextEncoder().encode(html).length;
            } catch {
                htmlBytes = html.length;
            }
        }
        const htmlKB = (htmlBytes / 1024).toFixed(2);

        // Render time (DOMContentLoaded end), relative to navigation start.
        let renderMs = null;
        if (performance && typeof performance.getEntriesByType === 'function') {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav && Number.isFinite(nav.domContentLoadedEventEnd) && nav.domContentLoadedEventEnd > 0) {
                renderMs = Math.round(nav.domContentLoadedEventEnd);
            }
        }
        if (renderMs === null && performance && performance.timing) {
            const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            if (Number.isFinite(loadTime) && loadTime > 0) {
                renderMs = Math.round(loadTime);
            }
        }

        metricsElement.textContent = renderMs !== null
            ? `Render: ${renderMs}ms · HTML: ${htmlKB}KB`
            : `HTML: ${htmlKB}KB`;

        metricsElement.style.visibility = '';

        const sepTs = document.getElementById('footer-sep-ts');
        if (sepTs) sepTs.style.visibility = '';

        const sepMetrics = document.getElementById('footer-sep-metrics');
        if (sepMetrics) sepMetrics.style.visibility = '';
    }
}

async function computeSHA256Hex(text) {
    const hasWebCrypto = window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function';
    if (hasWebCrypto) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    return sha256HexFallback(text);
}

function sha256HexFallback(input) {
    // Minimal SHA-256 implementation for non-secure contexts / older browsers.
    // Input is UTF-8 encoded.
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    function ch(x, y, z) { return (x & y) ^ (~x & z); }
    function maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
    function bigSigma0(x) { return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22); }
    function bigSigma1(x) { return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25); }
    function smallSigma0(x) { return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3); }
    function smallSigma1(x) { return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10); }

    function utf8ToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let codePoint = str.charCodeAt(i);

            // Surrogate pair
            if (codePoint >= 0xD800 && codePoint <= 0xDBFF && i + 1 < str.length) {
                const next = str.charCodeAt(i + 1);
                if (next >= 0xDC00 && next <= 0xDFFF) {
                    codePoint = 0x10000 + ((codePoint - 0xD800) << 10) + (next - 0xDC00);
                    i++;
                }
            }

            if (codePoint <= 0x7F) {
                bytes.push(codePoint);
            } else if (codePoint <= 0x7FF) {
                bytes.push(0xC0 | (codePoint >>> 6));
                bytes.push(0x80 | (codePoint & 0x3F));
            } else if (codePoint <= 0xFFFF) {
                bytes.push(0xE0 | (codePoint >>> 12));
                bytes.push(0x80 | ((codePoint >>> 6) & 0x3F));
                bytes.push(0x80 | (codePoint & 0x3F));
            } else {
                bytes.push(0xF0 | (codePoint >>> 18));
                bytes.push(0x80 | ((codePoint >>> 12) & 0x3F));
                bytes.push(0x80 | ((codePoint >>> 6) & 0x3F));
                bytes.push(0x80 | (codePoint & 0x3F));
            }
        }
        return bytes;
    }

    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const bytes = utf8ToBytes(input);
    const bitLen = bytes.length * 8;

    // Append the '1' bit
    bytes.push(0x80);
    // Pad with zeros until length ≡ 56 (mod 64)
    while ((bytes.length % 64) !== 56) {
        bytes.push(0);
    }
    // Append length (64-bit big-endian)
    const hi = Math.floor(bitLen / 0x100000000);
    const lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
    bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

    const w = new Array(64);
    for (let offset = 0; offset < bytes.length; offset += 64) {
        for (let i = 0; i < 16; i++) {
            const j = offset + i * 4;
            w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | (bytes[j + 3])) >>> 0;
        }
        for (let i = 16; i < 64; i++) {
            w[i] = (smallSigma1(w[i - 2]) + w[i - 7] + smallSigma0(w[i - 15]) + w[i - 16]) >>> 0;
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        let f = h5;
        let g = h6;
        let h = h7;

        for (let i = 0; i < 64; i++) {
            const t1 = (h + bigSigma1(e) + ch(e, f, g) + K[i] + w[i]) >>> 0;
            const t2 = (bigSigma0(a) + maj(a, b, c)) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) >>> 0;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }

    function toHex32(x) {
        return x.toString(16).padStart(8, '0');
    }

    return `${toHex32(h0)}${toHex32(h1)}${toHex32(h2)}${toHex32(h3)}${toHex32(h4)}${toHex32(h5)}${toHex32(h6)}${toHex32(h7)}`;
}

function ensureFooterHashElement() {
    const footerHash = document.getElementById('footer-hash');
    if (footerHash) {
        return footerHash;
    }

    const metricsElement = document.getElementById('footer-metrics');
    const colophon = metricsElement ? metricsElement.closest('.footer-colophon') : document.querySelector('.footer-colophon');
    if (!colophon) {
        return null;
    }

    const hashEl = document.createElement('span');
    hashEl.className = 'colophon-item footer-hash';
    hashEl.id = 'footer-hash';
    hashEl.textContent = '';
    hashEl.style.display = 'none';

    const separator = document.createElement('span');
    separator.className = 'colophon-separator';
    separator.id = 'footer-hash-sep';
    separator.textContent = '·';

    if (!metricsElement) {
        colophon.appendChild(separator);
        colophon.appendChild(hashEl);
        return hashEl;
    }

    const metricsSeparator = metricsElement.nextElementSibling;
    if (metricsSeparator && metricsSeparator.classList.contains('colophon-separator')) {
        metricsSeparator.insertAdjacentElement('afterend', hashEl);
        hashEl.insertAdjacentElement('afterend', separator);
        return hashEl;
    }

    metricsElement.insertAdjacentElement('afterend', separator);
    separator.insertAdjacentElement('afterend', hashEl);
    return hashEl;
}

function removeFooterHashElements() {
    const hashEl = document.getElementById('footer-hash');
    const sepEl = document.getElementById('footer-hash-sep');
    if (hashEl) hashEl.remove();
    if (sepEl) sepEl.remove();
}

function buildStableHashInput() {
    const clone = document.body.cloneNode(true);

    const removeSelectors = [
        'script',
        'noscript',
        'iframe',
        '.ring-buffer-scrollbar',
        '#telemetry-header'
    ];
    for (const selector of removeSelectors) {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    }

    const clearSelectors = [
        '#footer-timestamp',
        '#footer-metrics',
        '#footer-hash',
        '.quote-text',
        '.quote-author'
    ];
    for (const selector of clearSelectors) {
        clone.querySelectorAll(selector).forEach(el => {
            el.textContent = '';
        });
    }

    return `${document.title}\n${clone.innerHTML}`;
}

async function updateFooterHash() {
    const hashEl = ensureFooterHashElement();
    if (!hashEl) {
        return;
    }

    try {
        const input = buildStableHashInput();
        const hex = await computeSHA256Hex(input);
        if (!hex) {
            removeFooterHashElements();
            return;
        }

        const shortHex = `${hex.slice(0, 8)}…${hex.slice(-8)}`;
        hashEl.textContent = `sha256: ${shortHex}`;
        hashEl.style.display = '';
    } catch {
        removeFooterHashElements();
    }
}

// Update timestamp every minute
setInterval(updateTimestamp, 60000);
document.addEventListener('DOMContentLoaded', () => {
    updateTimestamp();
    // Wait for page load to calculate metrics
    if (document.readyState === 'complete') {
        updateMetrics();
    } else {
        window.addEventListener('load', updateMetrics);
    }
});

// Ensure metrics are recomputed on bfcache restores.
window.addEventListener('pageshow', () => {
    updateMetrics();
});

window.addEventListener('load', () => {
    updateFooterHash();
});

// Intersection Observer for entrance animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    const sections = document.querySelectorAll('.section, .about-content, .project-card, .post-item');
    sections.forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });
});

// Ring buffer scrollbar
document.addEventListener('DOMContentLoaded', () => {
    const scrollbar = document.createElement('div');
    scrollbar.className = 'ring-buffer-scrollbar';
    
    const head = document.createElement('div');
    head.className = 'ring-buffer-head';
    
    const trail = document.createElement('div');
    trail.className = 'ring-buffer-trail';
    
    scrollbar.appendChild(trail);
    scrollbar.appendChild(head);
    document.body.appendChild(scrollbar);
    
    let trailTimeout;
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const headPosition = (scrollPercent / 100) * (window.innerHeight - 20);
        
        head.style.top = `${headPosition}px`;
        trail.style.height = `${headPosition}px`;
        trail.style.opacity = '1';
        
        clearTimeout(trailTimeout);
        trailTimeout = setTimeout(() => {
            trail.style.opacity = '0';
        }, 300);
    });
});