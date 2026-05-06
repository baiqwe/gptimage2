import Link from "next/link";
import { ArrowRight, Copy, Sparkles, Wand2 } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/breadcrumb-schema";
import PromptGallery from "@/components/prompts/prompt-gallery";
import { Badge } from "@/components/ui/badge";
import {
  PROMPT_CATEGORIES,
  PROMPT_CATEGORY_META,
  PROMPT_GALLERY,
} from "@/config/prompts-data";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";

  const title = isZh
    ? "Awesome GPT Image 2 Prompts | GPT Image 2 提示词大全与灵感库"
    : "Awesome GPT Image 2 Prompts | Gallery, Examples, and Prompt Guide";
  const description = isZh
    ? "浏览 Awesome GPT Image 2 Prompts 页面，挑选真正可用的提示词灵感，学习怎么改写 prompt，并一键带入 GPT Image 2 生成器继续出图。"
    : "Explore awesome GPT Image 2 prompts with examples, prompt-writing guidance, category hubs, and one-click paths into the GPT Image 2 generator.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${locale}/prompts`,
      languages: {
        en: `${siteConfig.url}/en/prompts`,
        zh: `${siteConfig.url}/zh/prompts`,
        "x-default": `${siteConfig.url}/en/prompts`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/${locale}/prompts`,
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

export default async function PromptsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";
  const localePrefix = `/${locale}`;

  const breadcrumbs = [
    { name: isZh ? "首页" : "Home", url: `${siteConfig.url}/${locale}` },
    { name: isZh ? "提示词库" : "Prompts", url: `${siteConfig.url}/${locale}/prompts` },
  ];

  const faqItems = [
    {
      question: isZh ? "什么是 Awesome GPT Image 2 Prompts？" : "What are awesome GPT Image 2 prompts?",
      answer: isZh
        ? "Awesome GPT Image 2 Prompts 不是随便堆词，而是一组经过视觉结果验证的提示词案例。它们会把主体、光线、镜头、材质、场景和用途组织得更清晰，所以更适合作为真正的创作起点。"
        : "Awesome GPT Image 2 prompts are not random strings. They are prompt examples validated by a finished visual result, with clear subject, lighting, lens, material, scene, and output intent.",
    },
    {
      question: isZh ? "为什么需要一个单独的 prompts 页面？" : "Why build a dedicated awesome GPT Image 2 prompts page?",
      answer: isZh
        ? "因为很多用户在打开生成器之前，并不知道要写什么。单独的 prompts 页面能先解决灵感和结构问题，再把用户带到生成器里继续完成真正的出图。"
        : "Because many users do not know what to type before they open the generator. A dedicated awesome GPT Image 2 prompts page solves inspiration and structure first, then moves people into the generator with momentum.",
    },
    {
      question: isZh ? "这些提示词适合直接商用吗？" : "Can I use these awesome GPT Image 2 prompts for commercial work?",
      answer: isZh
        ? "可以作为起点，但更推荐在此基础上继续补品牌、版式、文案和目标渠道要求。这样你得到的结果会更接近真正可投放的海报、详情页或社媒素材。"
        : "Yes, as a starting point. For production work, add your own brand cues, layout constraints, copy needs, and channel requirements so the result fits the actual campaign or product page.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Awesome GPT Image 2 Prompts",
    description: isZh
      ? "一组围绕 GPT Image 2 整理的高质量提示词、示例图和分类入口。"
      : "A curated list of awesome GPT Image 2 prompts, finished examples, and category hubs.",
    itemListElement: PROMPT_GALLERY.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: isZh ? item.titleZh : item.title,
      image: `${siteConfig.url}${item.image}`,
      url: `${siteConfig.url}/${locale}/prompts#${item.id}`,
    })),
  };

  const categoryCards = PROMPT_CATEGORIES.map((category) => ({
    category,
    meta: PROMPT_CATEGORY_META[category],
    count: PROMPT_GALLERY.filter((item) => item.category === category).length,
  }));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff7ee_44%,#fffdf9_100%)]">
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={faqItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="border-b border-orange-100 bg-white/80 backdrop-blur">
        <div className="container px-4 py-4 md:px-6">
          <nav className="flex items-center overflow-x-auto whitespace-nowrap text-sm text-slate-500">
            <Link href={localePrefix} className="transition-colors hover:text-orange-600">
              {isZh ? "首页" : "Home"}
            </Link>
            <span className="mx-2 text-orange-200">/</span>
            <span className="font-medium text-slate-900">
              {isZh ? "提示词库" : "Prompts"}
            </span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-14 md:px-6 md:py-18">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-12">
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-[0_10px_26px_rgba(255,138,61,0.08)]">
              <Sparkles className="h-4 w-4" />
              {isZh ? "Awesome GPT Image 2 Prompts" : "Awesome GPT Image 2 Prompts"}
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {isZh
                ? "Awesome GPT Image 2 Prompts：先挑顺眼的案例，再改成你自己的版本"
                : "Awesome GPT Image 2 Prompts: examples, workflow, and prompt ideas you can actually use"}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {isZh
                ? "如果你打开生成器时经常不知道第一句该怎么写，这个页面就是给你准备的。这里的 awesome gpt image 2 prompts 不只是给你一串词，而是先让你看成图效果，再判断风格适不适合自己，最后再把 prompt 带进生成器继续改。这样上手会比从空白输入框开始轻松很多。"
                : "This page is built around the real search intent behind awesome gpt image 2 prompts. Most people do not need another vague list of keywords. They need examples that explain what a strong prompt looks like, how different visual directions should be written, and why some prompt structures produce more useful results for commercial or creative work. Here, you start with the output, learn the prompt logic, and then move into the generator with something worth testing."}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-[#fff2e8] text-orange-700 hover:bg-[#fff2e8]">
                {isZh ? `${PROMPT_GALLERY.length} 条精选 prompt` : `${PROMPT_GALLERY.length} curated prompts`}
              </Badge>
              <Badge className="bg-[#fff2e8] text-orange-700 hover:bg-[#fff2e8]">
                {isZh ? "支持复制与预填生成器" : "Copy + prefill workflow"}
              </Badge>
              <Badge className="bg-[#fff2e8] text-orange-700 hover:bg-[#fff2e8]">
                {isZh ? "分类入口已开放" : "Category hubs included"}
              </Badge>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="soft-panel bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5ec]">
                <Sparkles className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {isZh ? "What：先理解好的 prompt 长什么样" : "What: understand what a strong prompt looks like"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {isZh
                  ? "这里每条 awesome gpt image 2 prompts 都配了具体画面方向。你可以先看它更像海报、人像、社媒图还是概念图，再决定要不要继续参考这条 prompt。"
                  : "On this awesome gpt image 2 prompts page, every example starts from the finished result and then works backward into the prompt, so you can judge quality before you study wording."}
              </p>
            </div>
            <div className="soft-panel bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5ec]">
                <Copy className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {isZh ? "How：复制之后知道该改哪里" : "How: know what to change after you copy"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {isZh
                  ? "你不需要整段照抄。通常先改主体、场景、颜色和用途就够了，比如把人物换成你的产品、把背景换成你的行业场景，结果就会更贴近需求。"
                  : "You do not just get a sentence to copy. You also get a clearer sense of what the subject, lens, lighting, material, composition, and output context are doing inside the prompt."}
              </p>
            </div>
            <div className="soft-panel bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5ec]">
                <Wand2 className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {isZh ? "Why：把灵感页直接变成生成入口" : "Why: turn inspiration into a live generation workflow"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {isZh
                  ? "看到喜欢的案例后，你可以直接把 prompt 和推荐比例带进生成器继续生成，不用来回复制整理。这会比先找灵感、再自己重写一遍快很多。"
                  : "When you click through, the prompt and ratio move directly into the GPT Image 2 workspace. The awesome gpt image 2 prompts page is not the end of the journey; it is the best starting point before generating."}
              </p>
            </div>
          </section>

          <section className="section-shell p-8 md:p-10">
            <div className="max-w-4xl space-y-5 text-slate-700">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {isZh ? "什么是 awesome gpt image 2 prompts，为什么它值得单独做成一页" : "What awesome GPT Image 2 prompts are, and why they deserve a dedicated page"}
              </h2>
              <p className="leading-8">
                {isZh
                  ? "很多人搜 awesome gpt image 2 prompts，其实不是想研究理论，而是想尽快找到一条能用的起点。真正好用的 prompt，应该让你一眼看懂这类图适不适合自己，也能让你知道下一步该改哪里，而不是只看到一串形容词。"
                  : "The problem with many prompt galleries is that they target the keyword but never explain the structure behind a good prompt. Truly useful awesome gpt image 2 prompts are not just a stack of pretty adjectives or disconnected one-liners. They work more like a validated library: each prompt should show why the image direction works, which aspect ratio suits it, what kind of job it is best for, and where to edit if you want to turn the idea into your own campaign, product shot, creator visual, or concept board."}
              </p>
              <p className="leading-8">
                {isZh
                  ? "所以这个页面会把成图示例、prompt 内容、推荐比例和分类入口放在一起。你可以先按风格挑，再按用途挑，看到合适的就直接复制或带进生成器。无论你要做人像、产品图、社媒封面、像素风场景还是 UI 概念图，都能更快找到离目标最近的那条 prompt。"
                  : "That is why this page is designed as more than a pretty masonry grid. People who search for awesome gpt image 2 prompts usually want an immediately usable direction. They may be looking for portraits, social visuals, design-system boards, pixel scenes, abstract 3D forms, or e-commerce layouts. If a page shows images without explaining the prompt logic, the visit ends quickly. If it explains the logic without showing the output, people cannot judge whether the style is right for them. Bringing results, structure, and the next action into one page makes the experience much closer to the real search need."}
              </p>
              <p className="leading-8">
                {isZh
                  ? "这里的每条 awesome gpt image 2 prompts 都更适合当成“可改写的模板”，而不是标准答案。你可以保留喜欢的画面感觉，再把主体、配色、品牌信息、版式要求换成你自己的内容，这样会比完全从零开始稳定得多。"
                  : "From an E-E-A-T perspective, a prompts page should not pretend to be authoritative just because it uses expert-sounding words. A trustworthy prompt page needs visible outputs, clear use cases, and a real workflow connection. That is why the examples here are tied to actual visual references already used on the site, and each one comes with a recommended aspect ratio and practical framing. This makes the page easier to trust for users and easier to interpret for search engines as something more substantial than a thin keyword collection."}
              </p>
            </div>
          </section>

          <section className="section-shell bg-[#fffaf4] p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                  {isZh ? "Category hub" : "Category hub"}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {isZh ? "按任务拆开的 prompts 框架页" : "Category framework pages built from real prompt use cases"}
                </h2>
                <p className="mt-3 leading-8 text-slate-600">
                  {isZh
                    ? "如果你已经知道自己要做人像、产品图、社媒视觉、像素风或 3D 场景，可以直接进下面对应的分类页。这样不用从总列表里慢慢翻，找方向会更快。"
                    : "If awesome gpt image 2 prompts is the main doorway, the category pages below are more focused entry points. Each one explains what works for that visual task, how to iterate the prompt, and why that category matters in a real creative workflow."}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {categoryCards.map(({ category, meta, count }) => (
                <Link
                  key={category}
                  href={`${localePrefix}/prompts/${meta.slug}`}
                  className="soft-panel bg-white p-6 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#fff2e8] text-orange-700 hover:bg-[#fff2e8]">
                      {isZh ? meta.labelZh : meta.label}
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {count} {isZh ? "条" : "items"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {isZh ? `${meta.labelZh} prompts` : `${meta.label} prompts`}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {isZh ? meta.shortDescriptionZh : meta.shortDescription}
                  </p>
                  <span className="mt-5 inline-flex items-center text-sm font-semibold text-orange-700">
                    {isZh ? "进入分类页" : "Open category"} <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="section-shell p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                  {isZh ? "Prompt gallery" : "Prompt gallery"}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {isZh ? "先看结果，再决定哪条 prompt 值得复制" : "See the result first, then decide which prompt is worth copying"}
                </h2>
              </div>
              <Link
                href={`${localePrefix}/create`}
                className="inline-flex items-center text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                {isZh ? "直接打开生成器" : "Open the generator"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8">
              <PromptGallery locale={locale as "en" | "zh"} />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="section-shell p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {isZh ? "How：怎么把 awesome gpt image 2 prompts 改成自己的版本" : "How to turn awesome GPT Image 2 prompts into prompts that feel like your own"}
              </h2>
              <div className="mt-5 space-y-4 leading-8 text-slate-600">
                <p>
                  {isZh
                    ? "最省力的改法不是整段推翻重写，而是先保留你喜欢的画面感觉，再替换最关键的几个元素。通常先改主体、场景、色调和用途，就足够让一条 awesome gpt image 2 prompts 更像你自己的版本。比如你喜欢的是雨夜霓虹和电影镜头感，那就保留这层氛围，再把人物换成品牌主角、产品代言人、游戏角色或自己的原创形象。"
                    : "The best way to adapt awesome gpt image 2 prompts is not to delete everything and start from zero. First identify the prompt skeleton. In most strong examples, that means at least four layers: subject, style or material, lens and lighting language, and output or composition intent. If you like a cyberpunk portrait because of the rain reflections and lens treatment, you do not have to keep the silver-haired model. You can swap in a spokesperson, game character, athlete, or brand mascot while preserving the image logic that made the example work."}
                </p>
                <p>
                  {isZh
                    ? "第二步是补上你的使用场景。做海报时，可以加上标题预留区域；做社媒封面时，可以强调竖屏和视觉中心；做产品图时，可以说明卖点、材质和展示方式。这样 prompt 不只是好看，也会更贴近你真正要交付的内容。"
                    : "The second step is to add project language. A prompt stops being merely attractive and starts becoming useful when you add brand cues, channel constraints, and layout boundaries. For posters, mention headline-safe space. For social visuals, describe the vertical frame and mobile focal point. For product pages, mention price blocks, feature modules, and multi-panel composition. The most effective awesome gpt image 2 prompts usually serve both style and function at the same time."}
                </p>
                <p>
                  {isZh
                    ? "第三步是一次只改一个重点。比如这一轮只换主体，不动构图；下一轮只改颜色，不动镜头。这样你会更容易看懂到底是哪一步让结果变好了，也更容易快速挑出最接近目标的版本。"
                    : "The third step is variable control. Change one major layer at a time: the subject but not the lens, or the color environment but not the composition. That makes it far easier to see which layer changed the result. It also creates a better review workflow for teams, because people can discuss concrete variables instead of saying that a version just feels wrong."}
                </p>
              </div>
            </div>

            <div className="section-shell bg-[#fffaf4] p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {isZh ? "Why：为什么先看 prompts，会比直接乱试更省时间" : "Why an awesome GPT Image 2 prompts hub improves real product conversion"}
              </h2>
              <div className="mt-5 space-y-4 leading-8 text-slate-600">
                <p>
                  {isZh
                    ? "很多时候，不是你没有想法，而是脑子里有方向，却不知道怎么把第一句写出来。先看 awesome gpt image 2 prompts 的例子，相当于先选一个最接近的草稿，再往自己的方向继续改，会比从零开始盲猜快得多。"
                    : "From a product perspective, lack of prompt confidence blocks people earlier than model quality. Many visitors do not arrive without intent; they arrive without a starting sentence. An awesome gpt image 2 prompts hub turns that friction into a much simpler job: pick the closest example, copy it, and begin iterating. That shortens the distance between landing on the site and actually generating something."}
                </p>
                <p>
                  {isZh
                    ? "而且你会更容易判断风格对不对。只看一句 prompt，很多人其实很难想象最后会生成什么；但先看成图，再决定要不要复制、改写、继续生成，整个过程会更有把握。"
                    : "From an SEO angle, this type of page is also a better fit for long-tail prompt intent than a generator landing page alone. People searching for awesome gpt image 2 prompts are not only looking for the tool home page; they are looking for usable ideas. A page that shows finished examples, explains the prompt structure, and then routes users into the generator creates a much stronger search-to-product loop than a single tool page on its own."}
                </p>
                <p>
                  {isZh
                    ? "如果你已经知道自己要做哪一类图，也可以直接跳去对应分类页。这样你看到的 prompts 会更集中，改起来也更顺手，不需要在完全不相关的案例之间来回切换。"
                    : "At the site-architecture level, category prompt pages help you cover narrower intent around portrait, product, UI, social, pixel art, and 3D render work. As long as each category page solves a distinct task instead of repeating the same copy, you can expand coverage without turning the site into a doorway-page network."}
                </p>
              </div>
            </div>
          </section>

          <section className="section-shell p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {isZh ? "从一个更接近目标的 prompt 开始，会比从空白输入框开始快得多" : "Starting from a stronger prompt is usually faster than starting from a blank box"}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-600">
              {isZh
                ? "如果你现在就想试图生成一张图，最简单的方式就是从这个 awesome gpt image 2 prompts 页面挑一个最接近目标的案例，复制、改写，然后带进生成器。这样你不是在猜，而是在基于一个已经成立的视觉方向继续推进。"
                : "If you want to create an image right now, the fastest move is to choose the example closest to your goal from this awesome gpt image 2 prompts page, copy it, adapt it, and carry it into the generator. That way you are not guessing from zero. You are building on a direction that already proved itself visually."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`${localePrefix}/create`}
                className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]"
              >
                {isZh ? "打开生成器" : "Open the generator"}
              </Link>
              <Link
                href={`${localePrefix}/gallery`}
                className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-200 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50"
              >
                {isZh ? "查看更多示例" : "See more examples"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
