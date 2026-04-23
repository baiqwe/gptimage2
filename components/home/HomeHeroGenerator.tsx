'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2,
    Sparkles,
    Wand2,
    Download,
    ImagePlus,
    Dices,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    GalleryHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import { QuickRefillModal } from '@/components/payment/quick-refill-modal';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/use-credits';
import { createClient } from '@/utils/supabase/client';
import {
    DEFAULT_PROMPTS,
    OUTPUT_FORMAT_OPTIONS,
    QUALITY_OPTIONS,
    SIZE_PRESETS,
    type OutputFormatOption,
    type QualityOption,
    type SizePresetId,
} from '@/config/gpt-image';
import { CREDITS_PER_GENERATION } from '@/config/pricing';

const INSPIRATION_PROMPTS = [
    {
        id: "product-ad",
        prompt: "A premium citrus soda advertisement, dewy aluminum can on a bright tabletop, fresh lemons and yuzu, airy summer light, elegant Japanese poster composition, premium commercial photography",
        promptZh: "一张高级柑橘气泡饮广告图，带水珠的铝罐放在明亮桌面上，搭配柠檬和柚子，夏日通透光线，日系海报式构图，商业摄影质感",
        label: "Product Ad",
        labelZh: "产品广告"
    },
    {
        id: "anime-scene",
        prompt: "An anime girl standing by the sea at sunset, wind moving through her hair, luminous sky, cinematic framing, soft painterly detail, emotional atmosphere",
        promptZh: "黄昏海边的动漫少女，海风吹动发丝，天空发光通透，电影感取景，柔和绘画细节，情绪氛围浓厚",
        label: "Anime Scene",
        labelZh: "动漫场景"
    },
    {
        id: "fashion-portrait",
        prompt: "A luxury editorial portrait of a model in an ivory sculptural coat, clean studio lighting, elegant styling, soft gradient shadows, premium magazine photography",
        promptZh: "一张高级编辑人像，模特穿着象牙白雕塑感外套，纯净棚拍光线，造型优雅，阴影层次柔和，奢侈品杂志摄影风格",
        label: "Fashion",
        labelZh: "时尚人像"
    },
    {
        id: "fantasy-art",
        prompt: "A fantasy citadel floating above golden clouds, ornate towers, radiant sunrise, epic painterly detail, majestic composition",
        promptZh: "一座漂浮在金色云海上的奇幻城堡，塔楼华丽，日出光芒照亮天空，史诗绘画细节，构图宏大",
        label: "Fantasy",
        labelZh: "奇幻史诗"
    }
];

const SAMPLE_PREVIEW_SLIDES = [
    {
        src: "/examples/tiktok-live-stream.webp",
        title: "TikTok Live Stream",
        titleZh: "TikTok 直播截图",
        subtitle: "A preset social-content example with mobile livestream framing and creator-first composition.",
        subtitleZh: "一个偏社媒内容方向的系统示例，强调手机直播构图和主播主体表现。",
        prompt: "Generate a screenshot of a TikTok live stream featuring a beautiful woman streaming.",
        promptZh: "生成一张 TikTok 直播截图，画面是一位漂亮女生正在直播。",
    },
    {
        src: "/examples/design-system-board.webp",
        title: "XX Design System",
        titleZh: "XX 设计系统",
        subtitle: "A clean system board covering web, mobile, controls, cards, and reusable interface patterns.",
        subtitleZh: "一个完整展示 Web、移动端、控件、卡片与复用组件的系统化设计板。",
        prompt: "Generate a UI design system for me in xx style, including web pages, mobile, cards, controls, buttons, and others.",
        promptZh: "请用 xx 风格为我生成一套 UI design system，包括 Web 页面、移动端、卡片、控件、按钮等。",
    },
    {
        src: "/examples/cyberpunk-silver-portrait.webp",
        title: "Cyberpunk Portrait",
        titleZh: "赛博朋克人像",
        subtitle: "A close-up futuristic portrait with neon reflections, rain-soaked surfaces, and cinematic bokeh depth.",
        subtitleZh: "一张带霓虹反光、雨夜街景和电影感虚化的人像特写，整体偏未来都市氛围。",
        prompt: "A close-up portrait of a woman with short silver hair in a rain-soaked cyberpunk city at night. Neon signs in pink and teal reflect off wet surfaces and her metallic jacket. Futuristic face implants glow softly beneath the skin. Shot with a wide-aperture lens, bokeh of city lights in the background.",
        promptZh: "一位短银发女性的近景人像，站在雨夜赛博朋克城市中。粉色和青绿色霓虹招牌倒映在潮湿地面与她的金属感外套上，皮肤下若隐若现的未来感面部植入物柔和发光。使用大光圈镜头拍摄，背景是城市灯光形成的散景。",
    },
    {
        src: "/examples/pixel-ramen-shop.webp",
        title: "Pixel Ramen Shop",
        titleZh: "像素拉面店",
        subtitle: "A nostalgic 16-bit alley scene with warm shop light, rainy reflections, and a cozy late-night mood.",
        subtitleZh: "一张带 16-bit 像素风细节的夜雨小巷场景，暖光拉面店、霓虹招牌和雨夜氛围都很完整。",
        prompt: "A retro pixel art scene of a cozy ramen shop on a rainy night in a quiet Japanese alley. Warm light spills from the shop window, a cat sits under the awning, steam rises from a bowl visible through the glass. 16-bit color palette, detailed pixel work for rain droplets, neon sign glows 'ラーメン'. Nostalgic and atmospheric.",
        promptZh: "一个复古像素风场景：安静的日本小巷里，一家温馨的拉面店正处在雨夜中。暖黄灯光从店窗溢出，一只猫蹲在雨棚下，透过玻璃能看到冒着热气的拉面。使用 16-bit 配色，雨滴像素细节丰富，霓虹招牌写着“ラーメン”，整体怀旧而有氛围。",
    },
] as const;

