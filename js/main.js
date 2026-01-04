// Dark mode functionality
let darkMode = localStorage.getItem('darkMode') === 'true';

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
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Optional: show a subtle feedback
        const feedback = document.createElement('span');
        feedback.textContent = ' ✓ copied';
        feedback.style.cssText = 'color: var(--walter-green); font-size: 0.75rem; margin-left: 0.5rem; opacity: 0; transition: opacity 0.3s;';
        event.target.appendChild(feedback);
        setTimeout(() => feedback.style.opacity = '1', 10);
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 1500);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); // Apply saved theme preference
    displayRandomQuote();
    loadProjects();
    loadWriting();
    
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
                <h3 class="modal-title">Keyboard Shortcuts</h3>
                <button class="modal-close" onclick="closeShortcutsModal()">&times;</button>
            </div>
            <ul class="shortcuts-list">
                <li>
                    <span>Scroll down</span>
                    <span class="shortcut-key">j</span>
                </li>
                <li>
                    <span>Scroll up</span>
                    <span class="shortcut-key">k</span>
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
        
        // Roorkee coordinates
        const coords = '30.668° N, 77.891° E';
        
        // Create clickable time link to world clock
        const timeLink = `<a href="https://www.timeanddate.com/worldclock/converter.html?iso=20260101T000000&p1=tz_ist&p2=0" target="_blank" class="footer-link" title="Compare with your timezone">${timeStr} IST</a>`;
        
        // Create clickable location link to Google Maps
        const locationLink = `<a href="https://www.google.com/maps/search/?api=1&query=30.668,77.891" target="_blank" class="footer-link" title="View on Google Maps">Loc: ${coords}</a>`;
        
        timestampElement.innerHTML = `${timeLink} :: ${locationLink}`;
    }
}

// Calculate and display performance metrics
function updateMetrics() {
    const metricsElement = document.getElementById('footer-metrics');
    if (metricsElement) {
        // Calculate page size in KB
        const pageSize = (document.documentElement.outerHTML.length / 1024).toFixed(2);
        
        // Get page load time using Performance API
        if (performance && performance.timing) {
            const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            metricsElement.textContent = `Render: ${loadTime}ms :: Payload: ${pageSize}KB`;
        } else {
            metricsElement.textContent = `Payload: ${pageSize}KB`;
        }
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

// Performance telemetry header
window.addEventListener('load', () => {
    const telemetryEl = document.getElementById('telemetry-header');
    if (telemetryEl && performance && performance.timing) {
        const perf = performance.timing;
        const renderTime = perf.domContentLoadedEventEnd - perf.navigationStart;
        const paintTime = perf.loadEventEnd - perf.loadEventStart;
        telemetryEl.textContent = `Render: ${renderTime}ms | Paint: ${paintTime}ms`;
    }
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