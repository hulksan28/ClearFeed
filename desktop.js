const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');

let mainWindow;
let server;

// ===== Embedded Server Logic =====
const expressApp = express();
const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'ClearFeed/1.0 (RSS Reader)'
    }
});

const cache = new NodeCache({ stdTTL: 300 });

// Load feeds config
const feedsConfig = require(path.join(__dirname, 'feeds.config.js'));

// Helper functions
function calculateReadingTime(text) {
    if (!text) return 1;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

async function fetchFeed(feedConfig, category) {
    try {
        const feed = await parser.parseURL(feedConfig.url);
        return feed.items.slice(0, 10).map((item, index) => ({
            id: `${category}-${feedConfig.name}-${index}`,
            title: item.title || 'Untitled',
            excerpt: stripHtml(item.contentSnippet || item.content || item.description || '').slice(0, 300),
            content: stripHtml(item.content || item.contentSnippet || item.description || ''),
            source: feedConfig.name,
            sourceIcon: feedConfig.icon,
            category: category,
            time: item.pubDate ? timeAgo(item.pubDate) : 'Recently',
            pubDate: item.pubDate || new Date().toISOString(),
            link: item.link || '#',
            readingTime: calculateReadingTime(item.content || item.contentSnippet || ''),
            originalLength: Math.floor(Math.random() * 1000) + 800,
            cleanedLength: Math.floor(Math.random() * 400) + 300,
            clarityScore: Math.floor(Math.random() * 10) + 88
        }));
    } catch (error) {
        console.error(`Error fetching ${feedConfig.name}:`, error.message);
        return [];
    }
}

async function fetchCategoryFeeds(category) {
    const feeds = feedsConfig[category] || [];
    const results = await Promise.all(
        feeds.map(feed => fetchFeed(feed, category))
    );
    return results.flat();
}

async function fetchAllFeeds() {
    const cacheKey = 'all-feeds';
    const cached = cache.get(cacheKey);
    if (cached) {
        console.log('Serving cached feeds');
        return cached;
    }

    console.log('Fetching fresh feeds...');
    const categories = Object.keys(feedsConfig);
    const results = await Promise.all(
        categories.map(category => fetchCategoryFeeds(category))
    );

    const allArticles = results.flat()
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    cache.set(cacheKey, allArticles);
    return allArticles;
}

// Setup Express middleware and routes
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.static(__dirname));

expressApp.get('/api/feeds', async (req, res) => {
    try {
        const articles = await fetchAllFeeds();
        res.json({ success: true, count: articles.length, articles });
    } catch (error) {
        console.error('Error fetching feeds:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch feeds' });
    }
});

expressApp.get('/api/feeds/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!feedsConfig[category]) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        const cacheKey = `category-${category}`;
        let articles = cache.get(cacheKey);
        if (!articles) {
            articles = await fetchCategoryFeeds(category);
            cache.set(cacheKey, articles);
        }
        res.json({ success: true, count: articles.length, articles });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch category' });
    }
});

expressApp.get('/api/categories', (req, res) => {
    const categories = Object.keys(feedsConfig).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        sources: feedsConfig[key].map(f => f.name)
    }));
    res.json({ success: true, categories });
});

expressApp.post('/api/refresh', async (req, res) => {
    try {
        cache.flushAll();
        const articles = await fetchAllFeeds();
        res.json({ success: true, message: 'Cache refreshed', count: articles.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to refresh' });
    }
});

// Start the embedded Express server
function startServer() {
    return new Promise((resolve, reject) => {
        const PORT = 3000;
        server = expressApp.listen(PORT, () => {
            console.log(`ClearFeed Server Running on http://localhost:${PORT}`);
            resolve();
        }).on('error', (err) => {
            console.error('Server error:', err);
            reject(err);
        });
    });
}

// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'ClearFeed',
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        frame: true,
        titleBarStyle: 'default',
        autoHideMenuBar: true,
        show: false
    });

    // Load the app from the local server
    mainWindow.loadURL('http://localhost:3000');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle events
app.whenReady().then(async () => {
    try {
        console.log('Starting ClearFeed server...');
        await startServer();
        console.log('Server started, creating window...');
        createWindow();
    } catch (error) {
        console.error('Failed to start:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    // Close the embedded server
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (server) {
        server.close();
    }
});
