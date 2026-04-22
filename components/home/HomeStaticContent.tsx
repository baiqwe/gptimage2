import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sparkles, Lock, Zap, Palette, Smartphone, Printer, Heart, ArrowRight, Star } from 'lucide-react';
import { PricingSection } from '@/components/marketing/pricing-section';

interface HomeStaticContentProps {
    locale: string;
}

export default async function HomeStaticContent({ locale }: HomeStaticContentProps) {
    const tHome = await getTranslations({ locale, namespace: 'home' });
    const tFeatures = await getTranslations({ locale, namespace: 'features' });

    return (
        <div className="bg-[linear-gradient(180deg,#fff9f2_0%,#fff6ed_48%,#fffdf9_100%)]">
            <WhatSection t={tHome} />
            <HowSection t={tHome} />
            <FeaturesSection t={tFeatures} />
            <ResearchSection locale={locale} />
            <EditorialHighlightsSection locale={locale} />
            <HomePricingSection locale={locale} />
            <SEOContentSection t={tHome} locale={locale} />
            <IntentHubSection locale={locale} />
            <FAQSection t={tHome} />
            <CTASection t={tHome} locale={locale} />
        </div>
    );
}

function HomePricingSection({ locale }: { locale: string }) {
    return (
        <section className="border-t border-orange-100 bg-[linear-gradient(180deg,#fff8f0_0%,#fffdf9_100%)] py-16">
            <div className="container px-4 md:px-6">
                <PricingSection locale={locale} />
            </div>
        </section>
    );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">{subtitle}</p>
        </div>
    );
}

