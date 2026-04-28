import HomeClientWrapper from "@/components/home/HomeClientWrapper";
import CreateStaticContent from "@/components/home/CreateStaticContent";
import { SoftwareApplicationSchema } from "@/components/json-ld-schema";
import { siteConfig } from "@/config/site";
import { Sparkles } from "lucide-react";

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
                'x-default': `${siteConfig.url}/en/create`,
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
    const isZh = locale === "zh";

    // 用户状态在客户端 HomeHeroGenerator 中实时获取
    // 服务端传递 null，让客户端自己获取最新状态
    const user = null;
    const heroHeader = (
        <div className="mb-5 text-center lg:mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-orange-700 shadow-[0_10px_26px_rgba(255,138,61,0.08)]">
                <Sparkles className="h-4 w-4" />
                {isZh ? "GPT Image 2 AI 绘图工作台" : "GPT Image 2 AI Image Workspace"}
            </div>
            <h1 className="mx-auto mt-2.5 max-w-[74rem] text-[2.85rem] font-semibold tracking-tight text-slate-900 sm:text-[3rem] sm:leading-[1.06] lg:text-[3.08rem] lg:leading-[1.02]">
                {isZh
                    ? "立即使用 GPT Image 2 生成海报、产品图与概念视觉"
                    : "Generate AI Art, Product Visuals, and Concepts with GPT Image 2"}
            </h1>
            <p className="mx-auto mt-2 max-w-[46rem] text-[15px] leading-7 text-slate-600 sm:text-[15.5px]">
                {isZh
                    ? "在这个 AI 绘图工作台里输入提示词，选择画面比例和分辨率，快速生成高清图像；也可以上传参考图进行图生图编辑。"
                    : "Use this AI image workspace to write a prompt, choose an aspect ratio and resolution, generate high-quality visuals, or upload references for image-to-image editing."}
            </p>
        </div>
    );

    return (
        <>
            <SoftwareApplicationSchema locale={locale} pagePath="/create" />
            <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ee_48%,#fff3e7_100%)]">
                <HomeClientWrapper
                    heroHeader={heroHeader}
                    user={user}
                    staticContent={<CreateStaticContent locale={locale} />}
                />
            </div>
        </>
    );
}
