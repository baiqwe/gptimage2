import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import HomeStaticContent from '@/components/home/HomeStaticContent';
import { siteConfig } from '@/config/site';

// ✅ This is now a Server Component (no 'use client')
// Hero/Interactive content is client-side, static content is server-rendered for SEO

// 页面使用 ISR，每 60 秒重新验证一次静态内容
// 用户状态在客户端组件中获取，不影响页面缓存
export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';

    const title = isZh
        ? 'GPT Image 2 与 ChatGPT Image 2.0 免费在线生成器'
        : 'GPT Image 2 and ChatGPT Image 2.0 Free AI Image Generator';
    const description = isZh
        ? '使用 GPT Image 2 在线生成图片，支持海报、产品图、界面概念图和风格化创意。我们提供实测示例、使用指南、价格说明与开发者资源。'
        : 'Use GPT Image 2 online for posters, product visuals, UI concepts, and styled creative work. Explore tested examples, guides, pricing, and developer resources in one place.';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}`,
            languages: {
                en: `${siteConfig.url}/en`,
                zh: `${siteConfig.url}/zh`,
                'x-default': `${siteConfig.url}/en`,
            },
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}`,
        },
        twitter: {
            title,
            description,
        },
    };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    // 用户状态在客户端 HomeHeroGenerator 中实时获取
    // 服务端传递 null，让客户端自己获取最新状态
    const user = null;

    // Server-rendered static content for better LCP and SEO
    const staticContent = await HomeStaticContent({ locale });

    return (
        <HomeClientWrapper staticContent={staticContent} user={user} />
    );
}