interface HomeHeroGeneratorProps {
    onShowStaticContent: (show: boolean) => void;
    user?: any;
}

export default function HomeHeroGenerator({ onShowStaticContent, user }: HomeHeroGeneratorProps) {
    const pathname = usePathname();
    const locale = pathname?.split('/')[1] === 'zh' ? 'zh' : 'en';
    const isCreatePage = pathname?.endsWith('/create');
    const defaultPrompt = locale === 'zh' ? DEFAULT_PROMPTS.zh : DEFAULT_PROMPTS.en;

    const { credits, refetchCredits } = useCredits();
    const { toast } = useToast();

    const [prompt, setPrompt] = useState<string>(defaultPrompt);
    const [sizePreset, setSizePreset] = useState<SizePresetId>("square");
    const [quality, setQuality] = useState<QualityOption>("auto");
    const [outputFormat, setOutputFormat] = useState<OutputFormatOption>("png");
    const [resultImages, setResultImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(user);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [activeSampleIndex, setActiveSampleIndex] = useState(0);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const supabase = createClient();
                if (!supabase) return;
                const { data: { user: latestUser } } = await supabase.auth.getUser();
                if (latestUser) {
                    setCurrentUser(latestUser);
                    setShowLoginPrompt(false);
                }
            } catch (authError) {
                console.error('Error checking user:', authError);
            }
        };

        checkUser();

        const supabase = createClient();
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setCurrentUser(session.user);
                setShowLoginPrompt(false);
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        onShowStaticContent(resultImages.length === 0);
    }, [resultImages, onShowStaticContent]);

    useEffect(() => {
        if (resultImages.length <= 1) return;

        const timer = window.setInterval(() => {
            setActivePreviewIndex((index) => (index + 1) % resultImages.length);
        }, 3500);

        return () => window.clearInterval(timer);
    }, [resultImages]);

    useEffect(() => {
        if (resultImages.length > 0) return;

        const timer = window.setInterval(() => {
            setActiveSampleIndex((index) => (index + 1) % SAMPLE_PREVIEW_SLIDES.length);
        }, 3200);

        return () => window.clearInterval(timer);
    }, [resultImages.length]);

    useEffect(() => {
        if (resultImages.length > 0) {
            setActivePreviewIndex(0);
        }
    }, [resultImages]);

    useEffect(() => {
        setPrompt((currentPrompt) => {
            if (currentPrompt === DEFAULT_PROMPTS.en || currentPrompt === DEFAULT_PROMPTS.zh) {
                return defaultPrompt;
            }
            return currentPrompt;
        });
    }, [defaultPrompt]);

    const saveStateForLater = () => {
        localStorage.setItem("pending_gpt_image_2_generation", JSON.stringify({
            prompt,
            sizePreset,
            quality,
            outputFormat,
            timestamp: Date.now()
        }));
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("checkout") === "success") {
            const savedState = localStorage.getItem("pending_gpt_image_2_generation");
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    setPrompt(parsed.prompt || defaultPrompt);
                    setSizePreset(parsed.sizePreset || "square");
                    setQuality(parsed.quality || "auto");
                    setOutputFormat(parsed.outputFormat || "png");
                    localStorage.removeItem("pending_gpt_image_2_generation");

                    toast({
                        title: locale === "zh" ? "支付成功！" : "Payment Successful!",
                        description: locale === "zh"
                            ? "积分已添加，继续您的创作..."
                            : "Credits added. Resuming your creation...",
                        className: "bg-green-500 text-white border-none"
                    });

                    setTimeout(() => {
                        handleGenerate(true);
                    }, 1000);
                } catch (restoreError) {
                    console.error("Failed to restore generation state", restoreError);
                }
            }

            refetchCredits();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const pendingAfterLogin = localStorage.getItem("pending_gpt_image_2_generation");
        if (user && pendingAfterLogin) {
            try {
                const parsed = JSON.parse(pendingAfterLogin);
                if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    setPrompt(parsed.prompt || defaultPrompt);
                    setSizePreset(parsed.sizePreset || "square");
                    setQuality(parsed.quality || "auto");
                    setOutputFormat(parsed.outputFormat || "png");
                    localStorage.removeItem("pending_gpt_image_2_generation");

                    toast({
                        title: locale === "zh" ? "欢迎！" : "Welcome!",
                        description: locale === "zh"
                            ? "您的创作设置已恢复。"
                            : "Your creation settings have been restored.",
                    });
                }
            } catch {
                localStorage.removeItem("pending_gpt_image_2_generation");
            }
        }
    }, [defaultPrompt, locale, refetchCredits, toast, user]);

    const handleGenerate = async (force = false) => {
        if (!prompt.trim()) {
            setError(locale === "zh" ? "请输入描述" : "Please enter a prompt");
            return;
        }

        if (!currentUser) {
            saveStateForLater();
            setShowLoginPrompt(true);
            return;
        }

        if (!force && credits && credits.remaining_credits < CREDITS_PER_GENERATION) {
            saveStateForLater();
            setIsRefillModalOpen(true);
            return;
        }

        setIsGenerating(true);
        setError(null);
        setShowLoginPrompt(false);

        try {
            const response = await fetch("/api/ai/text-to-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    size_preset: sizePreset,
                    quality,
                    output_format: outputFormat,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 402) {
                    saveStateForLater();
                    setIsRefillModalOpen(true);
                    return;
                }
                if (response.status === 401) {
                    saveStateForLater();
                    setShowLoginPrompt(true);
                    return;
                }
                throw new Error(errorData.error || "Generation failed");
            }

            const data = await response.json();
            const images = Array.isArray(data.images) ? data.images : (data.url ? [data.url] : []);

            if (images.length > 0) {
                setResultImages(images);
                await refetchCredits();
                const confetti = (await import('canvas-confetti')).default;
                confetti({
                    particleCount: 100,
                    spread: 64,
                    origin: { y: 0.72 },
                    colors: ['#ff6b2c', '#ffb347', '#ffe1bf'],
                });
            } else {
                throw new Error("No image returned from server");
            }
        } catch (requestError: any) {
            setError(requestError.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (imageSrc: string, imageIndex = 0) => {
        if (!imageSrc) return;
        try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gpt-image-2-${Date.now()}-${imageIndex + 1}.${outputFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(imageSrc, '_blank');
        }
    };

    const activeResultImage = resultImages[activePreviewIndex] ?? resultImages[0];
    const activeSample = SAMPLE_PREVIEW_SLIDES[activeSampleIndex];
    const heroBadge = locale === 'zh'
        ? (isCreatePage ? 'GPT Image 2 AI 绘图工作台' : 'GPT Image 2 在线图像生成器')
        : (isCreatePage ? 'GPT Image 2 AI Image Workspace' : 'GPT Image 2 Generator Online');
    const heroTitle = locale === 'zh'
        ? (isCreatePage
            ? '立即使用 GPT Image 2 生成海报、产品图与概念视觉'
            : '用 GPT Image 2 生成 AI 艺术图、产品视觉与设计概念')
        : (isCreatePage
            ? 'Generate AI Art, Product Visuals, and Concepts with GPT Image 2'
            : 'Create AI Art, Product Visuals, and Design Concepts with GPT Image 2');
    const heroSubtitle = locale === 'zh'
        ? (isCreatePage
            ? '在这个 AI 绘图工作台里输入提示词，选择尺寸、质量和导出格式，快速生成高清图像并立即下载。'
            : '用 GPT Image 2 在线生成海报、产品图、界面概念图和风格化视觉，在一个清晰的提示词工作流里完成灵感到成品的转化。')
        : (isCreatePage
            ? 'Use this AI image workspace to write a prompt, choose size, quality, and export format, then generate high-quality visuals in seconds.'
            : 'Create posters, product visuals, UI concepts, and styled artwork with GPT Image 2 in a clean prompt-to-image workflow built for fast iteration.');

    return (
        <>
            <QuickRefillModal isOpen={isRefillModalOpen} onClose={() => setIsRefillModalOpen(false)} />

            <section id="generator-workspace" className="relative overflow-hidden pb-16 pt-8 sm:pt-10 lg:pb-24">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,178,105,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,112,52,0.12),transparent_20%),linear-gradient(180deg,#fffdf8_0%,#fff7ee_52%,#fff3e7_100%)]" />
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-10 text-center lg:mb-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-semibold text-orange-700 shadow-[0_10px_30px_rgba(255,138,61,0.08)]">
                                <Sparkles className="h-4 w-4" />
                                {heroBadge}
                            </div>
                            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                {heroTitle}
                            </h1>
                            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                                {heroSubtitle}
                            </p>
                        </div>

                        <div className="rounded-[32px] border border-orange-100 bg-white/85 p-4 shadow-[0_30px_120px_rgba(234,120,45,0.14)] backdrop-blur sm:p-6 lg:p-8">
                            <div className="grid gap-6 xl:grid-cols-[1.02fr_1fr]">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-3 rounded-[28px] border border-orange-100 bg-[#fffaf4] p-2">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-2 rounded-[20px] border border-orange-100 bg-white px-4 py-4 text-lg font-semibold text-slate-500 shadow-sm"
                                        >
                                            <ImagePlus className="h-5 w-5" />
                                            {locale === 'zh' ? '编辑图片' : 'Edit Image'}
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-2 rounded-[20px] bg-[#ff6b2c] px-4 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(255,107,44,0.28)]"
                                        >
                                            <Sparkles className="h-5 w-5" />
                                            {locale === 'zh' ? '生成图片' : 'Create Image'}
                                        </button>
                                    </div>

                                    <div className="rounded-[28px] border border-[#f1dcc7] bg-[#fffdfa] p-5 shadow-[0_20px_60px_rgba(235,145,71,0.08)] sm:p-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                                                <Sparkles className="h-5 w-5 text-orange-400" />
                                                {locale === 'zh' ? '描述你的想法' : 'Describe your idea'}
                                            </label>
                                            <span className="text-sm text-slate-400">{prompt.length}/32000</span>
                                        </div>

                                        <Textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            className="min-h-[170px] resize-none rounded-[22px] border-orange-200 bg-white text-lg text-slate-900 shadow-[inset_0_1px_6px_rgba(30,41,59,0.04)] placeholder:text-slate-400 focus:border-orange-300 focus:ring-orange-200"
                                            maxLength={32000}
                                        />

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {INSPIRATION_PROMPTS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setPrompt(locale === 'zh' ? item.promptZh : item.prompt)}
                                                    className="rounded-full bg-[#f5f1ea] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#ffe6d8] hover:text-orange-700"
                                                >
                                                    {locale === 'zh' ? item.labelZh : item.label}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const random = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
                                                    setPrompt(locale === 'zh' ? random.promptZh : random.prompt);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full bg-[#ffe7d9] px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-[#ffd8c0]"
                                            >
                                                <Dices className="h-4 w-4" />
                                                {locale === 'zh' ? '随机灵感' : 'Random'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 rounded-[28px] border border-orange-100 bg-[#fffaf4] p-5 sm:grid-cols-3 sm:p-6">
                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '尺寸' : 'Size'}
                                            </p>
                                            <div className="space-y-2">
                                                {SIZE_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.id}
                                                        type="button"
                                                        onClick={() => setSizePreset(preset.id)}
                                                        className={`flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-center transition-all ${sizePreset === preset.id
                                                            ? 'border-orange-200 bg-[#ff6b2c] text-white shadow-[0_12px_28px_rgba(255,107,44,0.22)]'
                                                            : 'border-[#ecd9c7] bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                                                            }`}
                                                    >
                                                        <span className="text-sm font-semibold tracking-[0.02em] sm:text-base">
                                                            {preset.size}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '质量' : 'Quality'}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {QUALITY_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => setQuality(option.id)}
                                                        className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${quality === option.id
                                                            ? 'border-orange-200 bg-[#ff6b2c] text-white shadow-[0_12px_24px_rgba(255,107,44,0.2)]'
                                                            : 'border-[#ecd9c7] bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                                                            }`}
                                                    >
                                                        {locale === 'zh' ? option.labelZh : option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '格式' : 'Format'}
                                            </p>
                                            <div className="space-y-2">
                                                {OUTPUT_FORMAT_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => setOutputFormat(option.id)}
                                                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${outputFormat === option.id
                                                            ? 'border-orange-200 bg-[#ff6b2c] text-white shadow-[0_12px_24px_rgba(255,107,44,0.2)]'
                                                            : 'border-[#ecd9c7] bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                                                            }`}
                                                    >
                                                        <span>{option.label}</span>
                                                        {outputFormat === option.id && <CheckCircle2 className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {currentUser ? (
                                        <div className="flex items-center justify-between rounded-[24px] border border-orange-100 bg-[#fffaf4] px-5 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {locale === 'zh' ? '剩余积分' : 'Credits remaining'}
                                                </p>
                                                <p className="text-2xl font-semibold text-slate-900">{credits?.remaining_credits ?? 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500">
                                                    {locale === 'zh' ? '本次消耗' : 'This run'}
                                                </p>
                                                <p className="text-lg font-semibold text-orange-600">{CREDITS_PER_GENERATION} {locale === 'zh' ? '积分' : 'credits'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-[24px] border border-orange-100 bg-[#fff6ef] px-5 py-4 text-sm text-slate-600">
                                            <span className="font-semibold text-orange-700">{locale === 'zh' ? '免费试用：' : 'Free trial:'}</span>{' '}
                                            {locale === 'zh' ? '新用户可先体验 3 次生成。' : 'New users can try 3 generations first.'}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Button
                                            size="lg"
                                            className="h-16 w-full rounded-[22px] bg-[#ff6b2c] text-lg font-semibold text-white shadow-[0_20px_44px_rgba(255,107,44,0.32)] transition-transform hover:translate-y-[-1px] hover:bg-[#f86120]"
                                            onClick={() => handleGenerate()}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {locale === 'zh' ? '正在生成图片...' : 'Generating image...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="mr-2 h-5 w-5" />
                                                    {locale === 'zh' ? '生成图片' : 'Generate Image'}
                                                </>
                                            )}
                                        </Button>

                                        {error && (
                                            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-600">
                                                {error}
                                            </p>
                                        )}

                                        {showLoginPrompt && !currentUser && (
                                            <div className="rounded-[24px] border border-orange-100 bg-[#fffaf4] p-4 text-center">
                                                <p className="mb-3 text-sm text-slate-600">
                                                    {locale === 'zh' ? '登录后即可开始真实生成。' : 'Sign in to start real generations.'}
                                                </p>
                                                <Button
                                                    onClick={() => window.location.href = `/${locale}/sign-in`}
                                                    className="rounded-full bg-white text-orange-700 shadow-sm hover:bg-orange-50"
                                                >
                                                    {locale === 'zh' ? '登录 / 注册' : 'Sign In / Sign Up'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-orange-100 bg-[#fffdf9] p-5 shadow-[0_20px_60px_rgba(235,145,71,0.08)] sm:p-6">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '预览' : 'Preview'}
                                            </p>
                                            <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                                                {locale === 'zh' ? '生成结果会显示在这里' : 'Generated image will appear here'}
                                            </h3>
                                        </div>
                                        <div className="rounded-full bg-[#fff3ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                                            GPT Image 2
                                        </div>
                                    </div>

                                    {resultImages.length > 0 ? (
                                        <div className="space-y-5">
                                            <div className="rounded-[28px] border border-orange-100 bg-[linear-gradient(180deg,#fff7ef_0%,#fffefb_100%)] p-4 shadow-[0_18px_40px_rgba(235,145,71,0.12)]">
                                                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#ead8c7] bg-[#f7efe6]">
                                                    {activeResultImage && (
                                                    <Image
                                                        src={activeResultImage}
                                                        alt={prompt
                                                            ? `${locale === 'zh' ? '根据以下提示词生成的图片：' : 'Generated image based on prompt: '}${prompt}`
                                                            : `Generated image ${activePreviewIndex + 1}`}
                                                        fill
                                                        className="object-contain"
                                                        unoptimized
                                                        />
                                                    )}
                                                    {resultImages.length > 1 && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActivePreviewIndex((current) => (current - 1 + resultImages.length) % resultImages.length)}
                                                                className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white"
                                                            >
                                                                <ChevronLeft className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActivePreviewIndex((current) => (current + 1) % resultImages.length)}
                                                                className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white"
                                                            >
                                                                <ChevronRight className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between rounded-[22px] border border-orange-100 bg-[#fffaf4] px-4 py-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                        {locale === 'zh' ? '当前画面' : 'Current frame'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {locale === 'zh'
                                                            ? `第 ${activePreviewIndex + 1} 张，共 ${resultImages.length} 张`
                                                            : `Image ${activePreviewIndex + 1} of ${resultImages.length}`}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => activeResultImage && handleDownload(activeResultImage, activePreviewIndex)}
                                                    variant="outline"
                                                    className="h-11 rounded-2xl border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    {locale === 'zh' ? '下载当前图片' : 'Download current image'}
                                                </Button>
                                            </div>

                                            {resultImages.length > 1 && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {resultImages.map((imageSrc, index) => (
                                                        <button
                                                            key={`${imageSrc.slice(0, 24)}-${index}`}
                                                            type="button"
                                                            onClick={() => setActivePreviewIndex(index)}
                                                            className={`relative aspect-[4/3] overflow-hidden rounded-[18px] border transition-all ${activePreviewIndex === index
                                                                ? 'border-orange-300 shadow-[0_12px_30px_rgba(255,107,44,0.18)]'
                                                                : 'border-orange-100 opacity-75 hover:opacity-100'
                                                                }`}
                                                        >
                                                            <Image
                                                                src={imageSrc}
                                                                alt={prompt
                                                                    ? `${locale === 'zh' ? '生成结果缩略图：' : 'Generated thumbnail for prompt: '}${prompt}`
                                                                    : `Generated thumbnail ${index + 1}`}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {resultImages.length > 1 && (
                                                <div className="flex items-center justify-center gap-2">
                                                    {resultImages.map((_, index) => (
                                                        <button
                                                            key={`preview-dot-${index}`}
                                                            type="button"
                                                            onClick={() => setActivePreviewIndex(index)}
                                                            className={`h-2.5 rounded-full transition-all ${activePreviewIndex === index ? 'w-8 bg-orange-500' : 'w-2.5 bg-orange-200 hover:bg-orange-300'}`}
                                                            aria-label={`Preview image ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="h-11 rounded-2xl border-orange-200 bg-white text-slate-700 hover:bg-orange-50"
                                                onClick={() => {
                                                    setResultImages([]);
                                                    setPrompt(defaultPrompt);
                                                }}
                                            >
                                                {locale === 'zh' ? '重新开始' : 'Start Over'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[520px] flex-col justify-between rounded-[24px] border border-dashed border-orange-200 bg-[linear-gradient(180deg,#fff7ef_0%,#fffdfb_100%)] p-5 text-center">
                                            <div className="mb-5 flex items-center justify-between rounded-[20px] bg-white/80 px-4 py-3">
                                                <div className="text-left">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                        {locale === 'zh' ? '系统示例轮播' : 'Preset carousel'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {locale === 'zh' ? activeSample.titleZh : activeSample.title}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {SAMPLE_PREVIEW_SLIDES.map((slide, index) => (
                                                        <button
                                                            key={slide.src}
                                                            type="button"
                                                            onClick={() => setActiveSampleIndex(index)}
                                                            className={`h-2.5 rounded-full transition-all ${activeSampleIndex === index ? 'w-8 bg-orange-500' : 'w-2.5 bg-orange-200'}`}
                                                            aria-label={`Sample slide ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="relative mx-auto w-full max-w-[540px]">
                                                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_24px_54px_rgba(235,145,71,0.16)]">
                                                    <Image
                                                        src={activeSample.src}
                                                        alt={locale === 'zh' ? activeSample.promptZh : activeSample.prompt}
                                                        fill
                                                        className="object-cover"
                                                        priority
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent p-5 text-left text-white">
                                                        <p className="text-lg font-semibold">
                                                            {locale === 'zh' ? activeSample.titleZh : activeSample.title}
                                                        </p>
                                                        <p className="mt-1 max-w-sm text-sm text-white/85">
                                                            {locale === 'zh' ? activeSample.subtitleZh : activeSample.subtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-center gap-2">
                                                    {SAMPLE_PREVIEW_SLIDES.map((slide, index) => (
                                                        <button
                                                            key={`sample-dot-bottom-${slide.src}`}
                                                            type="button"
                                                            onClick={() => setActiveSampleIndex(index)}
                                                            className={`h-2.5 rounded-full transition-all ${activeSampleIndex === index ? 'w-8 bg-orange-500' : 'w-2.5 bg-orange-200 hover:bg-orange-300'}`}
                                                            aria-label={`Sample image ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-semibold text-slate-900">
                                                {locale === 'zh' ? '先看看示例效果，再开始生成你的画面' : 'Browse a few example outputs before creating your own'}
                                            </h4>
                                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                                                {locale === 'zh'
                                                    ? '你生成成功后，这里会自动切换成你的结果轮播，方便连续预览和下载。'
                                                    : 'Once your images are ready, this preview area automatically switches to your own result carousel.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[linear-gradient(180deg,#fff8f0_0%,#fffdf9_100%)] py-20">
                <div className="container px-4 md:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {locale === 'zh' ? '系统示例' : 'Preset examples'}
                            </p>
                            <h2 className="mt-3 flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                <GalleryHorizontal className="h-6 w-6 text-orange-500" />
                                {locale === 'zh' ? '看看 GPT Image 2 可以做出的不同成片方向' : 'Explore a few polished directions you can build with GPT Image 2'}
                            </h2>
                            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                                {locale === 'zh'
                                    ? '下面这些是我们预置好的示例提示词和成品图，你可以用来理解风格、版式和画面完成度。'
                                    : 'These curated examples show how different prompt styles can turn into polished, presentation-ready visuals.'}
                            </p>
                        </div>

                        <div className="space-y-5">
                            {SAMPLE_PREVIEW_SLIDES.map((item, index) => (
                                <div
                                    key={item.src}
                                    className="grid gap-5 rounded-[28px] border border-orange-100 bg-[linear-gradient(180deg,#fffdf9_0%,#fff8f1_100%)] p-5 shadow-[0_20px_50px_rgba(235,145,71,0.08)] lg:grid-cols-[0.9fr_1.1fr]"
                                >
                                    <div className={`rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_12px_34px_rgba(235,145,71,0.08)] ${index === 1 ? 'lg:order-2' : ''}`}>
                                        <div className="mb-4 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-[#fff3ea] px-3 py-1 text-xs font-semibold text-orange-700">
                                                GPT Image 2
                                            </span>
                                            <span className="rounded-full bg-[#f5f1ea] px-3 py-1 text-xs font-medium text-slate-600">
                                                {locale === 'zh' ? item.titleZh : item.title}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            Prompt
                                        </p>
                                        <p className="mt-3 text-base leading-8 text-slate-700">
                                            {locale === 'zh' ? item.promptZh : item.prompt}
                                        </p>
                                    </div>

                                    <div className={`space-y-3 ${index === 1 ? 'lg:order-1' : ''}`}>
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-orange-100 bg-white shadow-[0_12px_30px_rgba(235,145,71,0.12)]">
                                            <Image
                                                src={item.src}
                                                alt={locale === 'zh' ? item.promptZh : item.prompt}
                                                fill
                                                className="object-cover"
                                                priority={index === 0}
                                            />
                                        </div>
                                        <div className="rounded-[18px] bg-white/80 px-4 py-3 text-sm text-slate-600">
                                            {locale === 'zh' ? item.subtitleZh : item.subtitle}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
