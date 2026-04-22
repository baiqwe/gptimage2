import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, CheckCircle, AlertCircle, CreditCard, RefreshCw } from "lucide-react";
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
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/terms`,
            languages: {
                'en': `${siteConfig.url}/en/terms`,
                'zh': `${siteConfig.url}/zh/terms`,
                'x-default': `${siteConfig.url}`,
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
        <div className="min-h-screen bg-slate-950">
            <BreadcrumbSchema items={breadcrumbs} />

            {/* Visual Breadcrumb + Header */}
            <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
                <div className="container px-4 md:px-6 py-4">
                    {/* Visual Breadcrumb Navigation */}
                    <nav className="flex items-center text-sm text-slate-400 mb-4 overflow-x-auto whitespace-nowrap">
                        <Link href={localePrefix} className="hover:text-indigo-400 transition-colors">
                            {isZh ? '首页' : 'Home'}
                        </Link>
                        <span className="mx-2 text-slate-600">/</span>
                        <span className="text-white font-medium">{isZh ? '服务条款' : 'Terms of Service'}</span>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-white">{isZh ? '服务条款' : 'Terms of Service'}</h1>
                            <p className="text-sm text-slate-400">
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
                        <div className="inline-flex items-center rounded-full px-4 py-2 text-sm bg-indigo-500/20 text-indigo-300">
                            <Scale className="mr-2 h-5 w-5" />
                            {isZh ? '法律条款' : 'Legal Terms'}
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {isZh ? '服务条款' : 'Terms of Service'}
                        </h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            {isZh
                                ? `使用 ${siteConfig.name} 即表示您同意以下条款。请仔细阅读。`
                                : `By using ${siteConfig.name}, you agree to these terms. Please read them carefully.`}
                        </p>
                    </div>

                    {/* Key Points */}
                    <div className="bg-indigo-500/10 rounded-2xl p-6 border border-indigo-500/30">
                        <h3 className="text-xl font-bold mb-4 text-indigo-300">
                            {isZh ? '简要概述' : 'Quick Summary'}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <p className="text-slate-400">
                                    {isZh
                                        ? 'AI 生成服务 - 使用积分生成 AI 图像，新用户获得免费试用积分'
                                        : 'AI Generation Service - Use credits to generate AI images, new users get free trial credits'}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <p className="text-slate-400">
                                    {isZh
                                        ? '您的图像 - 生成的图像归您所有，可用于商业用途'
                                        : 'Your Images - Generated images belong to you and can be used commercially'}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <p className="text-slate-400">
                                    {isZh
                                        ? '订阅可取消 - 订阅可随时取消，按政策退款'
                                        : 'Subscriptions Cancelable - Subscriptions can be canceled anytime, refunds per policy'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {/* Service Description */}
                        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-bold mb-4 text-white">
                                {isZh ? '1. 服务说明' : '1. Service Description'}
                            </h3>
                            <div className="space-y-4 text-slate-400">
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
                        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-indigo-400" />
                                {isZh ? '2. 积分与付款' : '2. Credits & Payments'}
                            </h3>
                            <div className="space-y-4 text-slate-400">
                                <p>{isZh ? '关于积分系统：' : 'About the credits system:'}</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>{isZh ? '每次图像生成消耗 10 积分' : 'Each image generation costs 10 credits'}</li>
                                    <li>{isZh ? '新注册用户获得免费试用积分' : 'New users receive free trial credits'}</li>
                                    <li>{isZh ? '积分可通过购买套餐或订阅获得' : 'Credits can be obtained by purchasing packs or subscriptions'}</li>
                                    <li>{isZh ? '已购买的积分不可退款' : 'Purchased credits are non-refundable'}</li>
                                    <li>{isZh ? '订阅积分每月重置，未使用部分可累积' : 'Subscription credits reset monthly, unused credits roll over'}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Refund Policy */}
                        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                                <RefreshCw className="w-6 h-6 text-purple-400" />
                                {isZh ? '3. 退款政策' : '3. Refund Policy'}
                            </h3>
                            <div className="space-y-4 text-slate-400">
                                <p>{isZh ? '我们的退款政策如下：' : 'Our refund policy:'}</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>{isZh ? '订阅可在下个计费周期前随时取消' : 'Subscriptions can be canceled anytime before the next billing cycle'}</li>
                                    <li>{isZh ? '首次订阅 7 天内可申请全额退款' : 'First-time subscriptions can request full refund within 7 days'}</li>
                                    <li>{isZh ? '一次性积分包购买后不可退款' : 'One-time credit pack purchases are non-refundable'}</li>
                                    <li>{isZh ? '如遇技术问题导致服务不可用，我们会酌情处理' : 'Technical issues causing service unavailability will be handled case-by-case'}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Acceptable Use */}
                        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-bold mb-4 text-white">
                                {isZh ? '4. 可接受的使用' : '4. Acceptable Use'}
                            </h3>
                            <div className="space-y-4 text-slate-400">
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
                        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-bold mb-4 text-white">
                                {isZh ? '5. 使用限制' : '5. Restrictions'}
                            </h3>
                            <div className="space-y-4 text-slate-400">
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

                        {/* Disclaimer */}
                        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-bold mb-4 text-white">
                                {isZh ? '6. 免责声明' : '6. Disclaimer'}
                            </h3>
                            <div className="space-y-4 text-slate-400">
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
                    <div className="text-center bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-8 border border-slate-700">
                        <h3 className="text-2xl font-bold mb-4 text-white">
                            {isZh ? '联系我们' : 'Contact Us'}
                        </h3>
                        <p className="text-slate-400 mb-6">
                            {isZh
                                ? '如果您对这些条款有任何疑问，请随时联系我们。'
                                : 'If you have any questions about these terms, feel free to contact us.'}
                        </p>
                        <p className="text-slate-300 mb-6">
                            Email: support@{siteConfig.domain}
                        </p>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                            <Link href={localePrefix}>
                                {isZh ? '返回首页' : 'Back to Home'}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
