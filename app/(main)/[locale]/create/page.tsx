import HomeClientWrapper from "@/components/home/HomeClientWrapper";
import CreateStaticContent from "@/components/home/CreateStaticContent";
import { siteConfig } from "@/config/site";

// ✅ 使用 ISR 模式，用户状态在客户端组件中获取
// 这样页面可以被 CDN 缓存，提升 TTFB 和爬取效率
export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';

    const title = isZh
        ? '用 GPT Image 2 创建图片'
        : 'Create Images with GPT Image 2';
    const description = isZh
        ? '在 GPT Image 2 生成器中直接输入提示词并输出图片。这里集中承接 gpt image 2、chatgpt image 2、gpt-image-2 等同义搜索意图，并提供尺寸、质量与格式说明。'
        : 'Create images with GPT Image 2 from one prompt-driven workspace. This page targets GPT Image 2, ChatGPT Image 2, and GPT-Image-2 search intent with clear controls for size, quality, and format.';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/create`,
            languages: {
                en: `${siteConfig.url}/en/create`,
                zh: `${siteConfig.url}/zh/create`,
                'x-default': `${siteConfig.url}/en/create`,
            },
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${siteConfig.url}/${locale}/create`,
        },
        twitter: {
            title,
            description,
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
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ee_48%,#fff3e7_100%)]">
            <HomeClientWrapper
                user={user}
                staticContent={<CreateStaticContent locale={locale} />}
            />
        </div>
    );
}
