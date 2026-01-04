// Load blog posts with optional filtering
function loadBlogs(filterTag = 'all', searchQuery = '') {
    const container = document.getElementById('blogs-container');
    
    let filteredPosts = writings;
    
    // Filter by tag
    if (filterTag !== 'all') {
        filteredPosts = filteredPosts.filter(post => 
            post.tags && post.tags.includes(filterTag)
        );
    }
    
    // Filter by search query
    if (searchQuery) {
        filteredPosts = filteredPosts.filter(post =>
            post.title.toLowerCase().includes(searchQuery) ||
            post.excerpt.toLowerCase().includes(searchQuery) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
        );
    }
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>No posts found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredPosts.map(post => `
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

let currentTag = 'all';
let currentSearch = '';

// Tag filtering
document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();

    // Tag filter functionality
    const tagButtons = document.querySelectorAll('.tag-item');
    tagButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tagButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            currentTag = button.dataset.tag;
            loadBlogs(currentTag, currentSearch);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('blog-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            loadBlogs(currentTag, currentSearch);
        });
    }
});
