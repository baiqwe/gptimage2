import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';

    const title = isZh ? 'GPT Image 2 Image Arena' : 'GPT Image 2 Image Arena';
    const description = isZh
        ? '一个轻量的图像对比 Arena，用统一 prompt 比较不同模型和工作流在布局、文字可读性与完成度上的表现。'
        : 'A lightweight image arena for comparing prompts, model behavior, and workflow output with the same prompt across multiple image tools.';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/arena`,
            languages: {
                en: `${siteConfig.url}/en/arena`,
                zh: `${siteConfig.url}/zh/arena`,
                'x-default': `${siteConfig.url}/en/arena`,
            },
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/arena`,
        },
        twitter: {
            title,
            description,
        },
    };
}

export default async function ArenaPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const prompts = [
        {
            title: isZh ? '海报 prompt' : 'Poster prompt',
            prompt: isZh
                ? '一张现代饮料广告海报，明亮的柑橘色背景，产品主体清晰，带少量可读文字，占位版式完整'
                : 'A modern beverage poster with a bright citrus background, a clearly framed product subject, a few readable text areas, and a complete advertising layout',
        },
        {
            title: isZh ? 'UI 系统 prompt' : 'UI system prompt',
            prompt: isZh
                ? '一个简洁的 SaaS 设计系统看板，包含按钮、输入框、图表卡片、桌面与移动端页面缩略图'
                : 'A clean SaaS design system board with buttons, form inputs, chart cards, and both desktop and mobile screen thumbnails',
        },
        {
            title: isZh ? '直播截图 prompt' : 'Livestream prompt',
            prompt: isZh
                ? '一个竖版直播界面截图，主播位于画面中央，带评论流、点赞和礼物按钮'
                : 'A vertical livestream screenshot with the creator centered on screen, plus live comments, likes, and gift actions',
        },
    ];

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f0_0%,#fffdf9_100%)]">
            <div className="container px-4 py-16 md:px-6 md:py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center">
                        <div className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
                            {isZh ? '对比流程' : 'Comparison workflow'}
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            {isZh ? 'GPT Image 2 Image Arena' : 'GPT Image 2 Image Arena'}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? '这个页面适合想认真做模型对比的人。你可以用统一 prompt 测试不同模型或不同工作流，再观察它们在布局、可读文字和完成度上的差别。'
                                : 'This page is built for people who want a fair comparison. Use the same prompt across different models or workflows, then compare layout quality, readable text, and overall finish.'}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:mt-14 lg:grid-cols-3">
                        {prompts.map((item, index) => (
                            <div key={item.title} className="soft-panel bg-white p-6">
                                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                                    {isZh ? `Round ${index + 1}` : `Round ${index + 1}`}
                                </div>
                                <h2 className="mt-3 text-xl font-bold text-slate-900">{item.title}</h2>
                                <p className="mt-4 rounded-2xl bg-[#fff7ef] p-4 leading-7 text-slate-700">{item.prompt}</p>
                            </div>
                        ))}
                    </div>

                    <div className="section-shell mt-10 p-8 md:mt-12">
                        <h2 className="text-2xl font-bold text-slate-900">{isZh ? '如何使用这个页面' : 'How to use this page'}</h2>
                        <div className="mt-5 space-y-3 leading-8 text-slate-600">
                            <p>{isZh ? '1. 复制上面的任一 prompt。' : '1. Copy one of the prompts above.'}</p>
                            <p>{isZh ? '2. 在 GPT Image 2 生成器或其他模型里分别运行。' : '2. Run it in the GPT Image 2 generator and in another model or workflow.'}</p>
                            <p>{isZh ? '3. 对比布局一致性、可读文字、细节密度和整体完成度。' : '3. Compare layout consistency, readable text, detail density, and overall finish.'}</p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href={`${localePrefix}/create`} className="rounded-full bg-[#ff6b2c] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,107,44,0.2)] transition-colors hover:bg-[#f86120]">
                                {isZh ? '进入生成器测试' : 'Test in the generator'}
                            </Link>
                            <Link href={`${localePrefix}/blog`} className="btn-secondary-soft rounded-full px-6 py-3 text-sm font-semibold">
                                {isZh ? '查看对比文章' : 'Read comparison posts'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
