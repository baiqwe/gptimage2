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
    ? "浏览 Awesome GPT Image 2 Prompts 页面，了解什么是高质量提示词、如何改写 prompt、为什么这些案例值得参考，并一键带入 GPT Image 2 生成器。"
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
                ? "Awesome GPT Image 2 Prompts：看成图、学结构、再带去生成器继续做"
                : "Awesome GPT Image 2 Prompts: examples, workflow, and prompt ideas you can actually use"}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {isZh
                ? "这个页面围绕 awesome gpt image 2 prompts 的真实搜索意图来设计。很多用户并不是缺少模型，而是缺少一个足够好的起点：什么样的 prompt 才容易得到稳定结果、不同视觉方向要怎么写、为什么某些案例更适合作为商业参考。这里会先给你看结果，再给你 prompt，最后把你带到生成器里继续完成。"
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
                  ? "在这个 awesome gpt image 2 prompts 页面里，每条内容都从成图开始，再回到 prompt 本身，让你先看到结果，再拆解它为什么成立。"
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
                  ? "我们不会只给你一串词，而是告诉你主体、镜头、光线、材质、版式和用途分别在 prompt 里扮演什么角色。"
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
                  ? "点击按钮后，当前 prompt 与比例会直接带到 GPT Image 2 工作台。这个 awesome gpt image 2 prompts 页不是终点，而是进入生成器前的高质量起点。"
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
                  ? "很多提示词页的问题在于：它们只是在追关键词，却没有真正解释“好 prompt”背后的结构。真正有用的 awesome gpt image 2 prompts，不应该只是几十条碎片化句子，也不应该只靠形容词堆出看起来很厉害的效果。它更像一个经过结果验证的素材库：每条 prompt 都应该告诉你这类图为什么能成立，适合什么比例，适合什么用途，以及如果你要把它改成自己的品牌、产品或内容，该先改哪里。"
                  : "The problem with many prompt galleries is that they target the keyword but never explain the structure behind a good prompt. Truly useful awesome gpt image 2 prompts are not just a stack of pretty adjectives or disconnected one-liners. They work more like a validated library: each prompt should show why the image direction works, which aspect ratio suits it, what kind of job it is best for, and where to edit if you want to turn the idea into your own campaign, product shot, creator visual, or concept board."}
              </p>
              <p className="leading-8">
                {isZh
                  ? "这也是为什么我们把这个页面做成“成图 + prompt + 比例 + 分类入口 + 生成器预填”的组合，而不是只做一个漂亮的瀑布流。用户搜 awesome gpt image 2 prompts，通常是在找一个立刻能用的方向。他们可能想要人像、社媒视觉、设计系统、像素风场景、3D 形态，或者电商详情图。页面如果只给图不给方法，用户会停留几秒就走；如果只给方法不给成图，他们又很难快速判断是不是自己想要的风格。把结果、结构和下一步操作放在同一页，才更接近真实需求。"
                  : "That is why this page is designed as more than a pretty masonry grid. People who search for awesome gpt image 2 prompts usually want an immediately usable direction. They may be looking for portraits, social visuals, design-system boards, pixel scenes, abstract 3D forms, or e-commerce layouts. If a page shows images without explaining the prompt logic, the visit ends quickly. If it explains the logic without showing the output, people cannot judge whether the style is right for them. Bringing results, structure, and the next action into one page makes the experience much closer to the real search need."}
              </p>
              <p className="leading-8">
                {isZh
                  ? "从 E-E-A-T 的角度看，提示词页也不能只是“看上去很懂”。真正可信的提示词页需要展示可验证的结果、明确的用途和真实的工作流。这里的示例都来自站内实际展示过的案例，而且每条都带有推荐比例和用途说明，方便你在进入生成器前就先做筛选。这样的结构不仅更符合用户预期，也更能帮助搜索引擎理解这个页面为什么不是薄内容。"
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
                    ? "如果 awesome gpt image 2 prompts 是总入口，下面这些分类页就是更细的工作台入口。每个分类页都会围绕具体场景解释什么样的 prompt 更有效、怎么改、为什么适合这类视觉任务。"
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
                    ? "最好的改法不是删掉全部重写，而是先识别 prompt 的骨架。通常一条更稳定的 prompt 至少有四层：主体、风格/材质、镜头/光线、用途/构图。比如一条赛博朋克人像 prompt，如果你喜欢的是镜头感和雨夜霓虹，不一定要保留银发女性这个主体；你完全可以把它换成品牌代言人、游戏角色、运动员或者自己的 IP 形象。"
                    : "The best way to adapt awesome gpt image 2 prompts is not to delete everything and start from zero. First identify the prompt skeleton. In most strong examples, that means at least four layers: subject, style or material, lens and lighting language, and output or composition intent. If you like a cyberpunk portrait because of the rain reflections and lens treatment, you do not have to keep the silver-haired model. You can swap in a spokesperson, game character, athlete, or brand mascot while preserving the image logic that made the example work."}
                </p>
                <p>
                  {isZh
                    ? "第二步是增加项目语言。提示词要从“好看”走向“可用”，就必须加入品牌关键词、渠道要求和排版边界。做海报时，要告诉模型是否预留标题空间；做社媒图时，要说明竖屏和移动端视觉中心；做详情页时，要补价格模块、卖点区和多图组合逻辑。真正高效的 awesome gpt image 2 prompts，通常都能同时服务风格和用途。"
                    : "The second step is to add project language. A prompt stops being merely attractive and starts becoming useful when you add brand cues, channel constraints, and layout boundaries. For posters, mention headline-safe space. For social visuals, describe the vertical frame and mobile focal point. For product pages, mention price blocks, feature modules, and multi-panel composition. The most effective awesome gpt image 2 prompts usually serve both style and function at the same time."}
                </p>
                <p>
                  {isZh
                    ? "第三步是控制变量。一次只改一个关键层面，比如只改主体、不改镜头；或者只改色调、不改构图。这样你才能看清楚到底是哪一层影响了最终结果。对团队来说，这种改法也更容易复盘，因为大家讨论的是明确变量，而不是一句“这个感觉不对”。"
                    : "The third step is variable control. Change one major layer at a time: the subject but not the lens, or the color environment but not the composition. That makes it far easier to see which layer changed the result. It also creates a better review workflow for teams, because people can discuss concrete variables instead of saying that a version just feels wrong."}
                </p>
              </div>
            </div>

            <div className="section-shell bg-[#fffaf4] p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {isZh ? "Why：为什么 prompts 页面能真正提升使用转化" : "Why an awesome GPT Image 2 prompts hub improves real product conversion"}
              </h2>
              <div className="mt-5 space-y-4 leading-8 text-slate-600">
                <p>
                  {isZh
                    ? "从产品角度看，灵感不足常常比模型能力更早把用户拦住。很多用户打开生成器时并不是真的没有需求，而是不知道第一句该怎么写。awesome gpt image 2 prompts 页面可以把“不会写 prompt”的阻力变成“挑一个最接近的例子，然后开始改”。这一步会显著缩短用户从访问页面到真正点击生成之间的距离。"
                    : "From a product perspective, lack of prompt confidence blocks people earlier than model quality. Many visitors do not arrive without intent; they arrive without a starting sentence. An awesome gpt image 2 prompts hub turns that friction into a much simpler job: pick the closest example, copy it, and begin iterating. That shortens the distance between landing on the site and actually generating something."}
                </p>
                <p>
                  {isZh
                    ? "从 SEO 角度看，这种页面也比单一生成器页更适合承接长尾搜索。用户搜索 awesome gpt image 2 prompts，本质上不是在找“工具首页”，而是在找“可以直接拿来用的灵感案例”。如果这个页面既能展示真实成图，又能讲清楚 prompt 结构，再把用户导向生成器，就会形成比单页工具更完整的搜索闭环。"
                    : "From an SEO angle, this type of page is also a better fit for long-tail prompt intent than a generator landing page alone. People searching for awesome gpt image 2 prompts are not only looking for the tool home page; they are looking for usable ideas. A page that shows finished examples, explains the prompt structure, and then routes users into the generator creates a much stronger search-to-product loop than a single tool page on its own."}
                </p>
                <p>
                  {isZh
                    ? "对站内架构来说，分类 prompts 子页还能帮助你覆盖更细的需求层：portrait、product、ui、social、pixel art、3d render。只要每个子页都围绕清晰任务来写，而不是机械复读同一段内容，就能在不制造 doorway pages 的前提下，扩展更多稳定流量入口。"
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
