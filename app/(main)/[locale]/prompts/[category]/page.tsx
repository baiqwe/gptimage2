import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/breadcrumb-schema";
import PromptGallery from "@/components/prompts/prompt-gallery";
import { Badge } from "@/components/ui/badge";
import {
  PROMPT_CATEGORY_SLUGS,
  PROMPT_GALLERY,
  PROMPT_CATEGORY_META,
  getPromptCategoryBySlug,
} from "@/config/prompts-data";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const locales = ["en", "zh"];
  return locales.flatMap((locale) =>
    PROMPT_CATEGORY_SLUGS.map((category) => ({
      locale,
      category,
    }))
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const params = await props.params;
  const { locale, category } = params;
  const isZh = locale === "zh";
  const promptCategory = getPromptCategoryBySlug(category);

  if (!promptCategory) {
    return {};
  }

  const meta = PROMPT_CATEGORY_META[promptCategory];

  const title = isZh
    ? `${meta.labelZh} GPT Image 2 Prompts | Awesome GPT Image 2 Prompts`
    : `${meta.label} GPT Image 2 Prompts | Awesome GPT Image 2 Prompts`;
  const description = isZh
    ? `浏览 ${meta.labelZh} 方向的 Awesome GPT Image 2 Prompts，查看示例图、推荐比例、改写方法和进入生成器的路径。`
    : `Browse awesome GPT Image 2 prompts for ${meta.label.toLowerCase()} work, with examples, suggested aspect ratios, rewrite advice, and direct links into the generator.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${locale}/prompts/${category}`,
      languages: {
        en: `${siteConfig.url}/en/prompts/${category}`,
        zh: `${siteConfig.url}/zh/prompts/${category}`,
        "x-default": `${siteConfig.url}/en/prompts/${category}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/${locale}/prompts/${category}`,
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
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.socialImage],
    },
  };
}

