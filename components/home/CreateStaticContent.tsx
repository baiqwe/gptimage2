import Link from 'next/link';

export default function CreateStaticContent({ locale }: { locale: string }) {
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const cards = [
        {
            title: isZh ? '这是 GPT Image 2 的主工作台' : 'This is the main GPT Image 2 workspace',
            description: isZh
                ? '如果你想直接输入提示词并开始生成图片，这里就是最直接的入口，适合海报、产品图、概念图和社媒视觉。'
                : 'If you want to type a prompt and start generating right away, this is the fastest route for posters, product visuals, concept art, and social content.',
        },
        {
            title: isZh ? '界面聚焦真正常用的控制项' : 'The interface keeps only the controls that matter',
            description: isZh
                ? '你可以直接控制提示词、画面比例，以及在文生图与图生图之间切换，更快完成测试、迭代和交付。'
                : 'You can directly control the prompt, aspect ratio, and whether you are working in text-to-image or image-to-image mode, making it easier to test and iterate quickly.',
        },
        {
            title: isZh ? '需要更多资料时也有清晰入口' : 'There are clear paths when you need more context',
            description: isZh
                ? '如果你还想看 API 指南、模型对比或完整评测，可以继续进入对应页面，不用离开当前工作流。'
                : 'If you want API guidance, model comparisons, or deeper reviews, you can continue into those pages without losing the flow.',
        },
    ];

    return (
        <section className="border-t border-orange-100 bg-[linear-gradient(180deg,#fffaf4_0%,#fffdf9_100%)] py-16">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {isZh ? '这个 GPT Image 2 AI 绘图工作台可以做什么？' : 'What can you do in this GPT Image 2 AI image workspace?'}
                        </h2>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? '这是站内的核心生成页面，适合想立刻测试提示词、调整尺寸和质量、选择导出格式并快速出图的人。'
                                : 'This is the main workspace for people who want to test prompts, choose size and quality settings, set export options, and generate images quickly.'}
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
