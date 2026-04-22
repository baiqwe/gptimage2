import Link from "next/link";
import { Sparkles, Wand2, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { siteConfig } from "@/config/site";

export const dynamic = 'force-static';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const isZh = locale === 'zh';
    const title = isZh ? '关于 GPT Image 2 Generator' : 'About GPT Image 2 Generator';
    const description = isZh
        ? '了解 GPT Image 2 Generator 的产品定位、使用方式和我们希望为创作者提供的体验。'
        : 'Learn what GPT Image 2 Generator is for, how it is meant to be used, and what kind of experience we want to provide for creators.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/about`,
        },
        twitter: {
            title,
            description,
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/about`,
            languages: {
                en: `${siteConfig.url}/en/about`,
                zh: `${siteConfig.url}/zh/about`,
                'x-default': `${siteConfig.url}`,
            },
        },
    };
}

export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const breadcrumbs = [
        { name: isZh ? '首页' : 'Home', url: `${siteConfig.url}/${locale}` },
        { name: isZh ? '关于我们' : 'About Us', url: `${siteConfig.url}/${locale}/about` },
    ];

    const cards = [
        {
            icon: <Wand2 className="h-6 w-6 text-orange-500" />,
            title: isZh ? '更直接的创作体验' : 'A more direct creative workflow',
            desc: isZh
                ? '打开页面、输入提示词、选择尺寸和导出格式，然后快速看到结果。我们希望这个流程尽量清晰，而不是被复杂设置打断。'
                : 'Open the page, write a prompt, choose a size and export format, and get to the result quickly. The goal is a workflow that feels clear instead of overloaded.',
        },
        {
            icon: <Globe className="h-6 w-6 text-orange-500" />,
            title: isZh ? '适合中英文创作' : 'Made for bilingual prompting',
            desc: isZh
                ? '无论你更习惯中文还是英文提示词，这里都能作为统一的试验台，帮助你更快比较不同写法带来的效果。'
                : 'Whether you write prompts in Chinese or English, this workspace is meant to help you test ideas and compare results without friction.',
        },
        {
            icon: <ShieldCheck className="h-6 w-6 text-orange-500" />,
            title: isZh ? '把信息讲清楚' : 'Clearer guidance, not just claims',
            desc: isZh
                ? '除了生成器本身，我们也提供示例、评测、对比和 API 指南，帮助你判断什么值得尝试、下一步该去哪里。'
                : 'Alongside the generator, we publish examples, reviews, comparisons, and API guides so it is easier to decide what to try next.',
        },
    ];

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff6ed_45%,#fffdf9_100%)]">
            <BreadcrumbSchema items={breadcrumbs} />

            <div className="border-b border-orange-100 bg-white/80 backdrop-blur">
                <div className="container px-4 py-4 md:px-6">
                    <nav className="flex items-center overflow-x-auto whitespace-nowrap text-sm text-slate-500">
                        <Link href={localePrefix} className="transition-colors hover:text-orange-600">
                            {isZh ? '首页' : 'Home'}
                        </Link>
                        <span className="mx-2 text-orange-200">/</span>
                        <span className="font-medium text-slate-900">{isZh ? '关于我们' : 'About Us'}</span>
                    </nav>
                </div>
            </div>

            <div className="container px-4 py-16 md:px-6">
                <div className="mx-auto max-w-5xl space-y-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
                            <Sparkles className="h-4 w-4" />
                            {isZh ? '关于产品' : 'About the product'}
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            {isZh ? '关于 GPT Image 2 Generator' : 'About GPT Image 2 Generator'}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? 'GPT Image 2 Generator 是一个面向创作者、设计师、营销团队和产品团队的图像生成工作台，帮助你把想法更快转成可用视觉。'
                                : 'GPT Image 2 Generator is a prompt-to-image workspace for creators, designers, marketers, and product teams who want to turn ideas into usable visuals faster.'}
                        </p>
                    </div>

                    <section className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_24px_60px_rgba(235,145,71,0.10)] md:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? '我们希望这个产品解决什么问题' : 'What we want this product to solve'}
                        </h2>
                        <div className="mt-5 space-y-4 leading-8 text-slate-600">
                            <p>
                                {isZh
                                    ? '很多图像生成工具都很强，但真正开始创作时，用户常常会卡在同一个地方：提示词怎么写、尺寸怎么选、结果适不适合海报、商品图、界面板或社交媒体内容。'
                                    : 'Many image tools are powerful, but the real friction often appears one step later: how to write the prompt, which size to choose, and whether the result actually fits a poster, product visual, UI board, or social asset.'}
                            </p>
                            <p>
                                {isZh
                                    ? '我们想把这件事做得更直接一些。你不需要先理解一堆复杂设置，就可以开始试 prompt、看示例、比较结果，然后继续去阅读 API、评测或模型对比内容。'
                                    : 'We want that process to feel more direct. You should be able to test a prompt, inspect examples, compare outputs, and then continue into API docs, reviews, or model comparisons without getting lost first.'}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 md:grid-cols-3">
                        {cards.map((card) => (
                            <div key={card.title} className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5ec]">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{card.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-[32px] border border-orange-100 bg-[#fffaf4] p-8 shadow-[0_24px_60px_rgba(235,145,71,0.08)] md:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? '如果你是第一次来到这里' : 'If this is your first time here'}
                        </h2>
                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div className="rounded-[24px] border border-orange-100 bg-white p-6">
                                <h3 className="text-lg font-bold text-slate-900">{isZh ? '想直接开始生成' : 'Want to generate right away?'}</h3>
                                <p className="mt-3 leading-7 text-slate-600">
                                    {isZh
                                        ? '前往生成器，输入提示词，选择尺寸、质量和格式，然后直接开始出图。'
                                        : 'Open the generator, enter your prompt, choose size, quality, and format, and start creating immediately.'}
                                </p>
                                <Link href={`${localePrefix}/create`} className="mt-5 inline-flex items-center text-sm font-semibold text-orange-700 hover:underline">
                                    {isZh ? '进入生成器' : 'Open the generator'} <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-6">
                                <h3 className="text-lg font-bold text-slate-900">{isZh ? '想继续研究和比较' : 'Want to research and compare?'}</h3>
                                <p className="mt-3 leading-7 text-slate-600">
                                    {isZh
                                        ? '你可以继续看 API 指南、Arena 对比页和博客，了解不同工作流、模型表现和案例。'
                                        : 'Continue into the API guide, arena page, and blog to explore workflows, model behavior, and practical examples.'}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
                                    <Link href={`${localePrefix}/developer-api`} className="text-orange-700 hover:underline">{isZh ? '查看 API 指南' : 'View API guide'}</Link>
                                    <Link href={`${localePrefix}/arena`} className="text-orange-700 hover:underline">{isZh ? '进入 Arena' : 'Visit arena'}</Link>
                                    <Link href={`${localePrefix}/blog`} className="text-orange-700 hover:underline">{isZh ? '浏览博客' : 'Browse blog'}</Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="text-center rounded-[32px] border border-orange-100 bg-white p-10 shadow-[0_24px_60px_rgba(235,145,71,0.10)]">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? '开始试一张图，看看它是否适合你的工作流' : 'Try a prompt and see if it fits your workflow'}
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-600">
                            {isZh
                                ? '最好的判断方式不是看口号，而是直接生成一张图：海报、商品图、UI 板、社媒视觉，看看结果是不是你真正需要的。'
                                : 'The fastest way to evaluate a workflow is not to read more slogans. It is to generate a real image and see whether the result fits your poster, product, UI, or social-media use case.'}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link href={`${localePrefix}/create`} className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]">
                                {isZh ? '开始生成' : 'Start creating'}
                            </Link>
                            <a href={`mailto:${siteConfig.supportEmail}`} className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-200 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                                {isZh ? '联系团队' : 'Contact us'}
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
