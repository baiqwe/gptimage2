'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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

interface HomeHeroGeneratorProps {
    onShowStaticContent: (show: boolean) => void;
    user?: any;
}

export default function HomeHeroGenerator({ onShowStaticContent, user }: HomeHeroGeneratorProps) {
    const t = useTranslations('hero');
    const pathname = usePathname();
    const locale = pathname?.split('/')[1] === 'zh' ? 'zh' : 'en';
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

    return (
        <>
            <QuickRefillModal isOpen={isRefillModalOpen} onClose={() => setIsRefillModalOpen(false)} />

            <section className="relative overflow-hidden pb-16 pt-8 sm:pt-10 lg:pb-24">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,178,105,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,112,52,0.12),transparent_20%),linear-gradient(180deg,#fffdf8_0%,#fff7ee_52%,#fff3e7_100%)]" />
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-10 text-center lg:mb-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-semibold text-orange-700 shadow-[0_10px_30px_rgba(255,138,61,0.08)]">
                                <Sparkles className="h-4 w-4" />
                                {t('badge')}
                            </div>
                            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                {locale === 'zh' ? '把你的想法直接排成成品级画面' : 'Turn your idea into a polished visual workspace'}
                            </h1>
                            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                                {t('subtitle')}
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
                                        <div className="space-y-4">
                                            <div className={`grid gap-4 ${resultImages.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                                                {resultImages.map((imageSrc, index) => (
                                                    <div key={`${imageSrc.slice(0, 24)}-${index}`} className="space-y-3">
                                                        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#ead8c7] bg-[#f7efe6]">
                                                            <Image
                                                                src={imageSrc}
                                                                alt={`Generated image ${index + 1}`}
                                                                fill
                                                                className="object-contain"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={() => handleDownload(imageSrc, index)}
                                                            variant="outline"
                                                            className="h-11 w-full rounded-2xl border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            {locale === 'zh' ? `下载图片 ${index + 1}` : `Download image ${index + 1}`}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
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
                                        <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[24px] border border-dashed border-orange-200 bg-[linear-gradient(180deg,#fff7ef_0%,#fffdfb_100%)] text-center">
                                            <div className="relative mb-8 w-full max-w-[520px] px-8">
                                                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-[0_20px_44px_rgba(235,145,71,0.14)]">
                                                    <Image
                                                        src="/blog/character-sheet.png"
                                                        alt="Creative preview sample"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-semibold text-slate-900">
                                                {locale === 'zh' ? '右侧实时展示出图结果' : 'See your output on the right'}
                                            </h4>
                                            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                                                {locale === 'zh'
                                                    ? '整体布局参考了更适合商业展示的海报式工作台。现在先保留最实用的三个控制项：尺寸、质量和格式。'
                                                    : 'The layout now feels closer to a polished poster-style workspace. For now, the generator keeps only the practical controls: size, quality, and format.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
