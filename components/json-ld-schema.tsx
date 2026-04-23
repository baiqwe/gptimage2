/**
 * JSON-LD Structured Data for SoftwareApplication
 * Helps search engines understand GPT Image 2 Generator as a web application
 * 
 * Note: This is a server component to avoid hydration issues
 */
import { getTranslations } from 'next-intl/server';
import { ALL_PLANS } from '@/config/pricing';
import { siteConfig } from '@/config/site';

export async function SoftwareApplicationSchema({ locale, pagePath = '' }: { locale: string; pagePath?: string }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    const isZh = locale === 'zh';
    const prices = ALL_PLANS.map((plan) => plan.price);
    const lowPrice = Math.min(...prices).toFixed(2);
    const highPrice = Math.max(...prices).toFixed(2);
    const currentUrl = `${siteConfig.url}/${locale}${pagePath}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": isZh ? 'GPT Image 2 AI 绘图工作台' : 'GPT Image 2 AI Image Workspace',
        "url": currentUrl,
        "description": t('description'),
        "applicationCategory": ["DesignApplication", "AITool"],
        "operatingSystem": "Web Browser",
        "alternateName": ["GPT Image 2 Generator", "GPT Image 2", "AI Image Workspace"],
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": lowPrice,
            "highPrice": highPrice,
            "offerCount": String(ALL_PLANS.length),
            "offers": ALL_PLANS.map((plan) => ({
                "@type": "Offer",
                "name": isZh ? plan.nameZh : plan.name,
                "description": plan.type === 'subscription'
                    ? (isZh ? '订阅方案' : 'Subscription plan')
                    : (isZh ? '一次性购买' : 'One-time pass'),
                "price": plan.price.toFixed(2),
                "priceCurrency": "USD",
                "url": `${siteConfig.url}/${locale}/pricing`,
                "availability": "https://schema.org/InStock",
            })),
        },
        "featureList": [
            isZh ? "GPT Image 2 文生图工作流" : "GPT Image 2 prompt-to-image workflow",
            isZh ? "方图、竖图与横图尺寸预设" : "Square, portrait, and landscape size presets",
            isZh ? "快速、标准与精细质量选项" : "Fast, standard, and high quality options",
            isZh ? "PNG、JPEG 与 WebP 导出格式" : "PNG, JPEG, and WebP export formats",
            isZh ? "支持中英文提示词" : "Supports English and Chinese prompts",
            isZh ? "适合海报、产品图与概念视觉" : "Useful for posters, product visuals, and concept art",
            isZh ? "在线生成并即时下载" : "Generate online and download instantly"
        ],
        "screenshot": `${siteConfig.url}/web-app-manifest-512x512.png`,
        "isAccessibleForFree": true
        // Note: aggregateRating removed - only add when backed by real user review data
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function WebsiteEntitySchema() {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": `${siteConfig.url}/#website`,
                "name": "GPT Image 2",
                "alternateName": ["GPT Image 2 Generator", "ChatGPT Image 2 Generator", "GPT Image 2.0 Studio"],
                "url": `${siteConfig.url}/`,
                "publisher": {
                    "@id": `${siteConfig.url}/#organization`
                }
            },
            {
                "@type": "Organization",
                "@id": `${siteConfig.url}/#organization`,
                "name": "GPT Image 2 Studio",
                "url": `${siteConfig.url}/`,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${siteConfig.url}/web-app-manifest-512x512.png`
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
