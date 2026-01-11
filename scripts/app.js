// ClearFeed - Application Logic (Backend Integration)

// API Base URL
const API_BASE = window.location.origin;

// DOM Elements
const categoryList = document.getElementById('category-list');
const feedContainer = document.getElementById('feed-container');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const articleOverlay = document.getElementById('article-overlay');
const articleContent = document.getElementById('article-content');
const closeArticleBtn = document.getElementById('close-article');
const viewButtons = document.querySelectorAll('.view-btn');
const currentCategoryTitle = document.getElementById('current-category-title');

// State
let articles = [];
let currentCategory = 'all';
let currentView = 'comfortable';
let searchQuery = '';
let isLoading = false;

// Initialize
async function init() {
    setupEventListeners();
    loadTheme();
    await loadArticles();
}

// Fetch articles from API
async function loadArticles() {
    if (isLoading) return;
    isLoading = true;

    showLoading();

    try {
        const endpoint = currentCategory === 'all'
            ? `${API_BASE}/api/feeds`
            : `${API_BASE}/api/feeds/${currentCategory}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.success) {
            articles = data.articles;
            updateCategoryCounts();
            renderArticles();
        } else {
            showError('Failed to load articles');
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        showError('Unable to connect to server. Please try again.');
    } finally {
        isLoading = false;
    }
}

// Show loading state
function showLoading() {
    feedContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Fetching the latest articles...</p>
        </div>
    `;
}

// Show error state
function showError(message) {
    feedContainer.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
            </svg>
            <h3>Oops!</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="loadArticles()">Try Again</button>
        </div>
    `;
}

// Update category counts
function updateCategoryCounts() {
    const categories = ['all', 'technology', 'science', 'business', 'health', 'world'];
    categories.forEach(cat => {
        const count = cat === 'all'
            ? articles.length
            : articles.filter(a => a.category === cat).length;
        const countEl = document.getElementById(`count-${cat}`);
        if (countEl) countEl.textContent = count;
    });
}

// Filter articles
function getFilteredArticles() {
    return articles.filter(article => {
        const matchesCategory = currentCategory === 'all' || article.category === currentCategory;
        const matchesSearch = searchQuery === '' ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.source.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

// Render articles
function renderArticles() {
    const filtered = getFilteredArticles();

    if (filtered.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>No articles found</h3>
                <p>Try adjusting your search or category filter</p>
            </div>
        `;
        return;
    }

    feedContainer.innerHTML = filtered.map(article => `
        <article class="article-card ${article.biasRemoved ? 'cleaned' : 'uncleaned'}" data-id="${article.id}">
            <div class="article-meta">
                <span class="article-source">${article.sourceIcon || '📰'} ${article.source}</span>
                <span class="article-category">${capitalizeFirst(article.category)}</span>
                <span class="article-time">${article.time}</span>
                ${article.biasRemoved
            ? '<span class="cleaned-badge">🧹 Cleaned</span>'
            : '<span class="uncleaned-badge">⚠️ Original</span>'}
            </div>
            <h2 class="article-title">${article.title}</h2>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-footer">
                <div class="reading-info">
                    <span class="reading-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        ${article.readingTime} min read
                    </span>
                    <span class="clarity-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4"/>
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                        ${article.clarityScore}% clarity
                    </span>
                </div>
                <span class="read-more">
                    Read more
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </span>
            </div>
        </article>
    `).join('');

    // Add click listeners to article cards
    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('click', () => openArticle(card.dataset.id));
    });
}

// Open article detail
function openArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    const reduction = Math.round((1 - article.cleanedLength / article.originalLength) * 100);

    // Use cleaned content if available, otherwise fall back to original
    const displayContent = article.cleanedContent || article.content;

    // Show original title if it was cleaned
    const titleWasCleaned = article.originalTitle && article.originalTitle !== article.title;

    articleContent.innerHTML = `
        <div class="article-header">
            <div class="article-meta">
                <span class="article-source">${article.sourceIcon || '📰'} ${article.source}</span>
                <span class="article-category">${capitalizeFirst(article.category)}</span>
                <span class="article-time">${article.time}</span>
                ${article.biasRemoved ? '<span class="bias-badge">🧹 Bias Removed</span>' : ''}
            </div>
            <h1 class="article-title">${article.title}</h1>
            ${titleWasCleaned ? `<p class="original-title">Original: "${article.originalTitle}"</p>` : ''}
            <div class="article-stats">
                <span class="reading-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    ${article.readingTime} min read
                </span>
                <span class="clarity-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    ${article.clarityScore}% clarity
                </span>
                <a href="${article.link}" target="_blank" rel="noopener" class="original-link">
                    View Original ↗
                </a>
            </div>
        </div>
        <div class="article-body">
            ${formatContent(displayContent)}
        </div>
        ${article.keyPoints && article.keyPoints.length > 0 ? `
        <div class="key-points">
            <h4>Key Facts</h4>
            <ul>
                ${article.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        <div class="original-comparison">
            <h4>AI Clarity Report</h4>
            <div class="comparison-stats">
                <div class="comparison-stat">
                    <span class="value">${reduction > 0 ? reduction : 0}%</span>
                    <span class="label">Noise removed</span>
                </div>
                <div class="comparison-stat">
                    <span class="value">${article.clarityScore}%</span>
                    <span class="label">Clarity score</span>
                </div>
                <div class="comparison-stat">
                    <span class="value">${article.biasRemoved ? '✓' : '—'}</span>
                    <span class="label">Bias cleaned</span>
                </div>
            </div>
        </div>
    `;

    articleOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Format content into paragraphs
function formatContent(content) {
    if (!content) return '<p>No content available.</p>';

    // Split by double newlines or periods followed by space
    const paragraphs = content.split(/\n\n|\. (?=[A-Z])/)
        .filter(p => p.trim().length > 0)
        .map(p => `<p>${p.trim()}${p.endsWith('.') ? '' : '.'}</p>`)
        .join('');

    return paragraphs || `<p>${content}</p>`;
}

// Close article
function closeArticle() {
    articleOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Refresh feeds
async function refreshFeeds() {
    try {
        await fetch(`${API_BASE}/api/refresh`, { method: 'POST' });
        await loadArticles();
    } catch (error) {
        console.error('Error refreshing:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Category navigation
    categoryList.addEventListener('click', async (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        currentCategory = navItem.dataset.category;
        currentCategoryTitle.textContent = navItem.querySelector('span').textContent;

        // For "all", we use cached data; for specific categories, filter locally
        renderArticles();
    });

    // Search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            renderArticles();
        }, 300);
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Close article
    closeArticleBtn.addEventListener('click', closeArticle);
    articleOverlay.addEventListener('click', (e) => {
        if (e.target === articleOverlay) closeArticle();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeArticle();
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            refreshFeeds();
        }
    });

    // View toggle
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            feedContainer.classList.toggle('compact', currentView === 'compact');
        });
    });
}

// Theme functions
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('clearfeed-theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('clearfeed-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Utility
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);