function WhatSection({ t }: { t: any }) {
    const cards = [
        { title: t('what.feature_1_title'), desc: t('what.feature_1_desc'), icon: Palette, tone: 'bg-orange-100 text-orange-500' },
        { title: t('what.feature_2_title'), desc: t('what.feature_2_desc'), icon: Heart, tone: 'bg-amber-100 text-amber-500' },
        { title: t('what.feature_3_title'), desc: t('what.feature_3_desc'), icon: Sparkles, tone: 'bg-rose-100 text-rose-500' },
    ];

    return (
        <section className="py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-5xl">
                    <SectionTitle title={t('what.title')} subtitle={t('what.desc')} />
                    <div className="grid gap-6 md:grid-cols-3">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{card.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowSection({ t }: { t: any }) {
    const steps = [
        { number: 1, title: t('how.step_1_title'), desc: t('how.step_1_desc') },
        { number: 2, title: t('how.step_2_title'), desc: t('how.step_2_desc') },
        { number: 3, title: t('how.step_3_title'), desc: t('how.step_3_desc') },
        { number: 4, title: t('how.step_4_title'), desc: t('how.step_4_desc') },
    ];

    return (
        <section className="py-20 bg-white/50">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle title={t('how.title')} subtitle={t('how.subtitle')} />
                    <div className="grid gap-8 md:grid-cols-4">
                        {steps.map((step) => (
                            <div key={step.number} className="relative text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-2xl font-bold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)]">
                                    {step.number}
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{step.desc}</p>
                                {step.number < steps.length && (
                                    <div className="absolute left-full top-8 hidden w-8 -translate-y-1/2 items-center justify-center md:flex">
                                        <ArrowRight className="h-6 w-6 text-orange-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection({ t }: { t: any }) {
    const features = [
        { icon: Lock, title: t('feature_1_title'), desc: t('feature_1_desc'), tone: 'bg-orange-100 text-orange-500' },
        { icon: Zap, title: t('feature_2_title'), desc: t('feature_2_desc'), tone: 'bg-amber-100 text-amber-500' },
        { icon: Palette, title: t('feature_3_title'), desc: t('feature_3_desc'), tone: 'bg-rose-100 text-rose-500' },
        { icon: Sparkles, title: t('feature_4_title'), desc: t('feature_4_desc'), tone: 'bg-pink-100 text-pink-500' },
        { icon: Smartphone, title: t('feature_5_title'), desc: t('feature_5_desc'), tone: 'bg-sky-100 text-sky-500' },
        { icon: Printer, title: t('feature_6_title'), desc: t('feature_6_desc'), tone: 'bg-emerald-100 text-emerald-500' },
    ];

    return (
        <section className="py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle title={t('title')} subtitle={t('subtitle')} />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)] transition-transform hover:-translate-y-1">
                                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ResearchSection({ locale }: { locale: string }) {
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;
    const items = [
        {
            title: isZh ? '真实示例而不是空泛介绍' : 'Real examples instead of vague claims',
            desc: isZh
                ? '站内示例、博客评测和对比文章都会尽量基于真实 prompt、真实出图结果和可复现的使用流程来写，方便你直接参考。'
                : 'Our examples, reviews, and comparison articles are built around repeatable prompts, real outputs, and observable workflows you can actually try.',
        },
        {
            title: isZh ? '不同需求有不同入口' : 'Different needs have different entry points',
            desc: isZh
                ? '如果你想直接生成图片，可以用首页和 create 页面；如果你想看接入方式、模型对比或趋势解读，也能在对应页面里快速找到。'
                : 'If you want to start generating right away, use the homepage or create page. If you need API help, comparisons, or trend explainers, those paths are available too.',
        },
        {
            title: isZh ? '优先给出可验证的信息' : 'We prioritize information you can verify',
            desc: isZh
                ? '涉及模型能力、API 接入和版本命名时，我们会优先引用官方文档和可验证结果；不确定的地方会尽量说清楚。'
                : 'When discussing model capability, API access, or version naming, we prioritize official docs and verifiable observations, and make uncertainty clear when needed.',
        },
    ];

    return (
        <section className="border-t border-orange-100 bg-white/60 py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        title={isZh ? '为什么这些内容值得参考' : 'Why These Guides Are Worth Reading'}
                        subtitle={isZh
                            ? '如果你在找可直接使用的提示词、对比案例和官方资料入口，这里会比单纯的宣传页更有帮助。'
                            : 'If you are looking for prompt ideas, comparison examples, and useful official references, this section is designed to get you there faster.'}
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                        {items.map((item) => (
                            <div key={item.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-3 leading-7 text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href={`${localePrefix}/about`} className="rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                            {isZh ? '了解我们' : 'Read about us'}
                        </Link>
                        <Link href={`${localePrefix}/privacy`} className="rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                            {isZh ? '查看隐私与数据说明' : 'See privacy and data handling'}
                        </Link>
                        <a href="https://platform.openai.com/docs/guides/images/image-generation" target="_blank" rel="noreferrer" className="rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                            {isZh ? 'OpenAI 图像官方文档' : 'OpenAI image docs'}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

function EditorialHighlightsSection({ locale }: { locale: string }) {
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;
    const posts = [
        {
            href: `${localePrefix}/blog/openai-image-2-vs-chatgpt-image-2-naming-guide`,
            title: isZh ? 'OpenAI Image 2 vs ChatGPT Image 2 命名指南' : 'OpenAI Image 2 vs ChatGPT Image 2 naming guide',
            desc: isZh
                ? '帮助你弄清 OpenAI Image 2、ChatGPT Image 2、GPT-Image-2 这些叫法之间的关系。'
                : 'Clarifies how names like OpenAI Image 2, ChatGPT Image 2, and GPT-Image-2 are usually used.',
        },
        {
            href: `${localePrefix}/blog/gpt-image-2-release-date-features-and-what-we-can-verify`,
            title: isZh ? 'GPT Image 2 发布时间与可验证功能' : 'GPT Image 2 release date and verifiable features',
            desc: isZh
                ? '把已确认信息、实测结论和传闻分开整理，避免资讯页变成薄内容。'
                : 'Separates confirmed information, first-hand testing, and rumor so the page stays useful over time.',
        },
        {
            href: `${localePrefix}/blog/nano-banana-2-vs-gpt-image-2-benchmark`,
            title: isZh ? 'Nano Banana 2 vs GPT Image 2 基准对比' : 'Nano Banana 2 vs GPT Image 2 benchmark',
            desc: isZh
                ? '围绕 prompt fidelity、布局完整度和可读文字做对比，而不是泛泛列功能。'
                : 'Compares prompt fidelity, layout quality, and readable text rather than generic feature lists.',
        },
        {
            href: `${localePrefix}/blog/llm-arena-for-image-generation-how-to-run-a-fair-prompt-test`,
            title: isZh ? '如何做公平的 LLM Arena 图像测试' : 'How to run a fair LLM Arena image test',
            desc: isZh
                ? '把图像模型对比的方法拆清楚，方便你自己复现实验。'
                : 'Breaks down a cleaner way to compare image models with a repeatable test method.',
        },
    ];

    return (
        <section className="border-t border-orange-100 bg-[linear-gradient(180deg,#fffdf9_0%,#fff8f0_100%)] py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        title={isZh ? '值得继续阅读的 GPT Image 2 文章' : 'More GPT Image 2 Guides to Explore'}
                        subtitle={isZh
                            ? '如果你想继续看命名解释、趋势解读、竞品比较或测试方法，可以从下面这些文章继续。'
                            : 'If you want more naming explainers, trend updates, competitor comparisons, or testing methods, start with these articles.'}
                    />
                    <div className="grid gap-6 md:grid-cols-2">
                        {posts.map((post) => (
                            <Link key={post.href} href={post.href} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)] transition-transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                                <p className="mt-3 leading-7 text-slate-600">{post.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FAQSection({ t }: { t: any }) {
    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
    ];

    return (
        <section className="border-t border-orange-100 py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl">
                    <SectionTitle title={t('faq.title')} subtitle={t('faq.subtitle')} />
                    <div className="grid gap-6">
                        {faqs.map((faq) => (
                            <div key={faq.q} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <h3 className="text-xl font-bold text-slate-900">{faq.q}</h3>
                                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function IntentHubSection({ locale }: { locale: string }) {
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;
    const hubs = [
        {
            title: 'GPT Image 2 API',
            desc: isZh
                ? '适合想了解官方图像 API、网页工具与接入方式差别的开发者或技术用户。'
                : 'Best for developers who want to understand official image APIs, web workflows, and implementation paths.',
            href: `${localePrefix}/developer-api`,
            cta: isZh ? '查看 API 指南' : 'Open API guide',
        },
        {
            title: 'Image Arena',
            desc: isZh
                ? '适合想用统一 prompt 横向比较不同模型输出质量的用户。'
                : 'Best for people who want to compare multiple models side by side with the same prompt.',
            href: `${localePrefix}/arena`,
            cta: isZh ? '进入 Arena' : 'Visit arena',
        },
        {
            title: isZh ? '趋势与评测博客' : 'Trend and review hub',
            desc: isZh
                ? '这里集中整理了趋势解读、工具对比、发布时间信息和实测文章。'
                : 'This section brings together trend explainers, competitor comparisons, release-date updates, and hands-on review posts.',
            href: `${localePrefix}/blog`,
            cta: isZh ? '浏览博客' : 'Browse blog',
        },
    ];

    return (
        <section className="border-t border-orange-100 bg-[linear-gradient(180deg,#fffdf9_0%,#fff7ef_100%)] py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        title={isZh ? '继续探索 GPT Image 2 的更多内容' : 'Explore More Ways to Use GPT Image 2'}
                        subtitle={isZh
                            ? '无论你是想生成图片、研究 API、做模型对比，还是继续看趋势文章，都可以从下面的入口继续。'
                            : 'Whether you want to generate images, study the API, compare models, or read more trend coverage, these sections will help you continue.'}
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                        {hubs.map((hub) => (
                            <div key={hub.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <h3 className="text-xl font-bold text-slate-900">{hub.title}</h3>
                                <p className="mt-3 leading-7 text-slate-600">{hub.desc}</p>
                                <Link href={hub.href} className="mt-5 inline-flex rounded-full bg-[#ff6b2c] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#f86120]">
                                    {hub.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CTASection({ t, locale }: { t: any; locale: string }) {
    const localePrefix = `/${locale}`;

    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white px-6 py-12 text-center shadow-[0_28px_80px_rgba(235,145,71,0.12)] sm:px-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-[#fff6ef] px-4 py-2 text-sm font-semibold text-orange-700">
                        <Star className="h-4 w-4" />
                        {locale === 'zh' ? '免费试用' : 'Free to Try'}
                    </div>
                    <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {t('cta.title')}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                        {t('cta.subtitle')}
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href={`${localePrefix}/create`}
                            className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]"
                        >
                            {t('cta.button_start')}
                        </Link>
                        <Link
                            href={`${localePrefix}#generator-workspace`}
                            className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-100 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50"
                        >
                            {t('cta.button_coloring')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SEOContentSection({ t, locale }: { t: any; locale: string }) {
    const isZh = locale === 'zh';
    return (
        <section className="border-t border-orange-100 bg-white/50 py-20">
            <div className="container max-w-5xl px-4 md:px-6">
                <SectionTitle title={t('seo.comparison_title')} subtitle={t('seo.comparison_intro')} />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <InfoCard emoji="🇨🇳" title={t('seo.compare_chinese')} desc={t('seo.compare_chinese_desc')} />
                    <InfoCard emoji="⚡️" title={t('seo.compare_speed')} desc={t('seo.compare_speed_desc')} />
                    <InfoCard emoji="💰" title={t('seo.compare_price')} desc={t('seo.compare_price_desc')} />
                    <InfoCard emoji="🚀" title={t('seo.compare_queue')} desc={t('seo.compare_queue_desc')} />
                </div>

                <div className="mt-16 rounded-[28px] border border-orange-100 bg-white p-8 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                    <h3 className="text-2xl font-bold text-slate-900">
                        {isZh ? '为什么这个 GPT Image 2 工作流更容易判断效果' : 'Why this GPT Image 2 workflow is easier to evaluate'}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600">
                        {isZh
                            ? '更简单的工作台能让你把注意力放在提示词质量、尺寸、导出格式和最终图像本身，而不是被复杂设置分散。'
                            : 'A simpler workspace makes it easier to judge results by prompt quality, size, export format, and the final image itself.'}
                    </p>
                    <div className="mt-8 space-y-6">
                        <StepItem number={1} title={isZh ? '从一个明确的 prompt 开始' : 'Start with a concrete prompt'} desc={isZh ? '尽量写清主体、场景、风格和输出目标，这样更容易比较不同工具之间的结果。' : 'Use a subject, scene, style, and output goal so the result is easier to compare across tools.'} />
                        <StepItem number={2} title={isZh ? '选择合适的尺寸预设' : 'Choose a clear size preset'} desc={isZh ? '方图、竖图和横图适合不同场景，缩略图、海报和商品视觉的方向也会更明确。' : 'Square, portrait, and landscape presets make output intent obvious for thumbnails, posters, and product visuals.'} />
                        <StepItem number={3} title={isZh ? '调整质量和导出格式' : 'Adjust quality and format'} desc={isZh ? '质量和导出格式会影响迭代速度与最终交付，所以我们把它们直接放在可见位置。' : 'Quality and export format affect iteration speed and final delivery, so we expose them directly.'} />
                        <StepItem number={4} title={isZh ? '继续比较并迭代' : 'Compare, iterate, and document'} desc={isZh ? '如果你还想对比其他模型或案例，可以继续看博客和 Arena 页面。' : 'Use the blog and arena pages to compare your results against other models or use cases without leaving the site.'} />
                    </div>
                </div>

                <div className="mt-10 rounded-[28px] border border-orange-100 bg-[#fffaf4] p-8 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                    <h3 className="text-2xl font-bold text-slate-900">
                        {isZh ? '你可以从这里期待什么' : 'What you can expect from this GPT Image 2 experience'}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600">
                        {isZh
                            ? '这里的重点是 prompt 工作流、清晰的控制项和基于示例的比较，帮助你更快理解这个生成器适合做什么。'
                            : 'We focus on prompt workflow, visible controls, and example-based comparisons so you can quickly understand what this generator is good at.'}
                    </p>
                    <ul className="mt-6 space-y-4">
                        <TechItem title={isZh ? '示例尽量贴近真实使用场景' : 'Prompt examples stay close to real use cases'} desc={isZh ? '你会看到海报、UI 板、商品详情页和社媒视觉等例子，而不只是抽象风格词。' : 'You will see examples for posters, UI boards, product detail layouts, and social visuals rather than abstract style prompts only.'} />
                        <TechItem title={isZh ? '工具页和指南页各有分工' : 'Tool pages and guide pages serve different jobs'} desc={isZh ? '生成器负责出图，API、Arena 和博客负责帮助你比较、学习并决定下一步。' : 'The generator helps you create, while the API, arena, and blog pages help you compare, learn, and plan the next step.'} />
                        <TechItem title={isZh ? '关键控制项默认可见' : 'Key controls are visible from the start'} desc={isZh ? '尺寸、质量和导出格式都直接展示，方便你快速测试工作流。' : 'Size, quality, and export format are exposed directly so you can test a workflow without hunting through hidden settings.'} />
                        <TechItem title={isZh ? '每个入口都能继续行动' : 'Guides are meant to lead into action'} desc={isZh ? '页面会继续引导你去生成、研究 API、做模型对比或深入阅读，而不是停在介绍层面。' : 'Every section points you toward generation, API research, comparisons, or deeper reading instead of leaving you at a dead end.'} />
                    </ul>
                </div>
            </div>
        </section>
    );
}

function InfoCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
    return (
        <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
            <div className="text-2xl">{emoji}</div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
        </div>
    );
}

function StepItem({ number, title, desc }: { number: number; title: string; desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                {number}
            </div>
            <div>
                <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
                <p className="mt-1 leading-7 text-slate-600">{desc}</p>
            </div>
        </div>
    );
}

function TechItem({ title, desc }: { title: string; desc: string }) {
    return (
        <li className="flex gap-3 text-slate-700">
            <span className="text-orange-500">❖</span>
            <span>
                <strong className="text-slate-900">{title}:</strong> {desc}
            </span>
        </li>
    );
}
