import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';

    const title = isZh ? 'GPT Image 2 API 指南' : 'GPT Image 2 API Guide';
    const description = isZh
        ? '面向开发者的 GPT Image 2 API 指南，解释官方图像 API、网页生成器工作流、输出参数以及接入前需要核对的事项。'
        : 'A developer-focused GPT Image 2 API guide covering official image APIs, web generator workflows, output parameters, and implementation checks.';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/developer-api`,
            languages: {
                en: `${siteConfig.url}/en/developer-api`,
                zh: `${siteConfig.url}/zh/developer-api`,
                'x-default': `${siteConfig.url}/en/developer-api`,
            },
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/developer-api`,
        },
        twitter: {
            title,
            description,
        },
    };
}

export default async function DeveloperApiPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const sections = [
        {
            title: isZh ? '1. 先确认你是不是需要 API' : '1. First, decide whether you actually need the API',
            body: isZh
                ? '如果你只是想生成图片，网页生成器通常已经够用；如果你要把图像能力接进自己的产品、工作流或自动化系统，这时就需要认真看 API。'
                : 'If you only want to generate images, the web tool is usually enough. If you need to plug image generation into your own product, workflow, or automation stack, this is where the API matters.',
        },
        {
            title: isZh ? '2. 网页生成器和 API 的区别' : '2. How the web generator differs from the API',
            body: isZh
                ? '如果你只是想生成图片，网页生成器更适合快速验证 prompt、尺寸、质量和导出格式；如果你要接入应用，则应该直接研究官方图像 API 文档和你自己的调用链路。'
                : 'If you only need to generate images, the web generator is the fastest way to validate prompts, size presets, quality, and export formats. If you are integrating images into your own product, you should work from the official image API documentation and your own request pipeline.',
        },
        {
            title: isZh ? '3. 上线前要核对什么' : '3. What to verify before shipping',
            body: isZh
                ? '至少核对四类信息：模型与版本命名、图片输出格式与大小、额度与成本、内容安全与错误处理。这样既能减少技术返工，也能避免在博客里把推测写成事实。'
                : 'At minimum, verify model naming, output formats and sizes, credit or cost behavior, and moderation or error-handling paths. This reduces implementation churn and keeps editorial content grounded in real system behavior.',
        },
    ];

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f2_0%,#fff6ed_48%,#fffdf9_100%)]">
            <div className="container px-4 py-16 md:px-6 md:py-20">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <div className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
                            {isZh ? '开发者资源' : 'Developer resource'}
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            {isZh ? 'GPT Image 2 API 指南' : 'GPT Image 2 API Guide'}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? '如果你正在比较网页工具和 API 接入方式，这个页面会帮你快速判断：什么时候直接用生成器更省事，什么时候应该继续研究接口。'
                                : 'If you are choosing between a web generator and an API integration path, this page will help you decide when the simple tool is enough and when a deeper implementation route makes more sense.'}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:mt-14">
                        {sections.map((section) => (
                            <section key={section.title} className="section-shell p-8">
                                <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                                <p className="mt-4 leading-8 text-slate-600">{section.body}</p>
                            </section>
                        ))}
                    </div>

                    <div className="section-shell mt-10 bg-[#fffaf4] p-8 md:mt-12">
                        <h2 className="text-2xl font-bold text-slate-900">{isZh ? '官方与站内资源' : 'Official and on-site resources'}</h2>
                        <ul className="mt-5 space-y-3 text-slate-700">
                            <li>
                                <a href="https://platform.openai.com/docs/guides/images/image-generation" target="_blank" rel="noreferrer" className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? 'OpenAI 图像生成官方文档' : 'OpenAI image generation guide'}
                                </a>
                            </li>
                            <li>
                                <Link href={`${localePrefix}/create`} className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? '返回 GPT Image 2 生成器' : 'Open the GPT Image 2 generator'}
                                </Link>
                            </li>
                            <li>
                                <Link href={`${localePrefix}/blog`} className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? '查看模型评测与趋势文章' : 'Browse model reviews and trend posts'}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
