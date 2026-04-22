import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Calendar, User, Clock, ArrowRight, Sparkles, FileText } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { blogPosts, BlogPost } from '@/config/blog-posts';

// 静态页面 - 使用 generateStaticParams 预生成所有博客文章
export const dynamic = 'force-static';

// 从配置获取博客文章
function getPost(slug: string, locale: string): (BlogPost & {
    author: string;
    readTime: string;
    tags: string[];
    toc: { id: string; title: string }[];
    wordCount: number;
}) | null {
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return null;

    const isZh = locale === 'zh';
    const plainText = post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(' ').filter(Boolean).length;
    const readingMinutes = Math.max(8, Math.ceil(wordCount / 180));

    // 从内容中提取 h2 标题作为目录
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const toc: { id: string; title: string }[] = [];
    let match;
    while ((match = h2Regex.exec(post.content)) !== null) {
        const title = match[1].replace(/<[^>]*>/g, '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        toc.push({ id, title });
    }

    return {
        ...post,
        author: siteConfig.author,
        readTime: isZh ? `${readingMinutes} 分钟阅读` : `${readingMinutes} min read`,
        tags: post.keywords.slice(0, 3).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        toc,
        wordCount,
    };
}

// 获取相关文章
function getRelatedPosts(currentSlug: string, limit: number = 3) {
    return blogPosts
        .filter(p => p.slug !== currentSlug)
        .slice(0, limit)
        .map(p => ({
            slug: p.slug,
            title: p.title,
            date: p.publishDate,
        }));
}

export async function generateStaticParams() {
    return blogPosts.map(post => ({
        slug: post.slug,
    }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const post = getPost(params.slug, params.locale);
    if (!post) return {};

    return {
        title: post.title,
        description: post.description,
        keywords: post.keywords,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.publishDate,
            authors: [post.author],
            url: `${siteConfig.url}/${params.locale}/blog/${params.slug}`,
        },
        twitter: {
            title: post.title,
            description: post.description,
        },
        alternates: {
            canonical: `${siteConfig.url}/${params.locale}/blog/${params.slug}`,
            languages: {
                'en': `${siteConfig.url}/en/blog/${params.slug}`,
                'zh': `${siteConfig.url}/zh/blog/${params.slug}`,
                'x-default': `${siteConfig.url}`,
            },
        },
    };
}

// 处理内容：添加 id 到 h2 标签
function processContent(content: string): string {
    return content.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, title) => {
        const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
        const id = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h2 id="${id}"${attrs}>${title}</h2>`;
    });
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string; locale: string }> }) {
    const params = await props.params;
    const post = getPost(params.slug, params.locale);
    if (!post) return notFound();

    const isZh = params.locale === 'zh';
    const localePrefix = `/${params.locale}`;
    const relatedPosts = getRelatedPosts(params.slug);
    const processedContent = processContent(post.content);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff7ef_46%,#fffdf9_100%)]">
            <div className="container max-w-7xl mx-auto px-4 py-12">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link href={localePrefix} className="hover:text-orange-600 transition-colors">
                        {isZh ? '首页' : 'Home'}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
                    <Link href={`${localePrefix}/blog`} className="hover:text-orange-600 transition-colors">
                        {isZh ? '博客' : 'Blog'}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
                    <span className="text-slate-900 font-medium truncate max-w-[200px] md:max-w-none">{post.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Area (8/12) */}
                    <main className="lg:col-span-8">
                        {/* Article Header */}
                        <header className="mb-10 rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_24px_64px_rgba(235,145,71,0.10)]">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-[#fff3ea] text-orange-700 border border-orange-100">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
                                {post.title}
                            </h1>
                            <p className="max-w-3xl text-lg leading-8 text-slate-600">{post.description}</p>
                            <div className="mt-6 flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-500 border-b border-orange-100 pb-8">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={post.publishDate}>{post.publishDate}</time>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{post.wordCount}+ words</span>
                                </div>
                            </div>

                            {post.heroImage && (
                                <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[28px] border border-orange-100 bg-[#fff7ef]">
                                    <Image src={post.heroImage} alt={post.title} fill className="object-cover" />
                                </div>
                            )}
                        </header>

                        {/* Article Body (Prose Styling) */}
                        <article className="prose prose-lg max-w-none rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_24px_64px_rgba(235,145,71,0.10)]
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-p:text-slate-700 prose-p:leading-8
              prose-a:text-orange-700 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900
              prose-blockquote:border-orange-400 prose-blockquote:bg-[#fff7ef] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700
              prose-li:text-slate-700
              prose-table:border-orange-100 prose-thead:border-orange-100 prose-tr:border-orange-100
              prose-th:text-slate-900 prose-th:bg-[#fffaf4] prose-th:px-4 prose-th:py-2
              prose-td:px-4 prose-td:py-2 prose-td:text-slate-700
              prose-img:rounded-xl prose-img:shadow-lg">
                            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                        </article>

                        {/* Bottom CTA Card */}
                        <div className="mt-16 rounded-[32px] border border-orange-100 bg-white p-8 text-center shadow-[0_24px_64px_rgba(235,145,71,0.10)]">
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                {isZh ? '准备好创作惊艳的 AI 艺术了吗？' : 'Ready to Create Stunning AI Art?'}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {isZh
                                    ? '先用免费试用积分验证你的提示词，再根据需要继续查看价格、API 指南或模型对比。'
                                    : 'Start with free trial credits, then continue into pricing, API guidance, or model comparisons as your workflow grows.'}
                            </p>
                            <Link href={`${localePrefix}/create`}>
                                <Button size="lg" className="rounded-full px-8 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/20">
                                    {isZh ? '进入 GPT Image 2 生成器' : 'Open the GPT Image 2 Generator'} <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </main>

                    {/* Sidebar (4/12) */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Sticky Floating CTA (High Conversion Core) */}
                        <div className="sticky top-24 space-y-8">
                            <Card className="overflow-hidden border-orange-100 bg-white shadow-[0_24px_64px_rgba(235,145,71,0.10)]">
                                <CardContent className="p-6 relative">
                                    <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-200" />
                                    <div className="font-bold text-lg mb-2 text-slate-900">GPT Image 2 Generator</div>
                                    <h3 className="text-2xl font-extrabold mb-4 leading-snug text-slate-900">
                                        {isZh ? '使用免费试用积分开始生成' : 'Start with Free Trial Credits'}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-6">
                                        {isZh
                                            ? '直接测试你的提示词，或继续阅读我们整理的 API、对比评测与趋势内容。'
                                            : 'Test your prompt workflow directly, or continue into our API, comparison, and trend explainers.'}
                                    </p>
                                    <Link href={`${localePrefix}/create`} className="block">
                                        <Button className="w-full font-bold bg-[#ff6b2c] text-white hover:bg-[#f86120]">
                                            {isZh ? '立即开始生成' : 'Start Generating Now'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Table of Contents */}
                            {post.toc.length > 0 && (
                                <div className="hidden lg:block rounded-xl border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-4">
                                        {isZh ? '本文目录' : 'On this page'}
                                    </h4>
                                    <ul className="space-y-3 text-sm border-l-2 border-orange-100 pl-4">
                                        {post.toc.map((item, idx) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    className={`block transition-colors ${idx === 0 ? 'text-orange-600 font-medium' : 'text-slate-600 hover:text-orange-600'}`}
                                                >
                                                    {item.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Related Articles */}
                            <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <h4 className="font-bold mb-4 text-slate-900">{isZh ? '相关文章' : 'Related Articles'}</h4>
                                <ul className="space-y-4">
                                    {relatedPosts.map(related => (
                                        <li key={related.slug}>
                                            <Link href={`${localePrefix}/blog/${related.slug}`} className="group block">
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                    {related.title}
                                                </span>
                                                <span className="text-xs text-slate-500">{related.date}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Structured Data (SEO) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BlogPosting',
                            headline: post.title,
                            datePublished: post.publishDate,
                            author: {
                                '@type': 'Person',
                                name: post.author,
                            },
                            description: post.description,
                            keywords: post.keywords.join(', '),
                            publisher: {
                                '@type': 'Organization',
                                name: siteConfig.name,
                                url: siteConfig.url,
                            },
                        }),
                    }}
                />
            </div>
        </div>
    );
}
