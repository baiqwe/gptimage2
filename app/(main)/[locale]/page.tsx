import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import HomeStaticContent from '@/components/home/HomeStaticContent';
import { SoftwareApplicationSchema, WebsiteEntitySchema } from '@/components/json-ld-schema';
import { FAQSchema } from '@/components/breadcrumb-schema';
import { siteConfig } from '@/config/site';
import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';

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
                'x-default': `${siteConfig.url}/en`,
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
    const isZh = locale === 'zh';

    // 用户状态在客户端 HomeHeroGenerator 中实时获取
    // 服务端传递 null，让客户端自己获取最新状态
    const user = null;

    // Server-rendered static content for better LCP and SEO
    const staticContent = await HomeStaticContent({ locale });
    const heroHeader = (
        <div className="mb-5 text-center lg:mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-orange-700 shadow-[0_10px_26px_rgba(255,138,61,0.08)]">
                <Sparkles className="h-4 w-4" />
                {isZh ? 'GPT Image 2 在线图像生成器' : 'GPT Image 2 Generator Online'}
            </div>
            <h1 className="mx-auto mt-2.5 max-w-[74rem] text-[2.85rem] font-semibold tracking-tight text-slate-900 sm:text-[3rem] sm:leading-[1.06] lg:text-[3.08rem] lg:leading-[1.02]">
                {isZh ? (
                    '用 GPT Image 2 免费生成 AI 艺术图、产品视觉与设计概念'
                ) : (
                    <>
                        <span className="block">Create with GPT Image 2: A Free AI Art</span>
                        <span className="block">Generator for Product Visuals and Concepts</span>
                    </>
                )}
            </h1>
            <p className="mx-auto mt-2 max-w-[46rem] text-[15px] leading-7 text-slate-600 sm:text-[15.5px]">
                {isZh
                    ? '用 GPT Image 2 在线生成海报、产品图、界面概念图和风格化视觉，在一个清晰的提示词工作流里完成灵感到成品的转化。'
                    : 'Create posters, product visuals, UI concepts, and styled artwork with GPT Image 2 in a clean prompt-to-image workflow built for fast iteration.'}
            </p>
        </div>
    );

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
            <HomeClientWrapper heroHeader={heroHeader} staticContent={staticContent} user={user} />
        </>
    );
}
