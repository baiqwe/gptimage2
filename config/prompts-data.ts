export type PromptCategory =
  | "Portrait"
  | "Social"
  | "UI"
  | "Product"
  | "Pixel Art"
  | "3D Render";

export type PromptAspectRatio = "auto" | "1:1" | "9:16" | "16:9" | "4:3" | "3:4";

export interface PromptItem {
  id: string;
  image: string;
  title: string;
  titleZh: string;
  prompt: string;
  promptZh: string;
  category: PromptCategory;
  aspectRatio: PromptAspectRatio;
  description: string;
  descriptionZh: string;
}

export interface PromptCategoryMeta {
  slug: string;
  label: string;
  labelZh: string;
  shortDescription: string;
  shortDescriptionZh: string;
  introTitle: string;
  introTitleZh: string;
  introBody: string;
  introBodyZh: string;
  workflowTitle: string;
  workflowTitleZh: string;
  workflowBody: string;
  workflowBodyZh: string;
  useCasesTitle: string;
  useCasesTitleZh: string;
  useCasesBody: string;
  useCasesBodyZh: string;
}

export const PROMPT_GALLERY: PromptItem[] = [
  {
    id: "tiktok-live-stream",
    image: "/examples/tiktok-live-stream.webp",
    title: "TikTok live stream portrait",
    titleZh: "TikTok 直播人像",
    prompt:
      "Generate a screenshot of a TikTok live stream featuring a beautiful woman streaming.",
    promptZh: "生成一张 TikTok 直播截图，画面是一位漂亮女生正在直播。",
    category: "Social",
    aspectRatio: "9:16",
    description:
      "A social-first prompt built for vertical framing, on-screen UI elements, and creator-style composition.",
    descriptionZh: "偏社媒内容方向的竖屏 prompt，适合直播界面、移动端构图和主播主体表现。",
  },
  {
    id: "design-system-board",
    image: "/examples/design-system-board.webp",
    title: "SaaS design system board",
    titleZh: "SaaS 设计系统展示板",
    prompt:
      "Generate a UI design system for me in xx style, including web pages, mobile, cards, controls, buttons, and others.",
    promptZh:
      "请用 xx 风格为我生成一套 UI design system，包括 Web 页面、移动端、卡片、控件、按钮等。",
    category: "UI",
    aspectRatio: "4:3",
    description:
      "Useful for product teams collecting layout references, design tokens, and UI patterns in one frame.",
    descriptionZh: "适合产品团队和设计团队整理网页、移动端、卡片和控件的统一视觉参考。",
  },
  {
    id: "cyberpunk-silver-portrait",
    image: "/examples/cyberpunk-silver-portrait.webp",
    title: "Cyberpunk silver portrait",
    titleZh: "赛博朋克银发人像",
    prompt:
      "A close-up portrait of a woman with short silver hair in a rain-soaked cyberpunk city at night. Neon signs in pink and teal reflect off wet surfaces and her metallic jacket. Futuristic face implants glow softly beneath the skin. Shot with a wide-aperture lens, bokeh of city lights in the background.",
    promptZh:
      "一位短银发女性的近景人像，站在雨夜赛博朋克城市中。粉色和青绿色霓虹招牌倒映在潮湿地面与她的金属感外套上，皮肤下若隐若现的未来感面部植入物柔和发光。使用大光圈镜头拍摄，背景是城市灯光形成的散景。",
    category: "Portrait",
    aspectRatio: "3:4",
    description:
      "A high-intent portrait prompt focused on skin detail, lens language, wet reflections, and cinematic neon atmosphere.",
    descriptionZh: "强调肤质细节、镜头语言、雨夜反光和霓虹氛围的高质感人物 prompt。",
  },
  {
    id: "pixel-ramen-shop",
    image: "/examples/pixel-ramen-shop.webp",
    title: "Retro pixel ramen alley",
    titleZh: "复古像素拉面巷子",
    prompt:
      "A retro pixel art scene of a cozy ramen shop on a rainy night in a quiet Japanese alley. Warm light spills from the shop window, a cat sits under the awning, steam rises from a bowl visible through the glass. 16-bit color palette, detailed pixel work for rain droplets, neon sign glows 'ラーメン'. Nostalgic and atmospheric.",
    promptZh:
      "一个复古像素风场景：安静的日本小巷里，一家温馨的拉面店正处在雨夜中。暖黄灯光从店窗溢出，一只猫蹲在雨棚下，透过玻璃能看到冒着热气的拉面。使用 16-bit 配色，雨滴像素细节丰富，霓虹招牌写着“ラーメン”，整体怀旧而有氛围。",
    category: "Pixel Art",
    aspectRatio: "1:1",
    description:
      "A nostalgia-heavy prompt for game-like pixel scenes with lighting contrast, signage, and weather-driven detail.",
    descriptionZh: "适合做怀旧游戏像素场景，重点在光影对比、招牌文字和天气细节。",
  },
  {
    id: "t800-product-board",
    image: "/examples/t800-taobao-detail.webp",
    title: "T-800 product detail board",
    titleZh: "T-800 商品详情长图",
    prompt:
      "Generate image: Taobao product detail page of a T-800 robot, showing: front, side, and back three-view drawings of the robot, product price, product details, functions and usage scenarios.",
    promptZh:
      "生成图片：一个 T-800 机器人的淘宝商品详情页，展示机器人正面、侧面、背面的三视图，商品价格、产品细节、功能说明和使用场景。",
    category: "Product",
    aspectRatio: "3:4",
    description:
      "A commerce-oriented layout prompt for detail pages, feature modules, pricing blocks, and marketplace-style presentation.",
    descriptionZh: "偏电商详情页方向，适合功能模块、参数区、价格区和场景图的组合展示。",
  },
  {
    id: "abstract-3d-shapes",
    image: "/blog/3d-shapes-demo.webp",
    title: "Abstract 3D concept render",
    titleZh: "抽象 3D 概念渲染",
    prompt:
      "Abstract 3D geometric shapes, soft pastel colors, studio lighting, smooth matte materials, minimalist design, octane render.",
    promptZh:
      "抽象 3D 几何形体，柔和的粉彩配色，棚拍级光线，细腻的哑光材质，极简设计风格，Octane 渲染质感。",
    category: "3D Render",
    aspectRatio: "4:3",
    description:
      "Designed for concept boards, visual identity exploration, and clean 3D material studies.",
    descriptionZh: "适合概念板、品牌视觉探索和偏极简方向的 3D 材质表现。",
  },
];

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Portrait",
  "Social",
  "UI",
  "Product",
  "Pixel Art",
  "3D Render",
];

