import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, CreditCard } from "lucide-react";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { siteConfig } from "@/config/site";

// Static page - enable CDN caching for better performance
export const dynamic = 'force-static';


export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const title = isZh ? '隐私政策' : 'Privacy Policy';
    const description = isZh
        ? `${siteConfig.name} 的隐私政策。了解我们如何收集、使用和保护您的数据。`
        : `${siteConfig.name} Privacy Policy. Learn how we collect, use, and protect your data.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/privacy`,
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/privacy`,
            languages: {
                'en': `${siteConfig.url}/en/privacy`,
                'zh': `${siteConfig.url}/zh/privacy`,
                'x-default': `${siteConfig.url}/en/privacy`,
            },
        },
    };
}

export default async function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;

    const breadcrumbs = [
        { name: isZh ? '首页' : 'Home', url: `${siteConfig.url}/${locale}` },
        { name: isZh ? '隐私政策' : 'Privacy Policy', url: `${siteConfig.url}/${locale}/privacy` },
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
                        <span className="text-white font-medium">{isZh ? '隐私政策' : 'Privacy Policy'}</span>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-white">{isZh ? '隐私政策' : 'Privacy Policy'}</h1>
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
                            <Shield className="mr-2 h-5 w-5" />
                            {isZh ? '您的隐私很重要' : 'Your Privacy Matters'}
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {isZh ? '透明的数据处理' : 'Transparent Data Handling'}
                        </h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            {isZh
                                ? `${siteConfig.name} 致力于保护您的隐私。本政策说明我们收集哪些数据、如何使用以及如何保护它们。`
                                : `${siteConfig.name} is committed to protecting your privacy. This policy explains what data we collect, how we use it, and how we protect it.`}
                        </p>
                    </div>

                    {/* Data Collection Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Database className="h-5 w-5 text-indigo-400" />
                                    {isZh ? '账户数据' : 'Account Data'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-400">
                                <p>
                                    {isZh
                                        ? '当您注册账户时，我们通过 Supabase Auth 收集：'
                                        : 'When you create an account, we collect via Supabase Auth:'}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{isZh ? '电子邮件地址' : 'Email address'}</li>
                                    <li>{isZh ? '账户创建时间' : 'Account creation timestamp'}</li>
                                    <li>{isZh ? 'Google OAuth 信息（如使用）' : 'Google OAuth info (if used)'}</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Eye className="h-5 w-5 text-purple-400" />
                                    {isZh ? 'AI 图像生成' : 'AI Image Generation'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-400">
                                <p>
                                    {isZh
                                        ? '当您使用 AI 生成功能时：'
                                        : 'When you use the AI generation feature:'}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{isZh ? '您的文字提示词会发送至图像生成 API' : 'Your text prompts are sent to the image generation API'}</li>
                                    <li>{isZh ? '生成的图像会临时存储供下载' : 'Generated images are temporarily stored for download'}</li>
                                    <li>{isZh ? '我们不会永久保留您的生成内容' : 'We do not permanently retain your generations'}</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Globe className="h-5 w-5 text-cyan-400" />
                                    {isZh ? '分析数据' : 'Analytics'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-400">
                                <p>
                                    {isZh
                                        ? '我们使用 Google Analytics 收集匿名使用数据：'
                                        : 'We use Google Analytics to collect anonymous usage data:'}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{isZh ? '页面浏览量和访问时长' : 'Page views and session duration'}</li>
                                    <li>{isZh ? '设备类型和浏览器信息' : 'Device type and browser info'}</li>
                                    <li>{isZh ? '大致地理位置（国家级别）' : 'Approximate location (country level)'}</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <CreditCard className="h-5 w-5 text-emerald-400" />
                                    {isZh ? '支付数据' : 'Payment Data'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-400">
                                <p>
                                    {isZh
                                        ? '支付由 Creem 安全处理：'
                                        : 'Payments are securely processed by Creem:'}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{isZh ? '我们不存储您的完整信用卡信息' : 'We do not store your full credit card info'}</li>
                                    <li>{isZh ? '订阅状态和交易记录会保存' : 'Subscription status and transaction records are saved'}</li>
                                    <li>{isZh ? '退款请求通过 Creem 处理' : 'Refund requests are handled via Creem'}</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Protection */}
                    <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                            <Lock className="h-6 w-6 text-indigo-400" />
                            {isZh ? '数据保护' : 'Data Protection'}
                        </h3>
                        <div className="space-y-4 text-slate-400">
                            <p>
                                {isZh
                                    ? '我们采取以下措施保护您的数据：'
                                    : 'We take the following measures to protect your data:'}
                            </p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>{isZh ? '所有数据传输使用 HTTPS 加密' : 'All data transfers use HTTPS encryption'}</li>
                                <li>{isZh ? '数据库使用行级安全策略 (RLS)' : 'Database uses Row Level Security (RLS)'}</li>
                                <li>{isZh ? '敏感信息不会记录在日志中' : 'Sensitive information is not logged'}</li>
                                <li>{isZh ? '定期安全审计和更新' : 'Regular security audits and updates'}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Your Rights */}
                    <div className="bg-indigo-500/10 rounded-2xl p-8 border border-indigo-500/30">
                        <h3 className="text-2xl font-bold mb-4 text-white">
                            {isZh ? '您的权利' : 'Your Rights'}
                        </h3>
                        <p className="text-slate-400 mb-4">
                            {isZh
                                ? '您有权随时：'
                                : 'You have the right to:'}
                        </p>
                        <ul className="space-y-2 text-slate-400 list-disc list-inside">
                            <li>{isZh ? '请求访问您的个人数据' : 'Request access to your personal data'}</li>
                            <li>{isZh ? '请求删除您的账户和数据' : 'Request deletion of your account and data'}</li>
                            <li>{isZh ? '选择退出分析追踪' : 'Opt out of analytics tracking'}</li>
                            <li>{isZh ? '取消订阅并获得退款（按政策）' : 'Cancel subscription and get refunds (per policy)'}</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-center bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-8 border border-slate-700">
                        <h3 className="text-2xl font-bold mb-4 text-white">
                            {isZh ? '联系我们' : 'Contact Us'}
                        </h3>
                        <p className="text-slate-400 mb-6">
                            {isZh
                                ? '如果您对隐私政策有任何疑问，请通过以下方式联系我们。'
                                : 'If you have any questions about this privacy policy, please contact us.'}
                        </p>
                        <p className="text-slate-300 mb-6">
                            Email: privacy@{siteConfig.domain}
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
