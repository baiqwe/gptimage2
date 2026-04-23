import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import HomeStaticContent from '@/components/home/HomeStaticContent';
import { SoftwareApplicationSchema, WebsiteEntitySchema } from '@/components/json-ld-schema';
import { FAQSchema } from '@/components/breadcrumb-schema';
import { siteConfig } from '@/config/site';
import { getTranslations } from 'next-intl/server';

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
        ? 'GPT Image 2 官网 | 免费且强大的 AI 绘画与图像生成器'
        : 'GPT Image 2 Generator: The Ultimate AI Art & Design Studio';
    const description = isZh
        ? '使用 GPT Image 2 在线生成海报、产品图、界面概念图和风格化视觉。查看示例、价格、教程与开发者资源，在一个产品工作台中完成灵感到成品的转化。'
        : 'Create posters, product visuals, UI concepts, and styled artwork with GPT Image 2. Explore examples, pricing, tutorials, and developer resources in one product-focused creative studio.';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}`,
            languages: {
                en: `${siteConfig.url}/en`,
                zh: `${siteConfig.url}/zh`,
            },
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}`,
            images: [
                {
                    url: siteConfig.socialImage,
                    width: 512,
                    height: 512,
                    alt: siteConfig.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.socialImage],
        },
    };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const tHome = await getTranslations({ locale, namespace: 'home' });

    // 用户状态在客户端 HomeHeroGenerator 中实时获取
    // 服务端传递 null，让客户端自己获取最新状态
    const user = null;

    // Server-rendered static content for better LCP and SEO
    const staticContent = await HomeStaticContent({ locale });

    const faqItems = [
        { question: tHome('faq.q1'), answer: tHome('faq.a1') },
        { question: tHome('faq.q2'), answer: tHome('faq.a2') },
        { question: tHome('faq.q3'), answer: tHome('faq.a3') },
        { question: tHome('faq.q4'), answer: tHome('faq.a4') },
    ];

    return (
        <>
            <WebsiteEntitySchema />
            <SoftwareApplicationSchema locale={locale} />
            <FAQSchema items={faqItems} />
            <h1 className="sr-only">
                {locale === 'zh'
                    ? 'GPT Image 2 官网，免费 AI 绘画与图像生成器'
                    : 'GPT Image 2 Generator, a free AI art and image creation workspace'}
            </h1>
            <HomeClientWrapper staticContent={staticContent} user={user} />
        </>
    );
}