export const PROMPT_CATEGORY_META: Record<PromptCategory, PromptCategoryMeta> = {
  Portrait: {
    slug: "portrait",
    label: "Portrait",
    labelZh: "人像",
    shortDescription:
      "Portrait prompts focused on skin texture, lens choices, editorial lighting, and cinematic framing.",
    shortDescriptionZh: "聚焦肤质、镜头、棚拍光线和电影感构图的人像提示词。",
    introTitle: "What makes a strong GPT Image 2 portrait prompt?",
    introTitleZh: "什么样的人像提示词更适合 GPT Image 2？",
    introBody:
      "The strongest portrait prompts do not only describe a person. They also define the camera distance, skin detail, lighting direction, wardrobe, and emotional tone. That gives the model enough structure to create a result that feels editorial instead of generic.",
    introBodyZh:
      "更强的人像 prompt 不只是描述人物外貌，还会把拍摄距离、肤质细节、光线方向、服装和情绪一起说清楚，这样结果更容易从“普通头像”变成真正有质感的编辑人像。",
    workflowTitle: "How to improve portrait prompts without rewriting everything",
    workflowTitleZh: "如何在不重写全部 prompt 的情况下优化人像效果",
    workflowBody:
      "Keep the lens language, light source, and mood words, then swap the subject, styling, and environment. This preserves the visual structure while letting you adapt the prompt for a different campaign, creator, or brand mood.",
    workflowBodyZh:
      "可以保留镜头、光线和情绪词，再替换主体、造型和环境。这样既保住了画面的结构，又能快速适配不同品牌和项目。",
    useCasesTitle: "Best use cases for portrait prompts",
    useCasesTitleZh: "人像提示词最适合的使用场景",
    useCasesBody:
      "Use portrait prompts for hero banners, editorial covers, beauty campaigns, creator branding, and premium character references. They are especially useful when you want the image to feel polished before any later layout work.",
    useCasesBodyZh:
      "适合用于封面图、品牌海报、美妆视觉、创作者形象照和高质感角色参考，尤其适合先把人物气质做对，再进入后续排版。",
  },
  Social: {
    slug: "social",
    label: "Social",
    labelZh: "社媒",
    shortDescription:
      "Prompt ideas for vertical content, mobile-native framing, creator visuals, and interface-style compositions.",
    shortDescriptionZh: "适合竖屏内容、手机原生构图、创作者视觉和带界面感版式的提示词。",
    introTitle: "What makes social prompts different from standard image prompts?",
    introTitleZh: "社媒提示词和普通绘图提示词有什么区别？",
    introBody:
      "Social prompts need to care about more than the subject. They often depend on vertical framing, interface spacing, headline-safe areas, and an instant first impression. That makes composition and negative space much more important.",
    introBodyZh:
      "社媒 prompt 不只关注主体本身，还要考虑竖屏比例、界面留白、标题安全区和第一眼吸引力，所以构图和留白会更重要。",
    workflowTitle: "How to adapt social prompts for different channels",
    workflowTitleZh: "如何把社媒 prompt 调整到不同平台",
    workflowBody:
      "Keep the core visual idea, then adapt the channel language: vertical for short video covers, square for feed posts, wider frames for campaign headers. The best workflow is to keep one prompt skeleton and swap the platform cues.",
    workflowBodyZh:
      "先保留核心视觉想法，再根据平台调整比例和版式：短视频封面偏竖屏，信息流偏方图，活动头图偏横版。最好保留一个 prompt 骨架，再替换平台参数。",
    useCasesTitle: "Best use cases for social prompts",
    useCasesTitleZh: "社媒提示词最适合的使用场景",
    useCasesBody:
      "Perfect for cover art, creator posters, product drops, mobile-first campaigns, and visual mockups that need to feel native to social apps instead of looking like generic ads.",
    useCasesBodyZh:
      "适合封面图、达人海报、产品上新、移动端优先活动页，以及需要看起来更像社交平台原生内容的视觉素材。",
  },
  UI: {
    slug: "ui",
    label: "UI",
    labelZh: "界面",
    shortDescription:
      "Prompt examples for design systems, dashboards, mobile flows, cards, and layout reference boards.",
    shortDescriptionZh: "适合设计系统、仪表盘、移动端流程、卡片组件和布局参考板的提示词。",
    introTitle: "Why UI prompts need more structure than aesthetic prompts",
    introTitleZh: "为什么 UI 提示词比纯风格提示词更需要结构",
    introBody:
      "A good UI prompt must describe information hierarchy, component types, layout zones, and screen relationships. Pure style language is not enough if you want a board that looks organized and usable.",
    introBodyZh:
      "好的 UI prompt 需要描述信息层级、组件类型、布局区域和页面关系。如果只讲风格，不讲结构，结果通常会缺少真正可参考的界面秩序。",
    workflowTitle: "How to turn UI prompt examples into team references",
    workflowTitleZh: "如何把 UI 提示词案例变成团队参考板",
    workflowBody:
      "Use one prompt to generate a direction board, then break it into smaller prompts for desktop, mobile, cards, and controls. That keeps the visual language consistent while giving each screen a clearer task.",
    workflowBodyZh:
      "可以先用一个 prompt 出方向板，再拆成桌面端、移动端、卡片和控件等小 prompt。这样既保留统一视觉语言，也让每张图承担更明确的参考任务。",
    useCasesTitle: "Best use cases for UI prompts",
    useCasesTitleZh: "UI 提示词最适合的使用场景",
    useCasesBody:
      "Useful for kickoff decks, design moodboards, feature concepts, component explorations, and early-stage product storytelling where speed matters more than pixel-perfect production.",
    useCasesBodyZh:
      "适合立项提案、设计 moodboard、功能概念图、组件探索和产品早期叙事，在“快速表达方向”阶段尤其有价值。",
  },
  Product: {
    slug: "product",
    label: "Product",
    labelZh: "产品",
    shortDescription:
      "Commercial prompt ideas for product posters, detail pages, feature boards, and marketplace-style layouts.",
    shortDescriptionZh: "适合产品海报、详情页、卖点展示板和电商风版式的商业提示词。",
    introTitle: "What makes product prompts commercially useful?",
    introTitleZh: "什么样的产品提示词更适合商业使用？",
    introBody:
      "Product prompts become useful when they describe the object, the environment, the selling context, and the visual hierarchy at the same time. That is why product detail pages and feature boards usually outperform simple floating-object prompts.",
    introBodyZh:
      "更有商业价值的产品 prompt 不只写物体本身，还会同时写环境、销售场景和画面层级。所以详情页和卖点板通常比单个悬浮产品图更有参考价值。",
    workflowTitle: "How to build a stronger product prompt",
    workflowTitleZh: "如何把产品 prompt 写得更完整",
    workflowBody:
      "Start with the hero object, then add material detail, lighting setup, price or feature modules, and the intended sales context. This helps the result feel closer to a real campaign or marketplace asset.",
    workflowBodyZh:
      "先写主体产品，再补材质细节、灯光设置、价格或卖点模块，以及它所在的销售环境。这样结果会更接近真实投放素材或电商页面。",
    useCasesTitle: "Best use cases for product prompts",
    useCasesTitleZh: "产品提示词最适合的使用场景",
    useCasesBody:
      "Ideal for launch pages, e-commerce boards, feature explainers, product posters, and ad variations when you need to test multiple visual directions quickly.",
    useCasesBodyZh:
      "适合新品发布页、电商详情板、卖点说明图、商品海报和广告变体测试，特别适合快速比较不同视觉方向。",
  },
  "Pixel Art": {
    slug: "pixel-art",
    label: "Pixel Art",
    labelZh: "像素艺术",
    shortDescription:
      "Pixel-art prompt references for game scenes, cozy environments, signage, weather effects, and nostalgic color palettes.",
    shortDescriptionZh: "适合游戏场景、温馨小店、招牌文字、天气效果和怀旧配色的像素提示词。",
    introTitle: "Why pixel art prompts need scene logic",
    introTitleZh: "为什么像素风提示词更需要场景逻辑",
    introBody:
      "Pixel art is easiest to recognize when every object has a reason to exist. Weather, shop signs, light spills, and item placement help the scene feel handcrafted instead of random.",
    introBodyZh:
      "像素风场景最怕“只有风格，没有世界”。天气、招牌、暖光和物件摆放会让场景更像有人认真搭出来，而不是随机拼出来的素材。",
    workflowTitle: "How to keep pixel prompts readable",
    workflowTitleZh: "如何让像素 prompt 既复古又不混乱",
    workflowBody:
      "Focus on a small number of objects, one dominant light source, and one mood anchor such as rain, lanterns, or steam. Too many separate ideas usually make pixel scenes muddy.",
    workflowBodyZh:
      "建议控制对象数量，保留一个主光源，再加一个情绪锚点，比如下雨、灯笼或热气。元素太多会让像素图变得脏乱。",
    useCasesTitle: "Best use cases for pixel-art prompts",
    useCasesTitleZh: "像素提示词最适合的使用场景",
    useCasesBody:
      "Great for indie game concepts, nostalgic posters, cozy storefront scenes, and stylized social posts where charm matters more than realism.",
    useCasesBodyZh:
      "适合独立游戏概念图、怀旧海报、温馨街店场景和风格化社媒视觉，重点在氛围和记忆点，不在写实。",
  },
  "3D Render": {
    slug: "3d-render",
    label: "3D Render",
    labelZh: "3D 渲染",
    shortDescription:
      "Prompt ideas for abstract 3D forms, concept renders, material studies, and premium presentation boards.",
    shortDescriptionZh: "适合抽象 3D 形体、概念渲染、材质研究和高级展示板的提示词。",
    introTitle: "What makes a 3D render prompt feel premium?",
    introTitleZh: "什么样的 3D 渲染提示词更有高级感？",
    introBody:
      "The best 3D prompts define material, light quality, camera treatment, and composition restraint. Premium 3D work often comes from clarity and control instead of piling on more shapes.",
    introBodyZh:
      "高级感通常来自材质、光线、镜头和构图控制，而不是一味堆更多形体。越清晰、越克制，3D 图越容易显得完整。",
    workflowTitle: "How to iterate on 3D prompt directions",
    workflowTitleZh: "如何迭代 3D 渲染 prompt 的方向",
    workflowBody:
      "Keep the form language stable and change the material set, camera angle, or color environment one variable at a time. That makes comparisons cleaner and helps teams decide faster.",
    workflowBodyZh:
      "建议保持形体语言稳定，每次只改材质、镜头角度或配色环境中的一个变量。这样更方便横向比较，也更利于团队快速决策。",
    useCasesTitle: "Best use cases for 3D render prompts",
    useCasesTitleZh: "3D 渲染提示词最适合的使用场景",
    useCasesBody:
      "Strong for keynote boards, abstract branding visuals, concept art references, and material-driven hero sections that need a polished presentation feel.",
    useCasesBodyZh:
      "适合 keynote 展示板、抽象品牌视觉、概念图参考和以材质表现为主的首页 hero 区。",
  },
};

export const PROMPT_CATEGORY_SLUGS = PROMPT_CATEGORIES.map(
  (category) => PROMPT_CATEGORY_META[category].slug
);

export function getPromptCategoryMetaBySlug(slug: string) {
  return Object.values(PROMPT_CATEGORY_META).find((item) => item.slug === slug);
}

export function getPromptCategoryBySlug(slug: string): PromptCategory | null {
  const entry = Object.entries(PROMPT_CATEGORY_META).find(([, meta]) => meta.slug === slug);
  return (entry?.[0] as PromptCategory | undefined) || null;
}
