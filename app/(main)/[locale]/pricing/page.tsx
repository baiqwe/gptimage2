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

    return {
        title: isZh ? `定价 - ${siteConfig.name}` : `Pricing - ${siteConfig.name}`,
        description: isZh
            ? "灵活的定价方案，适用于 GPT Image 2 Generator 图像生成。新用户可先免费试用。"
            : "Flexible pricing plans for GPT Image 2 Generator. Get credits for fast, prompt-based AI image generation.",
        alternates: {
            canonical: `${siteConfig.url}/${locale}/pricing`,
            languages: {
                'en': `${siteConfig.url}/en/pricing`,
                'zh': `${siteConfig.url}/zh/pricing`,
                'x-default': `${siteConfig.url}/en/pricing`,
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
