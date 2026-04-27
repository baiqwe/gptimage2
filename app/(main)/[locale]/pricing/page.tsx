import Link from "next/link";
import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQSchema } from "@/components/breadcrumb-schema";
import { SupportContactPanel } from "@/components/feature/support-contact";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === "zh";
    const title = isZh ? "GPT Image 2 定价" : "GPT Image 2 Pricing";
    const description = isZh
        ? "灵活的 GPT Image 2 定价方案，覆盖买断、月付与年付。适合从单次项目到长期创作工作流。"
        : "Flexible GPT Image 2 pricing for one-time projects, monthly usage, and annual creative workflows.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            url: `${siteConfig.url}/${locale}/pricing`,
            images: [{ url: siteConfig.socialImage, width: 512, height: 512, alt: siteConfig.name }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [siteConfig.socialImage],
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/pricing`,
            languages: {
                en: `${siteConfig.url}/en/pricing`,
                zh: `${siteConfig.url}/zh/pricing`,
            },
        },
    };
}

type Props = {
    params: Promise<{ locale: string }>;
};

const planComparison = {
    en: [
        ["Monthly image allowance", "40 images total", "100 images / month", "100 images / month"],
        ["Resolution access", "1K", "1K, 2K, 4K", "1K, 2K, 4K"],
        ["Text to image", "Included", "Included", "Included"],
        ["Image to image editing", "Included", "Included", "Included"],
        ["Commercial use", "Allowed", "Allowed", "Allowed"],
        ["Best fit", "One short project", "Ongoing monthly work", "Lowest monthly effective price"],
    ],
    zh: [
        ["每月可用图量", "总计 40 张", "每月 100 张", "每月 100 张"],
        ["分辨率权限", "1K", "1K、2K、4K", "1K、2K、4K"],
        ["文生图", "包含", "包含", "包含"],
        ["图生图编辑", "包含", "包含", "包含"],
        ["商用使用", "支持", "支持", "支持"],
        ["更适合谁", "短期单次项目", "持续的月度创作", "追求最低月均成本"],
    ],
};

export default async function PricingPage({ params }: Props) {
    const { locale } = await params;
    const isZh = locale === "zh";
    const localePrefix = `/${locale}`;
    setRequestLocale(locale);

    const faqItems = [
        {
            question: isZh ? "免费用户能使用哪些功能？" : "What can a free user access?",
            answer: isZh
                ? "免费用户可以体验 GPT Image 2 的文生图和图生图基础流程，并使用 1K 分辨率。2K 和 4K 需要购买任意积分包或订阅后解锁。"
                : "Free users can try the core GPT Image 2 text-to-image and image-to-image workflow with 1K output. 2K and 4K unlock after any paid credits pack or subscription.",
        },
        {
            question: isZh ? "买断和订阅有什么区别？" : "What is the difference between one-time credits and a subscription?",
            answer: isZh
                ? "买断更适合一次性项目或偶尔生成；订阅更适合持续性的设计、营销和内容工作流。年付的月均成本更低。"
                : "A one-time pack is best for a short project or occasional use, while subscriptions fit recurring design, marketing, or content workflows. Annual billing gives the lowest effective monthly cost.",
        },
        {
            question: isZh ? "生成的图片可以商用吗？" : "Can I use generated images commercially?",
            answer: isZh
                ? "付费用户可以将生成结果用于自己的商业工作流，但仍需确保您输入的品牌素材、参考图和最终用途符合当地法律及第三方权利要求。"
                : "Paid users can use generated outputs in their own commercial workflows, but you are still responsible for making sure your prompts, reference assets, and final use comply with local law and any third-party rights.",
        },
        {
            question: isZh ? "订阅可以随时取消吗？" : "Can I cancel a subscription anytime?",
            answer: isZh
                ? "可以。您可以在当前计费周期结束前管理或取消订阅，取消后不会再自动续费。"
                : "Yes. You can manage or cancel a subscription before the end of the current billing cycle, and it will not renew after cancellation.",
        },
        {
            question: isZh ? "为什么 1:1 不能直接选 4K？" : "Why is 4K not available for 1:1 output?",
            answer: isZh
                ? "这是当前 GPT Image 2 接口的分辨率约束之一。系统会根据比例和分辨率的真实兼容规则进行校验，避免生成请求失败。"
                : "This is one of the current GPT Image 2 API constraints. The workspace validates real aspect-ratio and resolution compatibility before a request is sent, so you do not waste a generation on an invalid combination.",
        },
        {
            question: isZh ? "积分会过期吗？" : "Do credits expire?",
            answer: isZh
                ? "一次性购买的积分不会过期。订阅型积分按周期发放，具体可用量以您当前的订阅状态和账户面板显示为准。"
                : "One-time purchased credits do not expire. Subscription credits are issued per billing cycle, and your available balance is shown in your account dashboard.",
        },
    ];

    const comparisonRows = isZh ? planComparison.zh : planComparison.en;

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f2_0%,#fff6ed_48%,#fffdf9_100%)]">
            <FAQSchema items={faqItems} />

            <PricingSection locale={locale} />

            <div className="container mx-auto max-w-6xl space-y-10 px-4 pb-20">
                <section className="section-shell p-8 md:p-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
                            <Sparkles className="h-4 w-4" />
                            {isZh ? "如何选择套餐" : "How to choose a plan"}
                        </div>
                        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            {isZh ? "GPT Image 2 定价不仅是报价，也是工作流选择指南" : "GPT Image 2 pricing is also a workflow guide"}
                        </h1>
                        <div className="mt-5 space-y-4 text-base leading-8 text-slate-600">
                            <p>
                                {isZh
                                    ? "工具类 AI 产品的定价页不应该只告诉你价格，更应该帮助你判断哪种购买方式和你的工作节奏匹配。对短期项目来说，一次性买断更直接；对持续性的内容设计、电商素材或视觉提案工作来说，订阅通常更稳定，也更容易形成固定产能。"
                                    : "A pricing page should do more than list numbers. It should help you decide which purchase mode actually fits the way you work. A one-time pack is often the simplest option for a short project, while a subscription is more stable for recurring design, e-commerce, and visual-production work."}
                            </p>
                            <p>
                                {isZh
                                    ? "当前的 GPT Image 2 工作台把选择逻辑尽量做得简单：免费用户可以先体验完整流程，并在 1K 分辨率下验证提示词、比例和编辑方式；只要购买任意积分包或订阅，即可解锁 2K 和 4K，并在更高分辨率下完成海报、商品图、社媒封面或概念图的交付。"
                                    : "The current GPT Image 2 workspace keeps the decision logic simple. Free users can validate prompts, ratios, and editing flow in 1K first. Any paid pack or subscription unlocks 2K and 4K, which makes the workspace more practical for deliverables such as posters, product visuals, social covers, and concept boards."}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="section-shell overflow-hidden p-0">
                    <div className="border-b border-orange-100 px-8 py-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? "套餐对比表" : "Plan comparison"}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            {isZh
                                ? "这个表格用更接近实际工作的维度来比较套餐：分辨率权限、图像模式、商用使用以及更适合的任务阶段。"
                                : "This table compares plans by practical workflow dimensions such as resolution access, generation modes, commercial use, and the kind of work each plan fits best."}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-orange-100">
                            <thead className="bg-[#fff8f1]">
                                <tr className="text-left text-sm font-semibold text-slate-700">
                                    <th className="px-6 py-4">{isZh ? "项目" : "Feature"}</th>
                                    <th className="px-6 py-4">{isZh ? "买断" : "Pay once"}</th>
                                    <th className="px-6 py-4">{isZh ? "月付" : "Monthly"}</th>
                                    <th className="px-6 py-4">{isZh ? "年付" : "Annual"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100 bg-white">
                                {comparisonRows.map((row) => (
                                    <tr key={row[0]} className="text-sm text-slate-600">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{row[0]}</td>
                                        <td className="px-6 py-4">{row[1]}</td>
                                        <td className="px-6 py-4">{row[2]}</td>
                                        <td className="px-6 py-4">{row[3]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <div className="soft-panel p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5ec]">
                            <ShieldCheck className="h-6 w-6 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? "商用使用说明" : "Commercial-use notes"}
                        </h2>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                            <p>
                                {isZh
                                    ? "很多用户来到定价页时，最后一个关键问题并不是价格本身，而是“这些图能不能真正用到业务里”。对付费用户来说，这个工作台的目标就是帮助你生成可以进入提案、商品页、广告版位、演示稿或社媒资产的视觉。"
                                    : "For many buyers, the last important question is not the price itself but whether the outputs can actually be used in real business work. For paid users, this workspace is designed to help you create visuals that can move into proposals, product pages, ad slots, pitch decks, or social assets."}
                            </p>
                            <p>
                                {isZh
                                    ? "不过，商用可用并不等于没有责任。若您在提示词或参考图里加入了品牌元素、人物肖像、第三方素材或受保护内容，仍需自行确认相应权利、授权和本地法规要求。"
                                    : "Commercial use does not remove responsibility. If your prompt or references include brand elements, likenesses, third-party assets, or other protected material, you still need to make sure you have the right to use them and that your final workflow complies with local law."}
                            </p>
                        </div>
                    </div>

                    <div className="soft-panel p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5ec]">
                            <Zap className="h-6 w-6 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? "购买前最值得关注的三件事" : "Three things worth checking before purchase"}
                        </h2>
                        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                            <li className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{isZh ? "如果你只是验证 prompt 方向，先用免费额度和 1K 足够。" : "If you are only validating prompt direction, free credits and 1K are usually enough to start."}</li>
                            <li className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{isZh ? "如果你要做展示级海报、社媒封面或商品视觉，建议至少解锁 2K。" : "If you are producing presentation-grade posters, social covers, or product visuals, 2K is usually the better baseline."}</li>
                            <li className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{isZh ? "如果你已经确定会持续使用，年付通常拥有更低的月均成本。" : "If you already know this will be part of a recurring workflow, annual billing usually gives the lowest effective monthly cost."}</li>
                        </ul>
                    </div>
                </section>

                <SupportContactPanel locale={locale as "en" | "zh"} compact />

                <section className="section-shell p-8 md:p-10">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isZh ? "常见问题" : "Frequently asked questions"}
                    </h2>
                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                        {faqItems.map((item) => (
                            <div key={item.question} className="rounded-2xl border border-orange-100 bg-white p-6">
                                <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="section-shell p-8 text-center md:p-10">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isZh ? "先试一张，再决定是否升级" : "Try one real image before you upgrade"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
                        {isZh
                            ? "如果你还在犹豫，最好的方式不是反复比较文案，而是直接生成一个与你工作最接近的场景：商品图、社媒海报、UI 概念图或角色视觉。先在免费额度里验证流程，再决定是否需要更高分辨率或更稳定的月度用量。"
                            : "If you are still deciding, the fastest way is not to compare copy endlessly but to generate one image that resembles your real workflow: a product visual, a social poster, a UI concept, or a character scene. Validate the flow with free credits first, then decide whether you need higher resolution or a steadier monthly allowance."}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link href={`${localePrefix}/create`} className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]">
                            {isZh ? "前往生成器" : "Open the generator"}
                        </Link>
                        <Link href={`${localePrefix}/about`} className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-200 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                            {isZh ? "了解产品定位" : "Read the product overview"}
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
