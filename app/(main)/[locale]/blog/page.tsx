import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/config/blog-posts';

// 静态页面 - 启用 CDN 缓存
export const dynamic = 'force-static';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const title = isZh ? 'GPT Image 2 指南与评测' : 'GPT Image 2 Guides and Reviews';
    const description = isZh
        ? `${siteConfig.name} 博客，包含 GPT Image 2 评测、竞品对比、提示词指南、发布时间解读与开发者资源。`
        : `${siteConfig.name} blog with GPT Image 2 reviews, comparisons, prompt guides, release-date explainers, and developer resources.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/blog`,
            images: [{ url: siteConfig.socialImage, width: 512, height: 512, alt: siteConfig.name }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.socialImage],
        },
        alternates: {
            canonical: `${siteConfig.url}/${locale}/blog`,
            languages: {
                'en': `${siteConfig.url}/en/blog`,
                'zh': `${siteConfig.url}/zh/blog`,
            },
        },
    };
}

// 从配置获取博客列表
function getPosts(locale: string) {
    const isZh = locale === 'zh';
    return blogPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.description,
        date: post.publishDate,
        readTime: isZh ? '长文' : 'Long read',
        tags: post.keywords.slice(0, 2).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        heroImage: post.heroImage,
    }));
}

export default async function BlogPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;
    const posts = getPosts(locale);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff7ef_46%,#fffdf9_100%)]">
            <div className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
                {/* Header */}
                <div className="mb-14 text-center md:mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 mb-6">
                        <Sparkles className="w-4 h-4" />
                        {isZh ? '精选内容' : 'Featured Reads'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        {isZh ? 'GPT Image 2 评测、教程与实战指南' : 'GPT Image 2 Reviews, Tutorials, and Practical Guides'}
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        {isZh
                            ? '你可以在这里快速找到 GPT Image 2 的评测、命名解释、竞品比较、提示词案例和工作流程建议，帮助你更快判断该怎么用、适不适合你。'
                            : 'Explore GPT Image 2 reviews, naming explainers, competitor comparisons, prompt examples, and workflow guides so you can quickly decide what to try next.'}
                    </p>
                </div>

                <div className="mb-14 grid gap-6 md:grid-cols-2">
                    <div className="section-shell p-6 md:p-7">
                        <div className="flex items-center gap-3 text-slate-900">
                            <BookOpen className="h-5 w-5 text-orange-500" />
                            <h2 className="text-xl font-bold">{isZh ? '你能在这里看到什么' : 'What You Can Find Here'}</h2>
                        </div>
                        <p className="mt-4 leading-7 text-slate-600">
                            {isZh
                                ? '这里既有 GPT Image 2 和 ChatGPT Image 2 的使用解读，也有 Nano Banana 2、Pollo AI、Lovart、Kimi K2.6 等工具的对比文章。如果你想找提示词、看案例或判断哪条工作流更适合自己，都可以从这里开始。'
                                : 'This section brings together GPT Image 2 explainers, ChatGPT Image 2 usage guides, and comparisons with tools like Nano Banana 2, Pollo AI, Lovart, and Kimi K2.6. If you want prompt ideas, visual examples, or a clearer workflow choice, this is the place to start.'}
                        </p>
                    </div>
                    <div className="section-shell bg-[#fffaf4] p-6 md:p-7">
                        <div className="flex items-center gap-3 text-slate-900">
                            <ShieldCheck className="h-5 w-5 text-orange-500" />
                            <h2 className="text-xl font-bold">{isZh ? '为什么这些文章值得读' : 'Why These Guides Are Useful'}</h2>
                        </div>
                        <p className="mt-4 leading-7 text-slate-600">
                            {isZh
                                ? '我们会尽量把每篇文章写清楚：适合谁看、和哪些工具有关、可以直接参考的提示词是什么、下一步该去哪里继续尝试。这样你不需要先读完一堆泛泛而谈的介绍，能更快找到真正有用的信息。'
                                : 'Each article is designed to be practical: who it is for, what problem it solves, which prompts or comparisons are worth trying, and where to go next if you want to test the workflow yourself.'}
                        </p>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="mb-16 grid gap-8 md:grid-cols-2">
                    {posts.map(post => (
                        <Link key={post.slug} href={`${localePrefix}/blog/${post.slug}`} className="group">
                            <Card className="h-full overflow-hidden border-orange-100 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(235,145,71,0.12)]">
                                {post.heroImage && (
                                    <div className="relative aspect-[16/9] overflow-hidden border-b border-orange-100 bg-[#fff7ef]">
                                        <Image
                                            src={post.heroImage}
                                            alt={`${post.title}. ${post.excerpt}`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                    </div>
                                )}
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-[#fff3ea] text-orange-700 border border-orange-100">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-600 mb-4 line-clamp-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mb-16 grid gap-6 lg:grid-cols-2">
                    <div className="section-shell p-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? '为什么这些文章适合分开阅读' : 'Why These Guides Work Better as Separate Reads'}
                        </h2>
                        <p className="mt-4 leading-8 text-slate-600">
                            {isZh
                                ? '有的文章适合帮你理解 GPT Image 2 是什么，有的文章适合做模型对比，还有的更适合直接抄 prompt 去测试。把它们拆开以后，你可以按自己的问题直接进入最相关的内容。'
                                : 'Some guides are best for understanding what GPT Image 2 is, some are better for side-by-side comparisons, and others are made for prompt testing. Keeping them separate makes it easier to jump straight to the kind of help you need.'}
                        </p>
                        <p className="mt-4 leading-8 text-slate-600">
                            {isZh
                                ? '如果两个主题解决的是同一个问题，我们会把它们放到同一篇更完整的文章里，这样你看到的是更实用、更完整的内容。'
                                : 'If two topics solve the same problem, we prefer to combine them into one stronger guide. That way you get a fuller answer instead of several repetitive pages.'}
                        </p>
                    </div>

                    <div className="section-shell bg-[#fffaf4] p-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isZh ? '读完后下一步去哪里' : 'Where to Go Next After Reading'}
                        </h2>
                        <ul className="mt-4 space-y-4 text-slate-600">
                            <li>
                                <strong className="text-slate-900">{isZh ? '想马上试提示词：' : 'Want to test a prompt right away:'}</strong> <Link href={`${localePrefix}/create`} className="text-orange-700 hover:underline">{isZh ? '进入生成器' : 'Open the generator'}</Link>
                            </li>
                            <li>
                                <strong className="text-slate-900">{isZh ? '想接入 API：' : 'Need API implementation details:'}</strong> <Link href={`${localePrefix}/developer-api`} className="text-orange-700 hover:underline">{isZh ? '查看开发者 API 指南' : 'Read the developer API guide'}</Link>
                            </li>
                            <li>
                                <strong className="text-slate-900">{isZh ? '想做横向对比：' : 'Want a fair comparison flow:'}</strong> <Link href={`${localePrefix}/arena`} className="text-orange-700 hover:underline">{isZh ? '进入 Image Arena' : 'Use the image arena'}</Link>
                            </li>
                            <li>
                                <strong className="text-slate-900">{isZh ? '想了解产品与团队：' : 'Want to learn more about the product:'}</strong> <Link href={`${localePrefix}/about`} className="text-orange-700 hover:underline">{isZh ? '查看 About 页面' : 'Read the about page'}</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="section-shell p-12 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {isZh ? '准备好开始创作了吗？' : 'Ready to Start Creating?'}
                    </h2>
                    <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                        {isZh
                            ? '直接用 GPT Image 2 工作流测试你的提示词，并继续查看 API 指南与模型评测。'
                            : 'Start with the GPT Image 2 workflow, then continue into the API guide and model reviews.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link href={`${localePrefix}/create`}>
                            <Button size="lg" className="px-8 bg-[#ff6b2c] hover:bg-[#f86120]">
                                {isZh ? '进入生成器' : 'Open Generator'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href={`${localePrefix}/developer-api`}>
                            <Button size="lg" variant="outline" className="px-8 border-orange-200 bg-[#fffaf4] text-slate-700 hover:bg-orange-50">
                                {isZh ? '查看 API 指南' : 'View API Guide'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
