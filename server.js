require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const path = require('path');
const Groq = require('groq-sdk');
const feedsConfig = require('./feeds.config');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const app = express();
const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'ClearFeed/1.0 (RSS Reader)'
    }
});

// Cache feeds for 5 minutes to avoid rate limiting
const cache = new NodeCache({ stdTTL: 300 });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Helper: Calculate reading time (words / 200 wpm)
function calculateReadingTime(text) {
    if (!text) return 1;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

// Helper: Strip HTML tags
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// Helper: Get time ago string
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// AI Content Processing with Groq - Cleans headlines and removes bias
async function processWithAI(originalTitle, originalContent) {
    if (!originalContent || originalContent.length < 50) {
        return {
            cleanedTitle: originalTitle,
            summary: originalContent || originalTitle,
            cleanedContent: originalContent || '',
            clarityScore: 75,
            keyPoints: [],
            biasRemoved: false
        };
    }

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are a news de-sensationalizer. Your job is to:
1. Remove clickbait from headlines - make them factual and neutral
2. Rewrite content to be unbiased, factual, and free of sensationalism
3. Remove emotional manipulation, exaggeration, and "brainrot"
4. Keep only verified facts and important information
Respond ONLY with valid JSON, no markdown or extra text.`
                },
                {
                    role: "user",
                    content: `Clean this news article. Remove clickbait, bias, and sensationalism.

ORIGINAL TITLE: ${originalTitle}

ORIGINAL CONTENT: ${originalContent.slice(0, 2000)}

Respond with this exact JSON structure:
{
  "cleanedTitle": "Factual, non-clickbait version of the headline",
  "summary": "2-3 sentence unbiased summary",
  "cleanedContent": "Full article rewritten to be factual, unbiased, and clear. Remove sensationalism and emotional language. Keep only important facts. 3-5 paragraphs.",
  "clarityScore": 85,
  "keyPoints": ["fact 1", "fact 2", "fact 3"]
}`
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        const text = response.choices[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            // Sanitize JSON - remove control characters that break parsing
            let jsonStr = jsonMatch[0]
                .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control chars
                .replace(/\n/g, ' ')               // Replace newlines
                .replace(/\r/g, ' ')               // Replace carriage returns
                .replace(/\t/g, ' ')               // Replace tabs
                .replace(/\s+/g, ' ');             // Collapse whitespace

            try {
                const parsed = JSON.parse(jsonStr);
                console.log(`✓ AI cleaned: "${originalTitle.slice(0, 30)}..." → "${(parsed.cleanedTitle || '').slice(0, 30)}..."`);
                return {
                    cleanedTitle: parsed.cleanedTitle || originalTitle,
                    summary: parsed.summary || originalContent.slice(0, 200),
                    cleanedContent: parsed.cleanedContent || originalContent,
                    clarityScore: Math.min(100, Math.max(1, parsed.clarityScore || 85)),
                    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
                    biasRemoved: true
                };
            } catch (parseError) {
                console.error('JSON parse error:', parseError.message);
            }
        }
    } catch (error) {
        console.error('AI processing error:', error.message);
    }

    // Fallback if AI fails
    return {
        cleanedTitle: originalTitle,
        summary: originalContent.slice(0, 200),
        cleanedContent: originalContent,
        clarityScore: 70,
        keyPoints: [],
        biasRemoved: false
    };
}

// Fetch and parse a single feed with AI cleaning
async function fetchFeed(feedConfig, category) {
    try {
        const feed = await parser.parseURL(feedConfig.url);
        const items = feed.items.slice(0, 5); // Limit to 5 to reduce API calls

        // Process articles with AI - clean headlines and content (sequential to avoid rate limits)
        const articles = [];
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            const rawContent = stripHtml(item.content || item.contentSnippet || item.description || '');
            const originalTitle = item.title || 'Untitled';

            // Add delay between API calls to avoid rate limiting (1 second)
            if (index > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Get AI cleaned content
            const aiResult = await processWithAI(originalTitle, rawContent);

            articles.push({
                id: `${category}-${feedConfig.name}-${index}`,
                originalTitle: originalTitle,
                title: aiResult.cleanedTitle,  // Cleaned headline
                excerpt: aiResult.summary,
                content: rawContent,  // Keep original for reference
                cleanedContent: aiResult.cleanedContent,  // AI-cleaned version
                source: feedConfig.name,
                sourceIcon: feedConfig.icon,
                category: category,
                time: item.pubDate ? timeAgo(item.pubDate) : 'Recently',
                pubDate: item.pubDate || new Date().toISOString(),
                link: item.link || '#',
                readingTime: calculateReadingTime(rawContent),
                originalLength: rawContent.length,
                cleanedLength: aiResult.cleanedContent.length,
                clarityScore: aiResult.clarityScore,
                keyPoints: aiResult.keyPoints,
                biasRemoved: aiResult.biasRemoved
            });
        }

        console.log(`✓ Fetched ${articles.length} articles from ${feedConfig.name} with AI cleaning`);
        return articles;
    } catch (error) {
        console.error(`Error fetching ${feedConfig.name}:`, error.message);
        return [];
    }
}

// Fetch all feeds for a category
async function fetchCategoryFeeds(category) {
    const feeds = feedsConfig[category] || [];
    const results = await Promise.all(
        feeds.map(feed => fetchFeed(feed, category))
    );
    return results.flat();
}

// Fetch all feeds
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

// API Routes

// Get all articles
app.get('/api/feeds', async (req, res) => {
    try {
        const articles = await fetchAllFeeds();
        res.json({
            success: true,
            count: articles.length,
            articles
        });
    } catch (error) {
        console.error('Error fetching feeds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch feeds'
        });
    }
});

// Get articles by category
app.get('/api/feeds/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!feedsConfig[category]) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const cacheKey = `category-${category}`;
        let articles = cache.get(cacheKey);

        if (!articles) {
            articles = await fetchCategoryFeeds(category);
            cache.set(cacheKey, articles);
        }

        res.json({
            success: true,
            count: articles.length,
            articles
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category'
        });
    }
});

// Get available categories
app.get('/api/categories', (req, res) => {
    const categories = Object.keys(feedsConfig).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        sources: feedsConfig[key].map(f => f.name)
    }));
    res.json({ success: true, categories });
});

// Force refresh cache
app.post('/api/refresh', async (req, res) => {
    try {
        cache.flushAll();
        const articles = await fetchAllFeeds();
        res.json({
            success: true,
            message: 'Cache refreshed',
            count: articles.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to refresh'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌿 ClearFeed Server Running                         ║
║                                                       ║
║   Local:    http://localhost:${PORT}                    ║
║   API:      http://localhost:${PORT}/api/feeds          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});
