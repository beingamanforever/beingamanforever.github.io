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
    { text: "I am not in danger. I am the danger.", author: "Walter White" },
    { text: "Say my name.", author: "Walter White" },
    { text: "I have to return some videotapes.", author: "Patrick Bateman" },
    { text: "I'm into murders and executions.", author: "Patrick Bateman" },
    { text: "Chaos isn't a pit. Chaos is a ladder.", author: "Petyr Baelish" },
    { text: "Science is the study of change.", author: "Walter White" },
    { text: "There is an idea of a Patrick Bateman.", author: "Patrick Bateman" },
    { text: "Chemistry is the study of matter, but I prefer to see it as the study of change.", author: "Walter White" }
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