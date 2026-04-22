import Link from 'next/link';

export default function CreateStaticContent({ locale }: { locale: string }) {
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const cards = [
        {
            title: isZh ? '这是开始生成的主页面' : 'This is the main page for creating images',
            description: isZh
                ? '如果你想直接输入提示词并开始生成图片，这里就是最直接的入口。'
                : 'If you want to type a prompt and start generating right away, this is the most direct place to do it.',
        },
        {
            title: isZh ? '界面只保留真正有用的控制项' : 'Only the controls that matter are shown',
            description: isZh
                ? '生成器里展示的是用户可直接控制的尺寸、质量、格式和提示词输入，而不是无法验证的夸张承诺。'
                : 'The generator focuses on prompt input plus concrete output controls such as size, quality, and format, rather than inflated claims.',
        },
        {
            title: isZh ? '如果你需要更多信息，也有对应入口' : 'There are dedicated pages for deeper needs',
            description: isZh
                ? '如果你要研究 API、做模型对比，或者继续看评测和教程，可以继续进入对应页面。'
                : 'If you need API documentation, model comparisons, or longer reviews and tutorials, you can continue into those sections.',
        },
    ];

    return (
        <section className="border-t border-orange-100 bg-[linear-gradient(180deg,#fffaf4_0%,#fffdf9_100%)] py-16">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {isZh ? 'GPT Image 2 create 页面可以做什么？' : 'What can you do on the GPT Image 2 create page?'}
                        </h2>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? '这是站内的核心生成页面，适合想立刻测试提示词、调整尺寸、选择导出格式并快速出图的人。'
                                : 'This is the main workspace for people who want to test prompts, choose a size, set export options, and generate images quickly.'}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {cards.map((card) => (
                            <div key={card.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                                <p className="mt-3 leading-7 text-slate-600">{card.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href={`${localePrefix}/developer-api`} className="rounded-full bg-[#ff6b2c] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,107,44,0.2)] transition-colors hover:bg-[#f86120]">
                            {isZh ? '阅读 GPT Image 2 API 指南' : 'Read the GPT Image 2 API guide'}
                        </Link>
                        <Link href={`${localePrefix}/arena`} className="rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                            {isZh ? '查看 Image Arena' : 'Visit the image arena'}
                        </Link>
                        <Link href={`${localePrefix}/blog`} className="rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                            {isZh ? '浏览评测与教程' : 'Browse reviews and tutorials'}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
