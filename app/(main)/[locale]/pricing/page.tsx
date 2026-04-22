import { PricingSection } from "@/components/marketing/pricing-section";
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

// 静态页面 - 启用 CDN 缓存
export const dynamic = 'force-static';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const title = isZh ? 'GPT Image 2 定价' : 'GPT Image 2 Pricing';
    const description = isZh
        ? "灵活的 GPT Image 2 定价方案，覆盖买断、月付与年付。适合从单次项目到长期创作工作流。"
        : "Flexible GPT Image 2 pricing for one-time projects, monthly usage, and annual creative workflows.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/pricing`,
        },
        twitter: {
            title,
            description,
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/pricing`,
            languages: {
                'en': `${siteConfig.url}/en/pricing`,
                'zh': `${siteConfig.url}/zh/pricing`,
                'x-default': `${siteConfig.url}`,
            },
        },
    };
}

type Props = {
    params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f2_0%,#fff6ed_48%,#fffdf9_100%)]">
            <PricingSection locale={locale} />
        </div>
    );
}
