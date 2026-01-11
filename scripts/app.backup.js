// ClearFeed - Application Logic

// Mock data simulating AI-cleaned articles
const articles = [
    {
        id: 1,
        title: "OpenAI Announces GPT-5 with Improved Reasoning Capabilities",
        excerpt: "OpenAI has released GPT-5, featuring enhanced logical reasoning and reduced hallucinations. The model shows 40% improvement in complex problem-solving tasks compared to its predecessor.",
        content: `OpenAI has officially announced GPT-5, the latest iteration of its large language model series. The new model demonstrates significant improvements in logical reasoning and factual accuracy.

Key improvements include a 40% boost in complex problem-solving benchmarks, reduced tendency to generate false information, and better understanding of nuanced instructions. The model also shows improved performance in mathematical reasoning and code generation tasks.

The release comes after 18 months of development and extensive safety testing. OpenAI states that GPT-5 underwent rigorous red-teaming exercises and alignment training to ensure safer outputs.

Enterprise availability begins in January, with consumer access expected by March. Pricing remains comparable to GPT-4 Turbo rates.`,
        source: "TechCrunch",
        category: "technology",
        time: "2 hours ago",
        readingTime: 3,
        originalLength: 1847,
        cleanedLength: 687,
        clarityScore: 94
    },
    {
        id: 2,
        title: "NASA's James Webb Telescope Detects New Exoplanet with Water Vapor",
        excerpt: "Astronomers using the James Webb Space Telescope have confirmed the presence of water vapor in the atmosphere of a super-Earth located 48 light-years away.",
        content: `The James Webb Space Telescope has detected water vapor in the atmosphere of exoplanet K2-18 b, a super-Earth orbiting within the habitable zone of its star. This finding marks a significant step in the search for potentially habitable worlds.

K2-18 b is approximately 8.6 times the mass of Earth and orbits a red dwarf star 48 light-years from our solar system. The planet's atmosphere shows clear signatures of water vapor, along with potential traces of methane and carbon dioxide.

The detection was made using Webb's NIRSpec instrument, which analyzed light passing through the planet's atmosphere during a transit event. Scientists caution that the presence of water doesn't confirm habitability, as surface conditions remain unknown.

Further observations are planned for 2024 to better characterize the atmospheric composition and determine if conditions could support life as we know it.`,
        source: "NASA",
        category: "science",
        time: "4 hours ago",
        readingTime: 4,
        originalLength: 2156,
        cleanedLength: 892,
        clarityScore: 91
    },
    {
        id: 3,
        title: "Federal Reserve Holds Interest Rates Steady at 5.25-5.50%",
        excerpt: "The Federal Reserve maintained its benchmark interest rate, citing progress on inflation while signaling potential cuts in 2024 if economic conditions allow.",
        content: `The Federal Reserve concluded its December meeting by keeping the federal funds rate unchanged at 5.25% to 5.50%, marking the third consecutive pause in rate increases.

Fed Chair Jerome Powell indicated that while inflation has decreased from its 2022 peak, it remains above the 2% target. The committee's projections suggest three potential rate cuts in 2024, contingent on continued progress toward price stability.

Economic data shows the U.S. economy growing at 2.4% annually, with unemployment holding at 3.7%. Consumer spending remains resilient despite higher borrowing costs.

Markets responded positively to the announcement, with major indices gaining approximately 1.5%. Bond yields declined as investors priced in the likelihood of easier monetary policy ahead.`,
        source: "Reuters",
        category: "business",
        time: "5 hours ago",
        readingTime: 3,
        originalLength: 1634,
        cleanedLength: 756,
        clarityScore: 96
    },
    {
        id: 4,
        title: "New Study Links Mediterranean Diet to 25% Reduced Heart Disease Risk",
        excerpt: "A 12-year study involving 25,000 participants found that strict adherence to the Mediterranean diet significantly reduces cardiovascular disease risk.",
        content: `A comprehensive study published in the New England Journal of Medicine has found that strict adherence to the Mediterranean diet reduces cardiovascular disease risk by 25% compared to standard dietary patterns.

The research followed 25,000 participants over 12 years across seven countries. Those who consistently consumed olive oil, fish, whole grains, and vegetables while limiting red meat and processed foods showed markedly better cardiovascular outcomes.

Key findings include a 30% reduction in stroke risk, 20% lower incidence of type 2 diabetes, and improved cholesterol profiles. Researchers emphasized that benefits were most pronounced when the diet was combined with regular physical activity.

The study controlled for factors including age, smoking status, and pre-existing conditions. Authors recommend the Mediterranean diet as a primary prevention strategy for heart disease.`,
        source: "NEJM",
        category: "health",
        time: "6 hours ago",
        readingTime: 4,
        originalLength: 1923,
        cleanedLength: 823,
        clarityScore: 93
    },
    {
        id: 5,
        title: "European Union Reaches Agreement on Comprehensive AI Regulation",
        excerpt: "EU lawmakers have finalized the AI Act, establishing the world's first comprehensive legal framework for artificial intelligence development and deployment.",
        content: `The European Union has reached a landmark agreement on the AI Act, creating the world's first comprehensive regulatory framework for artificial intelligence. The legislation will come into effect in phases over the next two years.

Key provisions include mandatory risk assessments for high-risk AI systems, transparency requirements for generative AI, and prohibitions on certain uses such as social scoring and real-time biometric surveillance in public spaces.

Companies developing AI systems will need to ensure their products meet safety and transparency standards before European deployment. Non-compliance can result in fines up to 7% of global annual revenue.

Tech industry representatives have expressed mixed reactions, with some praising the clarity while others warn of potential innovation constraints. The regulation is expected to influence AI governance approaches worldwide.`,
        source: "Euronews",
        category: "technology",
        time: "8 hours ago",
        readingTime: 4,
        originalLength: 2089,
        cleanedLength: 856,
        clarityScore: 92
    },
    {
        id: 6,
        title: "Climate Summit Concludes with $100 Billion Annual Green Fund Commitment",
        excerpt: "COP28 concluded with nations agreeing to triple renewable energy capacity by 2030 and establish a $100 billion annual fund for climate adaptation in developing countries.",
        content: `The COP28 climate summit in Dubai has concluded with significant commitments from participating nations. Key outcomes include a pledge to triple global renewable energy capacity by 2030 and the establishment of a $100 billion annual climate adaptation fund.

For the first time, the summit's final declaration includes language on transitioning away from fossil fuels, though critics note the absence of explicit phase-out timelines. Over 100 countries have signed the renewable energy pledge.

The climate adaptation fund will prioritize vulnerable nations facing immediate climate impacts. Contributions come primarily from developed nations and major oil-producing states.

Implementation mechanisms remain under negotiation, with working groups tasked with creating accountability frameworks by mid-2024. Environmental organizations have characterized the outcome as progress, while emphasizing the need for stronger enforcement.`,
        source: "UN News",
        category: "world",
        time: "10 hours ago",
        readingTime: 4,
        originalLength: 2234,
        cleanedLength: 912,
        clarityScore: 90
    },
    {
        id: 7,
        title: "Apple Introduces M3 Ultra Chip for Professional Mac Workstations",
        excerpt: "Apple has unveiled the M3 Ultra, its most powerful chip yet, designed for Mac Pro and Mac Studio workstations with up to 80 GPU cores.",
        content: `Apple has announced the M3 Ultra chip, the culmination of its third-generation Apple Silicon family. The processor is designed for professional Mac workstations requiring maximum computational power.

The M3 Ultra features up to 32 CPU cores and 80 GPU cores, with support for 192GB of unified memory. Apple claims 2.5x faster rendering performance compared to the M1 Ultra in professional video and 3D applications.

New capabilities include hardware-accelerated ray tracing for improved graphics rendering and enhanced Neural Engine for machine learning workloads. The chip uses a 3nm manufacturing process, improving power efficiency.

The M3 Ultra will power updated Mac Pro and Mac Studio configurations, with availability beginning in February. Pricing starts at $3,999 for the Mac Studio configuration.`,
        source: "Apple Newsroom",
        category: "technology",
        time: "12 hours ago",
        readingTime: 3,
        originalLength: 1567,
        cleanedLength: 723,
        clarityScore: 95
    },
    {
        id: 8,
        title: "Global Semiconductor Shortage Expected to Ease by Mid-2024",
        excerpt: "Industry analysts project the chip shortage affecting automotive and electronics industries will substantially improve as new fabrication facilities come online.",
        content: `The global semiconductor shortage that has constrained automotive and electronics production since 2021 is expected to ease significantly by mid-2024, according to industry analysts.

Major chip manufacturers including TSMC, Samsung, and Intel have brought new fabrication facilities online, increasing global production capacity by approximately 15%. Additional plants in the United States, Japan, and Europe are scheduled to begin production within the next 18 months.

Automotive manufacturers, which have been particularly affected, report improved chip allocation. Wait times for new vehicles have decreased from 12 weeks to approximately 6 weeks for most models.

Consumer electronics availability has already improved, with gaming console supply reaching normal levels. Analysts caution that advanced chips for AI applications may remain constrained as demand continues to outpace production in that segment.`,
        source: "Bloomberg",
        category: "business",
        time: "14 hours ago",
        readingTime: 4,
        originalLength: 1876,
        cleanedLength: 834,
        clarityScore: 93
    }
];

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
let currentCategory = 'all';
let currentView = 'comfortable';
let searchQuery = '';

