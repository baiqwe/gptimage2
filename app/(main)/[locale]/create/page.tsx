import HomeClientWrapper from "@/components/home/HomeClientWrapper";
import CreateStaticContent from "@/components/home/CreateStaticContent";
import { SoftwareApplicationSchema } from "@/components/json-ld-schema";
import { siteConfig } from "@/config/site";

// ✅ 使用 ISR 模式，用户状态在客户端组件中获取
// 这样页面可以被 CDN 缓存，提升 TTFB 和爬取效率
export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';

    const title = isZh
        ? 'AI 绘图工作台 | 立即使用 GPT Image 2 生成图片'
        : 'AI Image Workspace | Generate Art via GPT Image 2';
    const description = isZh
        ? '立即体验全新的 GPT Image 2 绘图引擎。输入提示词，极速生成高清海报、产品图与概念设计。免广告，支持多种尺寸与高质量导出，即刻开始创作！'
        : 'Generate high-quality AI art, product visuals, and concepts instantly with the new GPT Image 2 engine. Fast, free-to-try, and no ads. Start creating now!';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/create`,
            languages: {
                en: `${siteConfig.url}/en/create`,
                zh: `${siteConfig.url}/zh/create`,
            },
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/create`,
            images: [
                {
                    url: siteConfig.socialImage,
                    width: 512,
                    height: 512,
                    alt: siteConfig.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.socialImage],
        },
    };
}

export default async function CreatePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    // 用户状态在客户端 HomeHeroGenerator 中实时获取
    // 服务端传递 null，让客户端自己获取最新状态
    const user = null;

    return (
        <>
            <SoftwareApplicationSchema locale={locale} pagePath="/create" />
            <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ee_48%,#fff3e7_100%)]">
                <h1 className="sr-only">
                    {locale === 'zh'
                        ? 'AI 绘图工作台，立即使用 GPT Image 2 生成图片'
                        : 'AI Image Workspace for generating art with GPT Image 2'}
                </h1>
                <HomeClientWrapper
                    user={user}
                    staticContent={<CreateStaticContent locale={locale} />}
                />
            </div>
        </>
    );
}
