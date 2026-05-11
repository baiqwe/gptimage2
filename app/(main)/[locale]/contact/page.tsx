import Link from "next/link";
import { MessageCircleMore, Mail, ArrowRight } from "lucide-react";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SupportContactPanel } from "@/components/feature/support-contact";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === "zh";
    const title = isZh ? "联系支持" : "Contact Support";
    const description = isZh
        ? "通过企业微信或邮件快速联系 GPT Image 2 Generator 支持团队，处理支付、登录、积分和生图问题。"
        : "Reach GPT Image 2 Generator support quickly through WeCom or email for billing, sign-in, credits, and generation issues.";

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/contact`,
            languages: {
                en: `${siteConfig.url}/en/contact`,
                zh: `${siteConfig.url}/zh/contact`,
            },
        },
        openGraph: {
            title,
            description,
            type: "website",
            url: `${siteConfig.url}/${locale}/contact`,
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

export default async function ContactPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === "zh";
    const localePrefix = `/${locale}`;

    const breadcrumbs = [
        { name: isZh ? "首页" : "Home", url: `${siteConfig.url}/${locale}` },
        { name: isZh ? "联系支持" : "Contact Support", url: `${siteConfig.url}/${locale}/contact` },
    ];

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff6ed_45%,#fffdf9_100%)]">
            <BreadcrumbSchema items={breadcrumbs} />

            <div className="border-b border-orange-100 bg-white/80 backdrop-blur">
                <div className="container px-4 py-4 md:px-6">
                    <nav className="flex items-center overflow-x-auto whitespace-nowrap text-sm text-slate-500">
                        <Link href={localePrefix} className="transition-colors hover:text-orange-600">
                            {isZh ? "首页" : "Home"}
                        </Link>
                        <span className="mx-2 text-orange-200">/</span>
                        <span className="font-medium text-slate-900">{isZh ? "联系支持" : "Contact Support"}</span>
                    </nav>
                </div>
            </div>

            <div className="container px-4 py-16 md:px-6 md:py-20">
                <div className="mx-auto max-w-5xl space-y-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
                            <MessageCircleMore className="h-4 w-4" />
                            {isZh ? "联系真实支持" : "Talk to a real person"}
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            {isZh ? "联系 GPT Image 2 支持" : "Contact GPT Image 2 Support"}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {isZh
                                ? "如果你在付款、登录、积分、高清权限或图像生成上遇到问题，可以直接通过企业微信联系我。我们也保留邮件支持，用于需要补充订单信息或截图说明的场景。"
                                : "If you run into billing, sign-in, credits, high-resolution access, or image-generation issues, the fastest route is to message me on WeCom. Email is also available when you need to share order details or screenshots."}
                        </p>
                    </div>

                    <SupportContactPanel locale={locale as "en" | "zh"} />

                    <section className="grid gap-6 md:grid-cols-2">
                        <div className="soft-panel p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5ec]">
                                <MessageCircleMore className="h-6 w-6 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isZh ? "什么时候更适合用企业微信" : "When WeCom is the fastest option"}
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                                <li>{isZh ? "付款失败、订阅异常、积分未到账" : "Payment failures, subscription issues, or missing credits"}</li>
                                <li>{isZh ? "登录恢复、Google 登录跳转、账号状态异常" : "Sign-in recovery, Google-login redirects, or account-state issues"}</li>
                                <li>{isZh ? "高清分辨率权限、生图报错、图生图异常" : "High-resolution access, generation errors, or image-to-image issues"}</li>
                            </ul>
                        </div>

                        <div className="soft-panel p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5ec]">
                                <Mail className="h-6 w-6 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isZh ? "什么时候适合发邮件" : "When email is still useful"}
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isZh
                                    ? "如果你需要附上订单截图、支付凭证、复杂的错误说明或较长的背景信息，邮件通常更适合沉淀完整上下文。"
                                    : "If you need to attach order screenshots, payment receipts, longer error descriptions, or more context, email is often the better channel."}
                            </p>
                            <a
                                href={`mailto:${siteConfig.supportEmail}`}
                                className="mt-6 inline-flex items-center text-sm font-semibold text-orange-700 hover:underline"
                            >
                                {isZh ? "发送邮件给支持团队" : "Email the support team"} <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