// Initialize
function init() {
    updateCategoryCounts();
    renderArticles();
    setupEventListeners();
    loadTheme();
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
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
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
        <article class="article-card" data-id="${article.id}">
            <div class="article-meta">
                <span class="article-source">${article.source}</span>
                <span class="article-category">${capitalizeFirst(article.category)}</span>
                <span class="article-time">${article.time}</span>
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
                        ${Math.round((1 - article.cleanedLength / article.originalLength) * 100)}% cleaner
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
        card.addEventListener('click', () => openArticle(parseInt(card.dataset.id)));
    });
}

// Open article detail
function openArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    const reduction = Math.round((1 - article.cleanedLength / article.originalLength) * 100);

    articleContent.innerHTML = `
        <div class="article-header">
            <div class="article-meta">
                <span class="article-source">${article.source}</span>
                <span class="article-category">${capitalizeFirst(article.category)}</span>
                <span class="article-time">${article.time}</span>
            </div>
            <h1 class="article-title">${article.title}</h1>
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
                    ${article.clarityScore}% clarity score
                </span>
            </div>
        </div>
        <div class="article-body">
            ${article.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
        <div class="original-comparison">
            <h4>AI Clarity Report</h4>
            <div class="comparison-stats">
                <div class="comparison-stat">
                    <span class="value">${reduction}%</span>
                    <span class="label">Shorter than original</span>
                </div>
                <div class="comparison-stat">
                    <span class="value">${article.originalLength}</span>
                    <span class="label">Original word count</span>
                </div>
                <div class="comparison-stat">
                    <span class="value">${article.cleanedLength}</span>
                    <span class="label">Refined word count</span>
                </div>
                <div class="comparison-stat">
                    <span class="value">${article.clarityScore}%</span>
                    <span class="label">Clarity score</span>
                </div>
            </div>
        </div>
    `;

    articleOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close article
function closeArticle() {
    articleOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Set up event listeners
function setupEventListeners() {
    // Category navigation
    categoryList.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        currentCategory = navItem.dataset.category;
        currentCategoryTitle.textContent = navItem.querySelector('span').textContent;
        renderArticles();
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderArticles();
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