export default async function PromptCategoryPage(props: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const params = await props.params;
  const { locale, category } = params;
  const isZh = locale === "zh";
  const localePrefix = `/${locale}`;

  const promptCategory = getPromptCategoryBySlug(category);
  if (!promptCategory) {
    notFound();
  }

  const meta = PROMPT_CATEGORY_META[promptCategory];
  const items = PROMPT_GALLERY.filter((item) => item.category === promptCategory);

  const breadcrumbs = [
    { name: isZh ? "首页" : "Home", url: `${siteConfig.url}/${locale}` },
    { name: isZh ? "提示词库" : "Prompts", url: `${siteConfig.url}/${locale}/prompts` },
    {
      name: isZh ? `${meta.labelZh} prompts` : `${meta.label} prompts`,
      url: `${siteConfig.url}/${locale}/prompts/${category}`,
    },
  ];

  const faqItems = [
    {
      question: isZh
        ? `${meta.labelZh} prompts 最先该改哪里？`
        : `What should I change first in ${meta.label.toLowerCase()} prompts?`,
      answer: isZh
        ? "建议先改主体和用途，再决定是否改镜头、光线和比例。这样更容易保留原始 prompt 的成功结构。"
        : "Start with the subject and intended use case, then decide whether you need to change lens language, lighting, or aspect ratio. That usually preserves the strongest part of the original prompt structure.",
    },
    {
      question: isZh
        ? `${meta.labelZh} 类 prompt 更适合什么比例？`
        : `Which aspect ratios work best for ${meta.label.toLowerCase()} prompts?`,
      answer: isZh
        ? "页面里的每条示例都提供了推荐比例。一般来说，人像和产品更常见于 3:4，社媒内容更适合 9:16，界面与 3D 方向则更常见于 4:3 或 16:9。"
        : "Each example includes a suggested aspect ratio. In practice, portraits and product boards often work well in 3:4, social content in 9:16, and UI or 3D concepts in 4:3 or 16:9.",
    },
  ];

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${meta.label} GPT Image 2 Prompts`,
    description: isZh
      ? `${meta.labelZh} 方向的 GPT Image 2 提示词与示例列表。`
      : `A curated list of ${meta.label.toLowerCase()} prompt ideas and examples for GPT Image 2.`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: isZh ? item.titleZh : item.title,
      image: `${siteConfig.url}${item.image}`,
      url: `${siteConfig.url}/${locale}/prompts/${category}#${item.id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff7ef_48%,#fffdf9_100%)]">
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={faqItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      <div className="border-b border-orange-100 bg-white/80 backdrop-blur">
        <div className="container px-4 py-4 md:px-6">
          <nav className="flex items-center overflow-x-auto whitespace-nowrap text-sm text-slate-500">
            <Link href={localePrefix} className="transition-colors hover:text-orange-600">
              {isZh ? "首页" : "Home"}
            </Link>
            <span className="mx-2 text-orange-200">/</span>
            <Link href={`${localePrefix}/prompts`} className="transition-colors hover:text-orange-600">
              {isZh ? "提示词库" : "Prompts"}
            </Link>
            <span className="mx-2 text-orange-200">/</span>
            <span className="font-medium text-slate-900">
              {isZh ? `${meta.labelZh} prompts` : `${meta.label} prompts`}
            </span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-14 md:px-6 md:py-18">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-12">
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-[0_10px_26px_rgba(255,138,61,0.08)]">
              <Sparkles className="h-4 w-4" />
              {isZh ? `${meta.labelZh} prompts` : `${meta.label} prompts`}
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {isZh
                ? `${meta.labelZh}方向的 Awesome GPT Image 2 Prompts`
                : `Awesome GPT Image 2 Prompts for ${meta.label}`}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {isZh
                ? `这是 Awesome GPT Image 2 Prompts 的 ${meta.labelZh}分类页。你会看到更聚焦的示例图、对应 prompt、推荐比例，以及这类视觉任务适合怎样的写法。`
                : `This is the ${meta.label.toLowerCase()} category inside our awesome GPT Image 2 prompts hub. It focuses on examples, prompt structure, recommended aspect ratios, and the kind of writing that works best for this visual task.`}
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="section-shell p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {isZh ? meta.introTitleZh : meta.introTitle}
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                {isZh ? meta.introBodyZh : meta.introBody}
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                {isZh
                  ? `在这个分类里，真正有用的 prompt 通常都同时处理三个问题：画面主体是什么、观众第一眼会先看到什么、这张图最后是准备拿去做什么。只要这三个问题说清楚，${meta.labelZh}方向的 GPT Image 2 结果通常都会更稳定，也更容易继续微调。`
                  : `Inside this category, the most useful prompts usually answer three questions at once: what the main visual subject is, what the viewer should notice first, and what the image is ultimately meant to support. When those three layers are clear, ${meta.label.toLowerCase()} results in GPT Image 2 tend to become much more stable and much easier to refine.`}
              </p>
            </div>
            <div className="section-shell bg-[#fffaf4] p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {isZh ? meta.workflowTitleZh : meta.workflowTitle}
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                {isZh ? meta.workflowBodyZh : meta.workflowBody}
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                {isZh
                  ? `如果你是团队协作场景，最推荐的方式是先在这个分类里挑一个最接近目标的案例，把它复制到生成器，再一次只改一层变量。这样你会更容易判断是主体、光线、比例还是语气影响了结果。`
                  : `If you are working in a team, the cleanest workflow is to choose the example closest to your target, send it into the generator, and then change one variable at a time. That gives you a clearer way to discuss whether subject choice, light treatment, aspect ratio, or tone is moving the result in the right direction.`}
              </p>
            </div>
          </section>

          <section className="section-shell p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                  {isZh ? "Examples" : "Examples"}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {isZh ? `${meta.labelZh}方向的实用示例` : `${meta.label} prompts you can test right away`}
                </h2>
              </div>
              <Badge className="bg-[#fff2e8] text-orange-700 hover:bg-[#fff2e8]">
                {items.length} {isZh ? "条示例" : "examples"}
              </Badge>
            </div>
            <div className="mt-8">
              <PromptGallery
                locale={locale as "en" | "zh"}
                items={items}
                hideFilters
                initialCategory={promptCategory}
              />
            </div>
          </section>

          <section className="section-shell bg-[#fffaf4] p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {isZh ? meta.useCasesTitleZh : meta.useCasesTitle}
            </h2>
            <div className="mt-5 space-y-4 leading-8 text-slate-600">
              <p>{isZh ? meta.useCasesBodyZh : meta.useCasesBody}</p>
              <p>
                {isZh
                  ? `如果你现在还不确定要不要继续这个方向，可以先问自己两个问题：这类图是不是更接近你的投放场景？它有没有给后续排版和品牌信息留下空间？只要两个答案都偏正面，这类 ${meta.labelZh} prompts 就值得优先测试。`
                  : `If you are still unsure whether to pursue this direction, ask two simple questions: is this style closer to the channel or campaign you are building for, and does it leave enough space for later layout and brand information? If the answer is yes, this category is usually worth testing first.`}
              </p>
            </div>
          </section>

          <section className="section-shell p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {isZh ? `把 ${meta.labelZh} prompt 带进生成器继续改` : `Take these ${meta.label.toLowerCase()} prompts into the generator`}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-600">
              {isZh
                ? "复制一条最接近目标的 prompt，再根据你的品牌、主体和渠道做细化，通常比从空白输入框开始更高效。"
                : "Start from the example closest to your goal, then refine it around your own brand, subject, and channel. That is usually more efficient than writing from a blank box."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`${localePrefix}/create`}
                className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]"
              >
                {isZh ? "打开生成器" : "Open the generator"}
              </Link>
              <Link
                href={`${localePrefix}/prompts`}
                className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-200 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50"
              >
                {isZh ? "返回 prompts 总页" : "Back to prompts hub"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
