import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Globe, CreditCard } from "lucide-react";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SupportContactPanel } from "@/components/feature/support-contact";
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
            images: [{ url: siteConfig.socialImage, width: 512, height: 512, alt: siteConfig.name }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.socialImage],
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/privacy`,
            languages: {
                'en': `${siteConfig.url}/en/privacy`,
                'zh': `${siteConfig.url}/zh/privacy`,
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
                        <span className="font-medium text-slate-900">{isZh ? '隐私政策' : 'Privacy Policy'}</span>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-950">{isZh ? '隐私政策' : 'Privacy Policy'}</h1>
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
                            <Shield className="mr-2 h-5 w-5" />
                            {isZh ? '您的隐私很重要' : 'Your Privacy Matters'}
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            {isZh ? '透明的数据处理' : 'Transparent Data Handling'}
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-slate-600">
                            {isZh
                                ? `${siteConfig.name} 致力于保护您的隐私。本政策说明我们收集哪些数据、如何使用以及如何保护它们。`
                                : `${siteConfig.name} is committed to protecting your privacy. This policy explains what data we collect, how we use it, and how we protect it.`}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-[#fffaf4] p-6 shadow-[0_16px_40px_rgba(255,107,44,0.06)]">
                        <h3 className="text-xl font-bold text-slate-900">
                            {isZh ? '太长不看版' : 'TL;DR'}
                        </h3>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                            <p>
                                {isZh
                                    ? '我们会保存账号、积分、支付和必要的生成记录，以便让工作台正常运行。我们不会把您上传的私人参考图或生成内容拿去训练我们自己的基础模型。'
                                    : 'We keep account, credit, payment, and essential generation records so the workspace can function. We do not take your private uploads or generated outputs and use them to train our own foundation model.'}
                            </p>
                            <p>
                                {isZh
                                    ? '分析工具用于理解站点使用情况，而不是读取您的提示词细节。支付由第三方处理，我们不会保存完整银行卡信息。'
                                    : 'Analytics are used to understand how the site is used, not to inspect the substance of your prompts. Payments are handled by third parties, and we do not store full card details.'}
                            </p>
                        </div>
                    </div>

                    {/* Data Collection Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-orange-100 bg-white/90 shadow-[0_16px_40px_rgba(255,107,44,0.06)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <Database className="h-5 w-5 text-orange-500" />
                                    {isZh ? '账户数据' : 'Account Data'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-600">
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

                        <Card className="border-orange-100 bg-white/90 shadow-[0_16px_40px_rgba(255,107,44,0.06)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <Eye className="h-5 w-5 text-orange-500" />
                                    {isZh ? 'AI 图像生成' : 'AI Image Generation'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-600">
                                <p>
                                    {isZh
                                        ? '当您使用 AI 生成功能时：'
                                        : 'When you use the AI generation feature:'}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{isZh ? '您的文字提示词和必要参数会发送至图像生成服务提供商' : 'Your prompts and required parameters are sent to the image-generation provider'}</li>
                                    <li>{isZh ? '参考图会在图生图请求中按需上传，用于完成当前任务' : 'Reference images may be uploaded as part of image-to-image requests for the current task'}</li>
                                    <li>{isZh ? '生成结果会被短期保存，便于预览、下载和重新访问' : 'Generated outputs may be stored for a limited time so they can be previewed, downloaded, and reopened'}</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-100 bg-white/90 shadow-[0_16px_40px_rgba(255,107,44,0.06)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <Globe className="h-5 w-5 text-orange-500" />
                                    {isZh ? '分析数据' : 'Analytics'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-600">
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

                        <Card className="border-orange-100 bg-white/90 shadow-[0_16px_40px_rgba(255,107,44,0.06)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <CreditCard className="h-5 w-5 text-orange-500" />
                                    {isZh ? '支付数据' : 'Payment Data'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-600">
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

                    <div className="rounded-2xl border border-orange-100 bg-white/85 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                        <h3 className="mb-4 text-2xl font-bold text-slate-900">
                            {isZh ? 'AI 相关的隐私说明' : 'AI-specific privacy notes'}
                        </h3>
                        <div className="space-y-4 text-slate-600 leading-8">
                            <p>
                                {isZh
                                    ? '与传统 SaaS 不同，AI 图像产品会处理提示词、参考图和生成输出，因此最重要的问题通常是：这些内容会被保存多久、是否会被再次训练、以及谁可以访问它们。我们在产品设计上尽量遵循最小化原则，只保留完成当前服务、处理账单和支持用户查询所必需的数据。'
                                    : 'Unlike a traditional SaaS tool, an AI image product has to process prompts, reference images, and generated outputs. The most important privacy questions are therefore how long these assets are kept, whether they are reused for training, and who can access them. We try to keep data handling narrow and limited to what is required for the service, billing, and support.'}
                            </p>
                            <p>
                                {isZh
                                    ? '如果您上传的是客户素材、内部产品图或尚未公开的品牌资源，建议您在使用前先确认公司自己的素材政策，并避免在提示词里加入不必要的私人敏感信息。'
                                    : 'If you upload client materials, internal product assets, or unpublished brand resources, it is a good practice to confirm your own organization’s asset policy first and avoid placing unnecessary sensitive personal information directly in prompts.'}
                            </p>
                        </div>
                    </div>

                    {/* Data Protection */}
                    <div className="rounded-2xl border border-orange-100 bg-white/85 p-8 shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                        <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                            <Lock className="h-6 w-6 text-orange-500" />
                            {isZh ? '数据保护' : 'Data Protection'}
                        </h3>
                        <div className="space-y-4 text-slate-600">
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
                    <div className="rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(255,246,236,0.94)_100%)] p-8 shadow-[0_20px_60px_rgba(255,107,44,0.08)]">
                        <h3 className="mb-4 text-2xl font-bold text-slate-900">
                            {isZh ? '您的权利' : 'Your Rights'}
                        </h3>
                        <p className="mb-4 text-slate-600">
                            {isZh
                                ? '您有权随时：'
                                : 'You have the right to:'}
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-slate-600">
                            <li>{isZh ? '请求访问您的个人数据' : 'Request access to your personal data'}</li>
                            <li>{isZh ? '请求删除您的账户和数据' : 'Request deletion of your account and data'}</li>
                            <li>{isZh ? '选择退出分析追踪' : 'Opt out of analytics tracking'}</li>
                            <li>{isZh ? '取消订阅并获得退款（按政策）' : 'Cancel subscription and get refunds (per policy)'}</li>
                        </ul>
                    </div>

                    <SupportContactPanel locale={locale as "en" | "zh"} compact />

                    {/* Contact */}
                    <div className="rounded-2xl border border-orange-100 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(255,107,44,0.06)]">
                        <h3 className="mb-4 text-2xl font-bold text-slate-900">
                            {isZh ? '联系我们' : 'Contact Us'}
                        </h3>
                        <p className="mb-6 text-slate-600">
                            {isZh
                                ? '如果您对隐私政策有任何疑问，请通过以下方式联系我们。'
                                : 'If you have any questions about this privacy policy, please contact us.'}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <a href={`mailto:privacy@${siteConfig.domain}`} className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-200 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50">
                                {isZh ? '发送隐私相关邮件' : 'Email privacy questions'}
                            </a>
                            <Link href={`${localePrefix}/contact`} className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]">
                                {isZh ? '查看联系支持方式' : 'View support contact options'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
