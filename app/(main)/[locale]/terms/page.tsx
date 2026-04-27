import Link from "next/link";
import { Scale, CheckCircle, AlertCircle, CreditCard, RefreshCw } from "lucide-react";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { siteConfig } from "@/config/site";

// Static page - enable CDN caching for better performance
export const dynamic = 'force-static';


export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const title = isZh ? '服务条款' : 'Terms of Service';
    const description = isZh
        ? `${siteConfig.name} 的服务条款。了解使用我们 AI 图像生成服务的条款和条件。`
        : `${siteConfig.name} Terms of Service. Learn about the terms and conditions for using our AI image generation service.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/terms`,
            images: [{ url: siteConfig.socialImage, width: 512, height: 512, alt: siteConfig.name }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.socialImage],
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/terms`,
            languages: {
                'en': `${siteConfig.url}/en/terms`,
                'zh': `${siteConfig.url}/zh/terms`,
            },
        },
    };
}

export default async function TermsPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const breadcrumbs = [
        { name: isZh ? '首页' : 'Home', url: `${siteConfig.url}/${locale}` },
        { name: isZh ? '服务条款' : 'Terms of Service', url: `${siteConfig.url}/${locale}/terms` },
    ];

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ee_48%,#fff3e7_100%)]">
            <BreadcrumbSchema items={breadcrumbs} />

            {/* Visual Breadcrumb + Header */}
            <div className="border-b border-orange-100 bg-white/85 backdrop-blur">
                <div className="container px-4 md:px-6 py-4">
                    {/* Visual Breadcrumb Navigation */}
                    <nav className="mb-4 flex items-center overflow-x-auto whitespace-nowrap text-sm text-slate-500">
                        <Link href={localePrefix} className="transition-colors hover:text-orange-600">
                            {isZh ? '首页' : 'Home'}
                        </Link>
                        <span className="mx-2 text-orange-200">/</span>
                        <span className="font-medium text-slate-900">{isZh ? '服务条款' : 'Terms of Service'}</span>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-950">{isZh ? '服务条款' : 'Terms of Service'}</h1>
                            <p className="text-sm text-slate-500">
                                {isZh ? '最后更新：2026年1月' : 'Last updated: January 2026'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container px-4 md:px-6 py-16">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Hero */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-sm text-orange-600">
                            <Scale className="mr-2 h-5 w-5" />
                            {isZh ? '法律条款' : 'Legal Terms'}
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            {isZh ? '服务条款' : 'Terms of Service'}
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-slate-600">
                            {isZh
                                ? `使用 ${siteConfig.name} 即表示您同意以下条款。请仔细阅读。`
                                : `By using ${siteConfig.name}, you agree to these terms. Please read them carefully.`}
                        </p>
                    </div>

                    {/* Key Points */}
                    <div className="rounded-2xl border border-orange-100 bg-white/85 p-6 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                        <h3 className="mb-4 text-xl font-bold text-slate-900">
                            {isZh ? '简要概述' : 'Quick Summary'}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <p className="text-slate-600">
                                    {isZh
                                        ? 'AI 生成服务 - 使用积分生成 AI 图像，新用户获得免费试用积分'
                                        : 'AI Generation Service - Use credits to generate AI images, new users get free trial credits'}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <p className="text-slate-600">
                                    {isZh
                                        ? '输出使用 - 您可以将结果纳入自己的工作流使用，但仍需自行确认输入素材和最终用途符合法律与第三方权利要求'
                                        : 'Output usage - You can use results in your own workflow, but you remain responsible for making sure your inputs and final use comply with law and any third-party rights'}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <p className="text-slate-600">
                                    {isZh
                                        ? '订阅可管理 - 您可以在当前计费周期结束前管理或取消续费'
                                        : 'Subscriptions manageable - You can manage or cancel renewal before the end of the current billing cycle'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-[#fffaf4] p-6 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                        <h3 className="text-xl font-bold text-slate-900">
                            {isZh ? '太长不看版' : 'TL;DR'}
                        </h3>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                            <p>
                                {isZh
                                    ? '这个工作台提供的是按积分和订阅计费的 AI 图像生成服务。您可以把生成结果用于自己的项目，但如果提示词、参考图或成品涉及第三方品牌、肖像或受保护内容，相关责任仍由您承担。'
                                    : 'This workspace is an AI image service sold through credits and subscriptions. You can use the outputs in your own work, but if prompts, references, or final assets involve third-party brands, likenesses, or protected materials, the responsibility still stays with you.'}
                            </p>
                            <p>
                                {isZh
                                    ? '我们会尽量让额度、分辨率、购买和取消逻辑说清楚，但不保证服务永远不中断，也不保证每一次生成都能满足特定商业标准。'
                                    : 'We try to be clear about credits, resolution access, purchasing, and cancellation, but we do not guarantee uninterrupted service or that every generated image will meet a specific commercial standard.'}
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {/* Service Description */}
                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                {isZh ? '1. 服务说明' : '1. Service Description'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>
                                    {isZh
                                        ? `${siteConfig.name} 是一个 AI 图像生成平台，我们提供：`
                                        : `${siteConfig.name} is an AI image generation platform. We provide:`}
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>{isZh ? '文字转图像 AI 生成' : 'Text-to-image AI generation'}</li>
                                    <li>{isZh ? '多种艺术风格（写实、动漫、电影等）' : 'Multiple art styles (photo, anime, cinema, etc.)'}</li>
                                    <li>{isZh ? '多种宽高比选择' : 'Multiple aspect ratio options'}</li>
                                    <li>{isZh ? '高分辨率输出' : 'High-resolution output'}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Credits & Payments */}
                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-900">
                                <CreditCard className="w-6 h-6 text-orange-500" />
                                {isZh ? '2. 积分与付款' : '2. Credits & Payments'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>{isZh ? '关于积分系统：' : 'About the credits system:'}</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>{isZh ? '每次图像生成消耗 10 积分' : 'Each image generation costs 10 credits'}</li>
                                    <li>{isZh ? '新注册用户获得免费试用积分' : 'New users receive free trial credits'}</li>
                                    <li>{isZh ? '积分可通过购买套餐或订阅获得' : 'Credits can be obtained by purchasing packs or subscriptions'}</li>
                                    <li>{isZh ? '一次性积分包是否退款以实际购买政策和支付平台处理结果为准' : 'Whether one-time credit packs are refundable depends on the active purchase policy and payment-processor handling'}</li>
                                    <li>{isZh ? '订阅型额度按周期发放，具体可用量以账户面板显示为准' : 'Subscription credits are issued per cycle, and the account dashboard is the source of truth for available balance'}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Refund Policy */}
                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-900">
                                <RefreshCw className="w-6 h-6 text-orange-500" />
                                {isZh ? '3. 退款政策' : '3. Refund Policy'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>{isZh ? '我们的退款政策如下：' : 'Our refund policy:'}</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>{isZh ? '订阅可在下个计费周期前随时取消' : 'Subscriptions can be canceled anytime before the next billing cycle'}</li>
                                    <li>{isZh ? '是否退款、退款比例以及支持范围以支付平台规则和实际问题类型为准' : 'Eligibility, scope, and amount of any refund depend on payment-processor rules and the nature of the issue'}</li>
                                    <li>{isZh ? '如果因为平台或模型错误导致明确失败，我们会优先处理额度回退或案例排查' : 'If a generation clearly fails because of platform or model error, we prioritize credit restoration or case-by-case review'}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Acceptable Use */}
                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                {isZh ? '4. 可接受的使用' : '4. Acceptable Use'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>{isZh ? '您可以：' : 'You may:'}</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        <span>{isZh ? '将生成的图像用于个人项目' : 'Use generated images for personal projects'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        <span>{isZh ? '将生成的图像用于商业项目' : 'Use generated images for commercial projects'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        <span>{isZh ? '分享生成的图像' : 'Share generated images'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        <span>{isZh ? '在社交媒体发布' : 'Post on social media'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Restrictions */}
                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                {isZh ? '5. 使用限制' : '5. Restrictions'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>{isZh ? '您不得：' : 'You may not:'}</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                        <span>{isZh ? '生成非法、有害或违反法律的内容' : 'Generate illegal, harmful, or law-violating content'}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                        <span>{isZh ? '尝试绕过内容安全过滤' : 'Attempt to bypass content safety filters'}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                        <span>{isZh ? '使用自动化工具大规模访问 API' : 'Use automated tools to access API at scale'}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                        <span>{isZh ? '共享账户或转售服务' : 'Share accounts or resell the service'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                {isZh ? '6. AI 生成内容与责任边界' : '6. AI outputs and responsibility boundaries'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>
                                    {isZh
                                        ? 'AI 生成图像并不等于获得自动的法律保证。即使输出来自工作台，您仍然需要对提示词、参考图、品牌元素、人物肖像和最终发布环境承担判断责任。'
                                        : 'An AI-generated image is not the same thing as an automatic legal guarantee. Even when the output comes from the workspace, you remain responsible for the prompts, references, brand elements, likenesses, and the context in which the final image is published.'}
                                </p>
                                <p>
                                    {isZh
                                        ? '如果您要把生成内容用于广告、商品销售页、品牌物料或客户项目，建议在正式发布前完成内部审核，而不是把模型输出当作无需复查的终稿。'
                                        : 'If the output is headed for advertising, product pages, brand materials, or client work, it is good practice to run internal review before publication rather than treating the model output as an unreviewed final asset.'}
                                </p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                            <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                {isZh ? '7. 免责声明' : '7. Disclaimer'}
                            </h3>
                            <div className="space-y-4 text-slate-600">
                                <p>
                                    {isZh
                                        ? '本服务按"原样"提供，不作任何明示或暗示的保证。我们不保证：'
                                        : 'This service is provided "as is" without any express or implied warranties. We do not guarantee:'}
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>{isZh ? '服务将始终可用或不间断' : 'The service will always be available or uninterrupted'}</li>
                                    <li>{isZh ? 'AI 生成结果将满足您的特定需求' : 'AI generation results will meet your specific needs'}</li>
                                    <li>{isZh ? '生成的内容不会侵犯第三方权利' : 'Generated content will not infringe third-party rights'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                        <h3 className="mb-4 text-2xl font-bold text-slate-900">
                            {isZh ? '联系我们' : 'Contact Us'}
                        </h3>
                        <p className="mb-6 text-slate-600">
                            {isZh
                                ? '如果您对这些条款有任何疑问，请随时联系我们。'
                                : 'If you have any questions about these terms, feel free to contact us.'}
                        </p>
                        <p className="mb-6 text-slate-700">
                            Email: support@{siteConfig.domain}
                        </p>
                        <Link href={localePrefix} className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]">
                            {isZh ? '返回首页' : 'Back to Home'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
