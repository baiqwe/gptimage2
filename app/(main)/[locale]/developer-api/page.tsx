import Link from "next/link";
import { Code2, Layers3, ShieldCheck, Workflow } from "lucide-react";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SupportContactPanel } from "@/components/feature/support-contact";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === "zh";

    const title = isZh ? "GPT Image 2 API 指南" : "GPT Image 2 API Guide";
    const description = isZh
        ? "面向开发者的 GPT Image 2 API 指南，解释图像工作流、比例与分辨率参数、接入前的检查项，以及什么时候用网页工作台会更省事。"
        : "A developer-focused GPT Image 2 API guide covering image workflows, ratio and resolution parameters, pre-launch checks, and when the web workspace is the simpler option.";

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/developer-api`,
            languages: {
                en: `${siteConfig.url}/en/developer-api`,
                zh: `${siteConfig.url}/zh/developer-api`,
            },
        },
        openGraph: {
            title,
            description,
            type: "website",
            url: `${siteConfig.url}/${locale}/developer-api`,
            images: [{ url: siteConfig.socialImage, width: 512, height: 512, alt: siteConfig.name }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [siteConfig.socialImage],
        },
    };
}

export default async function DeveloperApiPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === "zh";
    const localePrefix = `/${locale}`;

    const breadcrumbs = [
        { name: isZh ? "首页" : "Home", url: `${siteConfig.url}/${locale}` },
        { name: isZh ? "开发者 API 指南" : "Developer API Guide", url: `${siteConfig.url}/${locale}/developer-api` },
    ];

    const useCases = [
        {
            icon: <Layers3 className="h-6 w-6 text-orange-500" />,
            title: isZh ? "批量电商视觉" : "Batch e-commerce visuals",
            desc: isZh
                ? "把同一商品的不同卖点文案组合进提示词，在固定比例和分辨率下批量生成主图、广告图和详情页素材。"
                : "Combine different product angles into prompt templates and generate main visuals, ad creatives, and detail-page assets in repeatable ratios and resolutions.",
        },
        {
            icon: <Workflow className="h-6 w-6 text-orange-500" />,
            title: isZh ? "工作流自动化" : "Workflow automation",
            desc: isZh
                ? "将图像生成嵌入内部内容系统、运营后台或自动化脚本，让文本、参考图和输出逻辑进入统一流水线。"
                : "Embed generation into internal content systems, ops dashboards, or automation scripts so text, references, and output logic live in one production pipeline.",
        },
        {
            icon: <Code2 className="h-6 w-6 text-orange-500" />,
            title: isZh ? "应用内创意功能" : "In-product creative features",
            desc: isZh
                ? "如果你要让用户在自己的产品里直接生成海报、封面、角色图或营销素材，API 会比人工操作网页更稳定。"
                : "If your product needs built-in poster, cover, character, or marketing-image creation, an API workflow is usually more reliable than manual browser operation.",
        },
    ];

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f2_0%,#fff6ed_48%,#fffdf9_100%)]">
            <BreadcrumbSchema items={breadcrumbs} />

            <div className="border-b border-orange-100 bg-white/80 backdrop-blur">
                <div className="container px-4 py-4 md:px-6">
                    <nav className="flex items-center overflow-x-auto whitespace-nowrap text-sm text-slate-500">
                        <Link href={localePrefix} className="transition-colors hover:text-orange-600">
                            {isZh ? "首页" : "Home"}
                        </Link>
                        <span className="mx-2 text-orange-200">/</span>
                        <span className="font-medium text-slate-900">{isZh ? "开发者 API 指南" : "Developer API Guide"}</span>
                    </nav>
                </div>
            </div>

            <div className="container px-4 py-16 md:px-6 md:py-20">
                <div className="mx-auto max-w-5xl space-y-10">
                    <div className="text-center">
                        <div className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
                            {isZh ? "开发者资源" : "Developer resource"}
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            {isZh ? "GPT Image 2 API 指南" : "GPT Image 2 API Guide"}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? "如果你正在评估什么时候应该直接用网页工作台，什么时候应该深入到 API 侧，这一页会帮助你用更工程化的方式做判断。"
                                : "If you are deciding when the web workspace is enough and when a deeper API path is worth it, this page is meant to frame that decision in more practical engineering terms."}
                        </p>
                    </div>

                    <section className="section-shell p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? "先判断：你真的需要 API 吗？" : "First question: do you actually need the API?"}
                        </h2>
                        <div className="mt-5 space-y-4 text-slate-600 leading-8">
                            <p>
                                {isZh
                                    ? "如果你的目标只是快速写 prompt、切换比例、比较 1K 与更高分辨率的结果，并人工下载或继续编辑，那么网页工作台通常已经足够。它的价值在于摩擦更低、验证更快，也更适合第一次梳理视觉方向。"
                                    : "If your goal is simply to draft prompts, switch ratios, compare 1K with higher-resolution output, and manually download or continue editing, the web workspace is usually enough. It is lower-friction, faster to validate, and more suitable when you are still shaping the direction."}
                            </p>
                            <p>
                                {isZh
                                    ? "但如果你已经明确需要批量化、自动化、模板化，或者要把图像生成嵌进自己的产品、脚本和后台系统里，API 的价值就会明显上升。此时你需要关注的，不再只是 prompt 写法，而是参数兼容性、速率限制、错误恢复和成本结构。"
                                    : "If you already know you need batching, automation, templating, or product-level integration, the API path becomes much more valuable. At that point, the key concern is no longer only prompt wording, but parameter compatibility, rate limits, recovery paths, and cost structure."}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 md:grid-cols-3">
                        {useCases.map((item) => (
                            <div key={item.title} className="soft-panel p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5ec]">
                                    {item.icon}
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="section-shell p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? "接入前必须核对的参数与约束" : "Parameters and constraints to verify before launch"}
                        </h2>
                        <div className="mt-5 space-y-4 text-slate-600 leading-8">
                            <p>
                                {isZh
                                    ? "对于 GPT Image 2 这类图像接口，最容易被忽略的不是鉴权，而是参数之间的兼容关系。比例、分辨率、文生图与图生图模式，看起来只是几个表单选项，但一旦在生产环境里组合错误，就会带来失败任务、无意义重试和额外成本。"
                                    : "With image APIs such as GPT Image 2, the most common mistakes are not authentication errors but compatibility gaps between parameters. Aspect ratio, resolution, and the switch between text-to-image and image-to-image may look like simple form inputs, but the wrong production combination creates failed tasks, wasted retries, and unnecessary cost."}
                            </p>
                            <p>
                                {isZh
                                    ? "在当前工作台里，我们已经把一些真实约束前置到交互层，例如 auto 比例只能走 1K，1:1 不能直接选择 4K。对开发者来说，这类规则最好在请求发出前就校验，而不是把所有错误都留给模型侧返回。"
                                    : "The current workspace already surfaces some real constraints before the request is sent. For example, auto ratio only supports 1K, and 1:1 does not go directly to 4K. For developers, this kind of validation is best done before the request is sent, rather than leaving every failure to the model provider."}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        <div className="soft-panel p-8">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isZh ? "实现时建议记录的状态" : "States worth recording in your implementation"}
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                                <li className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{isZh ? "用户登录态与购买状态分开判断，不要把“存在 customer 记录”直接当成已付费。" : "Keep authentication state and paid-access state separate. Do not treat every customer record as proof of payment."}</li>
                                <li className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{isZh ? "记录任务发起时间、任务 ID、模式、比例和分辨率，方便排查失败任务。" : "Record task start time, task ID, mode, aspect ratio, and resolution so failed jobs are easier to inspect."}</li>
                                <li className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{isZh ? "把超时和失败分开处理，不要把所有错误都折叠成一个笼统的 500。" : "Handle timeout and model failure separately instead of collapsing everything into one generic 500."}</li>
                            </ul>
                        </div>

                        <div className="soft-panel p-8">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isZh ? "开发文档最该写清楚的部分" : "What your own integration docs should explain clearly"}
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                                <li>{isZh ? "哪些比例和分辨率组合可用，哪些组合会失败。" : "Which aspect-ratio and resolution combinations are valid and which ones fail."}</li>
                                <li>{isZh ? "免费与付费用户的权限边界，例如 1K 与 2K/4K 的解锁逻辑。" : "Where free and paid access differ, such as 1K versus 2K/4K unlock rules."}</li>
                                <li>{isZh ? "失败时是否自动退还额度、重试策略如何定义，以及前端如何给出明确反馈。" : "Whether credits are refunded on failure, how retry policy works, and how the UI communicates errors clearly."}</li>
                            </ul>
                        </div>
                    </section>

                    <section className="section-shell bg-[#fffaf4] p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? "参考资源与下一步" : "Reference resources and next steps"}
                        </h2>
                        <ul className="mt-5 space-y-3 text-slate-700">
                            <li>
                                <a href="https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image" target="_blank" rel="noreferrer" className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? "Kie GPT Image 2 文生图文档" : "Kie GPT Image 2 text-to-image documentation"}
                                </a>
                            </li>
                            <li>
                                <a href="https://docs.kie.ai/market/gpt/gpt-image-2-image-to-image" target="_blank" rel="noreferrer" className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? "Kie GPT Image 2 图生图文档" : "Kie GPT Image 2 image-to-image documentation"}
                                </a>
                            </li>
                            <li>
                                <Link href={`${localePrefix}/create`} className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? "返回 GPT Image 2 生成器" : "Open the GPT Image 2 generator"}
                                </Link>
                            </li>
                            <li>
                                <Link href={`${localePrefix}/pricing`} className="font-semibold text-orange-700 hover:underline">
                                    {isZh ? "查看分辨率与套餐说明" : "See plan and resolution access details"}
                                </Link>
                            </li>
                        </ul>
                    </section>

                    <SupportContactPanel locale={locale as "en" | "zh"} compact />
                </div>
            </div>
        </div>
    );
}
