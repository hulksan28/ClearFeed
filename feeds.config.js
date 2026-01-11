// RSS Feed Configuration
// Maps categories to their RSS sources

module.exports = {
    technology: [
        {
            name: 'Hacker News',
            url: 'https://hnrss.org/frontpage',
            icon: '🔶'
        },
        {
            name: 'TechCrunch',
            url: 'https://techcrunch.com/feed/',
            icon: '💚'
        },
        {
            name: 'Ars Technica',
            url: 'https://feeds.arstechnica.com/arstechnica/index',
            icon: '🔷'
        }
    ],
    science: [
        {
            name: 'NASA',
            url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
            icon: '🚀'
        },
        {
            name: 'Science Daily',
            url: 'https://www.sciencedaily.com/rss/all.xml',
            icon: '🔬'
        }
    ],
    business: [
        {
            name: 'Reuters Business',
            url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
            icon: '📊'
        }
    ],
    health: [
        {
            name: 'Medical News Today',
            url: 'https://www.medicalnewstoday.com/rss/health-news',
            icon: '🏥'
        }
    ],
    world: [
        {
            name: 'BBC World',
            url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
            icon: '🌍'
        },
        {
            name: 'NPR News',
            url: 'https://feeds.npr.org/1001/rss.xml',
            icon: '📻'
        }
    ]
};
