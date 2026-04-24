const fs = require('fs');
const path = require('path');

function extractBlogSlugs() {
    try {
        const source = fs.readFileSync(path.join(__dirname, 'config', 'blog-posts.ts'), 'utf8');
        const matches = [...source.matchAll(/slug:\s*'([^']+)'/g)];
        return matches.map((match) => match[1]);
    } catch (error) {
        console.warn('Failed to extract blog slugs for sitemap:', error);
        return [];
    }
}

function extractPromptCategorySlugs() {
    try {
        const source = fs.readFileSync(path.join(__dirname, 'config', 'prompts-data.ts'), 'utf8');
        const matches = [...source.matchAll(/slug:\s*"([^"]+)"/g)];
        return matches.map((match) => match[1]);
    } catch (error) {
        console.warn('Failed to extract prompt category slugs for sitemap:', error);
        return [];
    }
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://gptimage2.online',
    generateRobotsTxt: true,
    generateIndexSitemap: false,

    // Exclude pages that shouldn't be indexed
    exclude: [
        '/api/*',           // API routes
        '/_next/*',         // Next.js system files
        '/server-sitemap.xml',
        '/icon.svg',
        '/apple-icon.png',
        '/robots.txt',      // robots.txt is not a page
        '/*/sign-in',       // Auth pages
        '/*/sign-up',
        '/*/forgot-password',
        '/*/dashboard',     // User dashboard (private)
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/_next/',
                    '/*/sign-in',
                    '/*/sign-up',
                    '/*/forgot-password',
                    '/*/dashboard',
                ],
            },
        ],
    },

    // Add additional paths for GPT Image 2 Generator
    additionalPaths: async (config) => {
        const locales = ['en', 'zh'];
        const staticPages = [
            'create',          // AI Studio (public landing page)
            'prompts',
            'pricing',
            'privacy',
            'terms',
            'about',
            'gallery',
            'developer-api',
            'arena'
        ];

        const blogSlugs = extractBlogSlugs();
        const promptCategorySlugs = extractPromptCategorySlugs();

        const result = [];

        // Add static pages
        for (const locale of locales) {
            result.push({
                loc: `/${locale}`,
                changefreq: 'daily',
                priority: 1.0,
                lastmod: new Date().toISOString(),
            });

            for (const page of staticPages) {
                let priority = 0.8;
                let changefreq = 'weekly';

                if (page === 'create') {
                    priority = 0.95;  // High priority for main product page
                    changefreq = 'daily';
                } else if (page === 'pricing') {
                    priority = 0.85;
                } else if (page === 'privacy' || page === 'terms') {
                    priority = 0.5;
                    changefreq = 'monthly';
                }

                result.push({
                    loc: `/${locale}/${page}`,
                    changefreq,
                    priority,
                    lastmod: new Date().toISOString(),
                });
            }

            for (const category of promptCategorySlugs) {
                result.push({
                    loc: `/${locale}/prompts/${category}`,
                    changefreq: 'weekly',
                    priority: 0.82,
                    lastmod: new Date().toISOString(),
                });
            }

            // Add blog index page
            result.push({
                loc: `/${locale}/blog`,
                changefreq: 'daily',
                priority: 0.9,
                lastmod: new Date().toISOString(),
            });

            // Add individual blog posts
            for (const slug of blogSlugs) {
                result.push({
                    loc: `/${locale}/blog/${slug}`,
                    changefreq: 'weekly',
                    priority: 0.85,
                    lastmod: new Date().toISOString(),
                });
            }
        }

        return result;
    },


    transform: async (config, path) => {
        // Add priority and changefreq based on page type
        let priority = 0.7;
        let changefreq = 'weekly';

        if (path === '/en' || path === '/zh') {
            // Homepage has highest priority
            priority = 1.0;
            changefreq = 'daily';
        } else if (path.includes('/create')) {
            // AI Studio page is very important
            priority = 0.95;
            changefreq = 'daily';
        } else if (path.includes('/pricing')) {
            priority = 0.8;
            changefreq = 'weekly';
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: new Date().toISOString(),
        };
    },
};
