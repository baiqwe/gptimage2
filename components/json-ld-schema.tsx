/**
 * JSON-LD Structured Data for SoftwareApplication
 * Helps search engines understand GPT Image 2 Generator as a web application
 * 
 * Note: This is a server component to avoid hydration issues
 */
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';

export async function SoftwareApplicationSchema({ locale }: { locale: string }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `${siteConfig.name} - ${t('title')}`,
        "description": t('description'),
        "applicationCategory": ["DesignApplication", "AITool"],
        "operatingSystem": "Web Browser",
        "alternateName": ["GPT Image 2 Generator", "GPT Image 2", "Free GPT Image 2 Generator"],
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "3 free generations for new users"
        },
        "featureList": [
            "GPT Image 2 Generator text to image workflow",
            "Multiple aspect ratios (1:1, 16:9, 9:16)",
            "5 style presets (Photorealistic, Digital Art, Anime, Cinematic)",
            "No queue, instant generation",
            "Multi-language support (English, Chinese)",
            "High resolution output",
            "GPT Image 2 Generator online experience"
        ],
        "screenshot": `${siteConfig.url}/og-image.png`
        // Note: aggregateRating removed - only add when backed by real user review data
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

