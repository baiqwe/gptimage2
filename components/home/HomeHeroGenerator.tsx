'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';
import {
    Loader2,
    Sparkles,
    Wand2,
    Download,
    ImagePlus,
    Dices,
    ChevronLeft,
    ChevronRight,
    GalleryHorizontal,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/use-credits';
import { createClient } from '@/utils/supabase/client';
import {
    ASPECT_RATIO_OPTIONS,
    DEFAULT_PROMPTS,
    type AspectRatioOption,
    RESOLUTION_OPTIONS,
    type ResolutionOption,
    validateResolutionForAspectRatio,
} from '@/config/gpt-image';
import { CREDITS_PER_GENERATION } from '@/config/pricing';

const QuickRefillModal = dynamic(
    () => import('@/components/payment/quick-refill-modal').then((mod) => mod.QuickRefillModal),
    { ssr: false }
);

const AdaptiveAuthModal = dynamic(
    () => import('@/components/auth/adaptive-auth-modal').then((mod) => mod.AdaptiveAuthModal),
    { ssr: false }
);

type GenerationMode = 'text-to-image' | 'image-to-image';

interface ReferenceImage {
    url: string;
    name: string;
    previewUrl?: string;
}

interface PendingReferenceFile {
    file: File;
    previewUrl: string;
    name: string;
}

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

const DEFAULT_EDIT_PROMPTS = {
    en: "Change the background to a warm studio setting, keep the subject identity and composition, improve lighting and texture detail.",
    zh: "将背景改成温暖的棚拍场景，保留主体身份与构图，增强光线层次和材质细节。",
} as const;

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

const MAX_REFERENCE_FILE_SIZE = 20 * 1024 * 1024;
const REFERENCE_UPLOAD_RETRY_ATTEMPTS = 3;

interface SignedReferenceUploadPayload {
    signedUrl: string;
    path: string;
    url: string;
}

interface HomeHeroGeneratorProps {
    user?: any;
    heroHeader?: ReactNode;
}

export default function HomeHeroGenerator({ user, heroHeader }: HomeHeroGeneratorProps) {
    const pathname = usePathname();
    const locale = pathname?.split('/')[1] === 'zh' ? 'zh' : 'en';
    const isCreatePage = pathname?.endsWith('/create');
    const defaultPrompt = locale === 'zh' ? DEFAULT_PROMPTS.zh : DEFAULT_PROMPTS.en;
    const defaultEditPrompt = locale === 'zh' ? DEFAULT_EDIT_PROMPTS.zh : DEFAULT_EDIT_PROMPTS.en;

    const { credits, refetchCredits } = useCredits();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [prompt, setPrompt] = useState<string>(defaultPrompt);
    const [generationMode, setGenerationMode] = useState<GenerationMode>("text-to-image");
    const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("auto");
    const [resolution, setResolution] = useState<ResolutionOption>("1K");
    const [resultImages, setResultImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(user);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [activeSampleIndex, setActiveSampleIndex] = useState(0);
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
    const [pendingReferenceFiles, setPendingReferenceFiles] = useState<PendingReferenceFile[]>([]);
    const [isUploadingReference, setIsUploadingReference] = useState(false);
    const canUseHighResolution = Boolean(credits?.has_paid_access);
    const autoResumePendingRef = useRef(false);
    const pendingReferenceFilesRef = useRef<PendingReferenceFile[]>([]);
    const referenceImagesRef = useRef<ReferenceImage[]>([]);

    const waitForPaidAccessSync = async (requiresPaidAccess: boolean) => {
        const latestCredits = await refetchCredits();
        if (!requiresPaidAccess || latestCredits?.has_paid_access) {
            return latestCredits;
        }

        for (let attempt = 0; attempt < 5; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 1500));
            const nextCredits = await refetchCredits();
            if (nextCredits?.has_paid_access) {
                return nextCredits;
            }
        }

        return latestCredits;
    };

    const readResponseJson = async (response: Response) => {
        const text = await response.text();
        if (!text) return {};
        try {
            return JSON.parse(text);
        } catch {
            throw new Error(text || "Unexpected server response");
        }
    };

    const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const sanitizeReferenceImages = (images: unknown): ReferenceImage[] => {
        if (!Array.isArray(images)) {
            return [];
        }

        return images
            .filter((image): image is { url?: string; name?: string } => Boolean(image && typeof image === "object"))
            .map((image) => ({
                url: typeof image.url === "string" ? image.url : "",
                name: typeof image.name === "string" ? image.name : "",
            }))
            .filter((image) => image.url);
    };

    const isRetryableUploadError = (message: string) => {
        const normalized = message.toLowerCase();
        return normalized.includes("failed to fetch")
            || normalized.includes("networkerror")
            || normalized.includes("network request failed")
            || normalized.includes("error code 520")
            || normalized.includes("web server is returning an unknown error")
            || normalized.includes("timeout")
            || normalized.includes("temporarily unavailable")
            || normalized.includes("internal server error");
    };

    const uploadReferenceDirectly = async (file: File) => {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= REFERENCE_UPLOAD_RETRY_ATTEMPTS; attempt += 1) {
            try {
                const signedUploadResponse = await fetch("/api/ai/upload-reference", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileName: file.name,
                        contentType: file.type,
                        fileSize: file.size,
                    }),
                });

                const signedUploadData = await readResponseJson(signedUploadResponse) as Partial<SignedReferenceUploadPayload> & { error?: string };
                if (!signedUploadResponse.ok) {
                    throw new Error(signedUploadData.error || "Failed to prepare upload");
                }

                if (!signedUploadData.path || !signedUploadData.signedUrl) {
                    throw new Error("Upload URL is missing");
                }

                const uploadResponse = await fetch(signedUploadData.signedUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "content-type": file.type || "application/octet-stream",
                        "cache-control": "31536000",
                        "x-upsert": "false",
                    },
                });

                if (!uploadResponse.ok) {
                    const uploadText = await uploadResponse.text();
                    throw new Error(uploadText || "Direct upload failed");
                }

                if (!signedUploadData.url) {
                    throw new Error("Public URL is missing");
                }

                return {
                    url: signedUploadData.url,
                    path: signedUploadData.path,
                };
            } catch (error: any) {
                lastError = error instanceof Error ? error : new Error(error?.message || "Upload failed");
                if (attempt === REFERENCE_UPLOAD_RETRY_ATTEMPTS || !isRetryableUploadError(lastError.message)) {
                    break;
                }
                await sleep(800 * attempt);
            }
        }

        throw lastError || new Error("Upload failed");
    };

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
            if (currentPrompt === DEFAULT_EDIT_PROMPTS.en || currentPrompt === DEFAULT_EDIT_PROMPTS.zh) {
                return defaultEditPrompt;
            }
            return currentPrompt;
        });
    }, [defaultEditPrompt, defaultPrompt]);

    useEffect(() => {
        setPrompt((currentPrompt) => {
            const isDefaultTextPrompt = currentPrompt === DEFAULT_PROMPTS.en || currentPrompt === DEFAULT_PROMPTS.zh;
            const isDefaultEditPrompt = currentPrompt === DEFAULT_EDIT_PROMPTS.en || currentPrompt === DEFAULT_EDIT_PROMPTS.zh;

            if (generationMode === "image-to-image" && isDefaultTextPrompt) {
                return defaultEditPrompt;
            }

            if (generationMode === "text-to-image" && isDefaultEditPrompt) {
                return defaultPrompt;
            }

            return currentPrompt;
        });
    }, [defaultEditPrompt, defaultPrompt, generationMode]);

    const saveStateForLater = () => {
        localStorage.setItem("pending_gpt_image_2_generation", JSON.stringify({
            prompt,
            generationMode,
            aspectRatio,
            resolution,
            referenceImages: referenceImages.map((image) => ({
                url: image.url,
                name: image.name,
            })),
            pendingReferenceNames: pendingReferenceFiles.map((image) => image.name),
            timestamp: Date.now()
        }));
    };

    const needsReferenceBeforeEdit =
        generationMode === "image-to-image" &&
        referenceImages.length === 0 &&
        pendingReferenceFiles.length === 0;

    const handlePrimaryAction = () => {
        if (needsReferenceBeforeEdit) {
            if (!currentUser) {
                saveStateForLater();
                setShowLoginPrompt(true);
                return;
            }

            fileInputRef.current?.click();
            return;
        }

        handleGenerate();
    };

    useEffect(() => {
        const promptPrefill = localStorage.getItem("prompt_gallery_prefill");
        if (promptPrefill) {
            try {
                const parsed = JSON.parse(promptPrefill);
                if (parsed?.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    setPrompt(parsed.prompt || defaultPrompt);
                    setAspectRatio(parsed.aspectRatio || "auto");
                    localStorage.removeItem("prompt_gallery_prefill");

                    toast({
                        title: locale === "zh" ? "提示词已带入" : "Prompt ready",
                        description: locale === "zh"
                            ? "已将所选 prompt 和比例带入生成器。"
                            : "The selected prompt and aspect ratio are now in the generator.",
                    });
                }
            } catch {
                localStorage.removeItem("prompt_gallery_prefill");
            }
        }

        const query = new URLSearchParams(window.location.search);
        if (query.get("checkout") === "success") {
            const resumeAfterCheckout = async () => {
                const savedState = localStorage.getItem("pending_gpt_image_2_generation");
                let restoredResolution: ResolutionOption = "1K";

                if (savedState) {
                    try {
                        const parsed = JSON.parse(savedState);
                        restoredResolution = parsed.resolution || "1K";
                        setPrompt(parsed.prompt || defaultPrompt);
                        setGenerationMode(parsed.generationMode || "text-to-image");
                        setAspectRatio(parsed.aspectRatio || "auto");
                        setResolution(restoredResolution);
                        setReferenceImages(sanitizeReferenceImages(parsed.referenceImages));
                        localStorage.removeItem("pending_gpt_image_2_generation");
                    } catch (restoreError) {
                        console.error("Failed to restore generation state", restoreError);
                    }
                }

                toast({
                    title: locale === "zh" ? "支付成功！" : "Payment Successful!",
                    description: locale === "zh"
                        ? "正在同步积分和高清权限..."
                        : "Syncing credits and high-resolution access...",
                    className: "bg-green-500 text-white border-none"
                });

                const latestCredits = await waitForPaidAccessSync(restoredResolution !== "1K");

                if (restoredResolution !== "1K" && !latestCredits?.has_paid_access) {
                    setResolution("1K");
                    toast({
                        title: locale === "zh" ? "权益同步稍慢" : "Access sync is still in progress",
                        description: locale === "zh"
                            ? "付款已成功，但高清权限还没同步完成。请稍等几秒再试一次。"
                            : "Payment succeeded, but high-resolution access has not synced yet. Please try again in a few seconds.",
                    });
                    return;
                }

                if (restoredResolution !== "1K") {
                    setResolution(restoredResolution);
                }

                setTimeout(() => {
                    handleGenerate(true);
                }, 300);
            };

            void resumeAfterCheckout();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const pendingAfterLogin = localStorage.getItem("pending_gpt_image_2_generation");
        if (user && pendingAfterLogin) {
            try {
                const parsed = JSON.parse(pendingAfterLogin);
                if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    const hasPendingLocalReferences = Array.isArray(parsed.pendingReferenceNames) && parsed.pendingReferenceNames.length > 0;
                    setPrompt(parsed.prompt || defaultPrompt);
                    setGenerationMode(parsed.generationMode || "text-to-image");
                    setAspectRatio(parsed.aspectRatio || "auto");
                    setResolution(parsed.resolution || "1K");
                    setReferenceImages(sanitizeReferenceImages(parsed.referenceImages));
                    localStorage.removeItem("pending_gpt_image_2_generation");

                    toast({
                        title: locale === "zh" ? "欢迎！" : "Welcome!",
                        description: locale === "zh"
                            ? (hasPendingLocalReferences
                                ? "提示词和设置已恢复；本地参考图需要重新选择后再继续图生图。"
                                : "您的创作设置已恢复。")
                            : (hasPendingLocalReferences
                                ? "Your prompt and settings are restored. Please reselect local reference images before editing."
                                : "Your creation settings have been restored."),
                    });

                    if (!hasPendingLocalReferences) {
                        autoResumePendingRef.current = true;
                    }
                }
            } catch {
                localStorage.removeItem("pending_gpt_image_2_generation");
            }
        }
    }, [defaultPrompt, locale, refetchCredits, toast, user]);

    useEffect(() => {
        if (!currentUser || !autoResumePendingRef.current) return;
        autoResumePendingRef.current = false;
        const timer = window.setTimeout(() => {
            void handleGenerate();
        }, 250);
        return () => window.clearTimeout(timer);
    }, [currentUser, prompt, generationMode, aspectRatio, resolution, referenceImages.length]);

    useEffect(() => {
        pendingReferenceFilesRef.current = pendingReferenceFiles;
    }, [pendingReferenceFiles]);

    useEffect(() => {
        referenceImagesRef.current = referenceImages;
    }, [referenceImages]);

    useEffect(() => {
        return () => {
            const previewUrls = new Set<string>();
            pendingReferenceFilesRef.current.forEach((image) => {
                previewUrls.add(image.previewUrl);
            });
            referenceImagesRef.current.forEach((image) => {
                if (image.previewUrl) {
                    previewUrls.add(image.previewUrl);
                }
            });
            previewUrls.forEach((previewUrl) => {
                URL.revokeObjectURL(previewUrl);
            });
        };
    }, []);

    const handleResolutionSelect = (nextResolution: ResolutionOption) => {
        if (nextResolution === "1K") {
            setResolution(nextResolution);
            return;
        }

        if (canUseHighResolution) {
            setResolution(nextResolution);
            return;
        }

        saveStateForLater();

        if (!currentUser) {
            setShowLoginPrompt(true);
            return;
        }

        setIsRefillModalOpen(true);
        toast({
            title: locale === "zh" ? "升级解锁高清输出" : "Unlock high-resolution output",
            description: locale === "zh"
                ? "购买任意积分包后即可使用 2K 和 4K。"
                : "2K and 4K unlock after any paid credits package or subscription.",
        });
    };

    useEffect(() => {
        const validation = validateResolutionForAspectRatio(aspectRatio, resolution);
        if (!validation.valid) {
            setResolution(aspectRatio === "1:1" ? "2K" : "1K");
        }
    }, [aspectRatio, resolution]);

    useEffect(() => {
        if (!canUseHighResolution && resolution !== "1K") {
            setResolution("1K");
        }
    }, [canUseHighResolution, resolution]);

    const handleGenerate = async (force = false) => {
        let effectiveReferenceImages = referenceImages;

        if (!prompt.trim()) {
            setError(locale === "zh" ? "请输入描述" : "Please enter a prompt");
            return;
        }

        if (generationMode === "image-to-image" && referenceImages.length === 0) {
            if (pendingReferenceFiles.length === 0) {
                setError(locale === "zh" ? "请先上传至少一张参考图" : "Please upload at least one reference image first");
                return;
            }
        }

        if (!currentUser) {
            saveStateForLater();
            if (generationMode === "image-to-image" && pendingReferenceFiles.length > 0) {
                toast({
                    title: locale === "zh" ? "请先登录" : "Sign in first",
                    description: locale === "zh"
                        ? "提示词和比例会保留；本地参考图出于浏览器安全限制，登录后需要重新选择。"
                        : "Your prompt and ratio will stay in place, but local reference images need to be selected again after sign-in.",
                });
            }
            setShowLoginPrompt(true);
            return;
        }

        if (!force && credits && credits.remaining_credits < CREDITS_PER_GENERATION) {
            saveStateForLater();
            setIsRefillModalOpen(true);
            return;
        }

        if (generationMode === "image-to-image" && pendingReferenceFiles.length > 0 && referenceImages.length === 0) {
            setIsUploadingReference(true);
            try {
                const uploadedImages: ReferenceImage[] = [];

                for (const pendingImage of pendingReferenceFiles) {
                    const data = await uploadReferenceDirectly(pendingImage.file);
                    uploadedImages.push({
                        url: data.url,
                        name: pendingImage.name,
                        previewUrl: pendingImage.previewUrl,
                    });
                }

                setReferenceImages(uploadedImages);
                effectiveReferenceImages = uploadedImages;
                setPendingReferenceFiles([]);
            } catch (uploadError: any) {
                setError(uploadError.message || "Upload failed");
                return;
            } finally {
                setIsUploadingReference(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }

        if (generationMode === "image-to-image" && referenceImages.length === 0 && pendingReferenceFiles.length === 0) {
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
                    aspect_ratio: aspectRatio,
                    resolution,
                    input_urls: generationMode === "image-to-image"
                        ? effectiveReferenceImages.map((image) => image.url)
                        : [],
                }),
            });

            if (!response.ok) {
                const errorData = await readResponseJson(response);
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

            const data = await readResponseJson(response);
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

    const handleReferenceUpload = async (files?: FileList | File[]) => {
        const selectedFiles = Array.from(files || []).slice(0, 10 - referenceImages.length);
        if (selectedFiles.length === 0) return;

        const oversizedFile = selectedFiles.find((file) => file.size > MAX_REFERENCE_FILE_SIZE);
        if (oversizedFile) {
            setError(
                locale === "zh"
                    ? `图片 ${oversizedFile.name} 超过 20MB，请压缩后再上传`
                    : `Image ${oversizedFile.name} exceeds the 20MB limit. Please compress it before uploading.`
            );
            return;
        }

        setIsUploadingReference(true);
        setError(null);

        try {
            const newPendingFiles = selectedFiles.map((file) => ({
                file,
                name: file.name,
                previewUrl: URL.createObjectURL(file),
            }));

            setPendingReferenceFiles((current) => [...current, ...newPendingFiles].slice(0, 10));
            setGenerationMode("image-to-image");
            toast({
                title: locale === "zh" ? "参考图已上传" : "Reference images uploaded",
                description: locale === "zh"
                    ? "图片已准备好，点击生成时会自动上传并进入图生图流程。"
                    : "Images are ready. They will upload automatically when you start editing.",
            });
        } catch (uploadError: any) {
            setError(uploadError.message || "Upload failed");
        } finally {
            setIsUploadingReference(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDownload = async (imageSrc: string, imageIndex = 0) => {
        if (!imageSrc) return;
        try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            const extension = blob.type.includes("jpeg")
                ? "jpg"
                : blob.type.includes("webp")
                    ? "webp"
                    : blob.type.includes("png")
                        ? "png"
                        : "png";
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gpt-image-2-${Date.now()}-${imageIndex + 1}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(imageSrc, '_blank');
        }
    };

    const handleUseSamplePrompt = async (samplePrompt: string) => {
        setPrompt(samplePrompt);
        try {
            await navigator.clipboard.writeText(samplePrompt);
            toast({
                title: locale === 'zh' ? '提示词已复制' : 'Prompt copied',
                description: locale === 'zh' ? '提示词已填入输入框，你现在可以直接生成。' : 'The prompt is in the input box and ready to use.',
            });
        } catch {
            toast({
                title: locale === 'zh' ? '提示词已填入' : 'Prompt inserted',
                description: locale === 'zh' ? '你现在可以直接生成。' : 'You can generate with it right away.',
            });
        }

        document.getElementById('generator-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const activeResultImage = resultImages[activePreviewIndex] ?? resultImages[0];
    const activeSample = SAMPLE_PREVIEW_SLIDES[activeSampleIndex];
    const heroBadge = locale === 'zh'
        ? (isCreatePage ? 'GPT Image 2 AI 绘图工作台' : 'GPT Image 2 在线图像生成器')
        : (isCreatePage ? 'GPT Image 2 AI Image Workspace' : 'GPT Image 2 Generator Online');
    const heroTitle = locale === 'zh'
        ? (isCreatePage
            ? '立即使用 GPT Image 2 生成海报、产品图与概念视觉'
            : '用 GPT Image 2 免费生成 AI 艺术图、产品视觉与设计概念')
        : (isCreatePage
            ? 'Generate AI Art, Product Visuals, and Concepts with GPT Image 2'
            : 'Create with GPT Image 2: A Free AI Art Generator for Product Visuals and Concepts');
    const heroTitleContent = !isCreatePage && locale === 'en'
        ? (
            <>
                <span className="block">Create with GPT Image 2: A Free AI Art</span>
                <span className="block">Generator for Product Visuals and Concepts</span>
            </>
        )
        : heroTitle;
    const heroSubtitle = locale === 'zh'
        ? (isCreatePage
            ? '在这个 AI 绘图工作台里输入提示词，选择画面比例，快速生成高清图像；也可以上传参考图进行图生图编辑。'
            : '用 GPT Image 2 在线生成海报、产品图、界面概念图和风格化视觉，在一个清晰的提示词工作流里完成灵感到成品的转化。')
        : (isCreatePage
            ? 'Use this AI image workspace to write a prompt, choose an aspect ratio, generate high-quality visuals, or upload references for image-to-image editing.'
            : 'Create posters, product visuals, UI concepts, and styled artwork with GPT Image 2 in a clean prompt-to-image workflow built for fast iteration.');

    return (
        <>
            <QuickRefillModal isOpen={isRefillModalOpen} onClose={() => setIsRefillModalOpen(false)} />
            <AdaptiveAuthModal
                isOpen={showLoginPrompt && !currentUser}
                onOpenChange={setShowLoginPrompt}
                locale={locale}
            />

            <section id="generator-workspace" className="relative overflow-hidden pb-28 pt-3 sm:pb-32 sm:pt-4 lg:pb-16">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,178,105,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,112,52,0.12),transparent_20%),linear-gradient(180deg,#fffdf8_0%,#fff7ee_52%,#fff3e7_100%)]" />
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        {heroHeader ? (
                            heroHeader
                        ) : (
                            <div className="mb-5 text-center lg:mb-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-orange-700 shadow-[0_10px_26px_rgba(255,138,61,0.08)]">
                                    <Sparkles className="h-4 w-4" />
                                    {heroBadge}
                                </div>
                                <h1 className="mx-auto mt-2.5 max-w-[74rem] text-[2.85rem] font-semibold tracking-tight text-slate-900 sm:text-[3rem] sm:leading-[1.06] lg:text-[3.08rem] lg:leading-[1.02]">
                                    {heroTitleContent}
                                </h1>
                                <p className="mx-auto mt-2 max-w-[46rem] text-[15px] leading-7 text-slate-600 sm:text-[15.5px]">
                                    {heroSubtitle}
                                </p>
                            </div>
                        )}

                        <div className="rounded-[32px] border border-orange-100 bg-white/85 p-4 shadow-[0_30px_120px_rgba(234,120,45,0.14)] backdrop-blur sm:p-6 lg:p-8">
                            <div className="grid gap-5 xl:grid-cols-[1.02fr_1fr]">
                                <div className="space-y-4">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={(event) => handleReferenceUpload(event.target.files || undefined)}
                                    />

                                    <div className="rounded-[24px] border border-orange-100 bg-[#fffaf4] p-1">
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setGenerationMode("image-to-image")}
                                                className={`flex items-center justify-center gap-1.5 rounded-[16px] px-3 py-2 text-[14px] font-medium transition ${generationMode === "image-to-image"
                                                    ? "bg-[#fff0e6] text-orange-700 ring-1 ring-orange-200"
                                                    : "bg-transparent text-slate-500 hover:bg-white/75 hover:text-slate-700"
                                                    }`}
                                                aria-pressed={generationMode === "image-to-image"}
                                            >
                                                <ImagePlus className="h-4 w-4" />
                                                {locale === 'zh' ? '图生图' : 'Edit Image'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setGenerationMode("text-to-image")}
                                                className={`flex items-center justify-center gap-1.5 rounded-[16px] px-3 py-2 text-[14px] font-medium transition ${generationMode === "text-to-image"
                                                    ? "bg-[#fff0e6] text-orange-700 ring-1 ring-orange-200"
                                                    : "bg-transparent text-slate-500 hover:bg-white/75 hover:text-slate-700"
                                                    }`}
                                                aria-pressed={generationMode === "text-to-image"}
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                {locale === 'zh' ? '文生图' : 'Create Image'}
                                            </button>
                                        </div>
                                    </div>

                                    {generationMode === "image-to-image" && (
                                        <div className="rounded-[28px] border border-[#f1dcc7] bg-[#fffdfa] p-5 shadow-[0_20px_60px_rgba(235,145,71,0.08)] sm:p-6">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div>
                                                    <p className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                                        <Sparkles className="h-5 w-5 text-orange-400" />
                                                        {locale === 'zh' ? '上传参考图' : 'Upload Images'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {locale === 'zh' ? '最多 10 张，支持 JPG、PNG、WebP。' : 'Up to 10 images. JPG, PNG, and WebP are supported.'}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-[#fff3ea] px-3 py-1 text-xs font-semibold text-orange-700">
                                                    {referenceImages.length}/10
                                                </span>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploadingReference || isGenerating || referenceImages.length >= 10}
                                                    className="flex min-h-[132px] flex-col items-center justify-center rounded-[22px] border border-dashed border-orange-200 bg-white text-slate-500 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <ImagePlus className="mb-3 h-8 w-8 text-orange-500" />
                                                    <span className="text-sm font-semibold">
                                                        {locale === 'zh' ? '添加图片' : 'Add Images'}
                                                    </span>
                                                </button>

                                                {(pendingReferenceFiles.length > 0 || referenceImages.length > 0) ? (
                                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                        {[...pendingReferenceFiles.map((image) => ({
                                                            key: image.previewUrl,
                                                            src: image.previewUrl,
                                                            name: image.name,
                                                            isPending: true,
                                                        })), ...referenceImages.map((image, index) => ({
                                                            key: image.previewUrl || `${image.url}-${index}`,
                                                            src: image.previewUrl || image.url,
                                                            name: image.name,
                                                            isPending: false,
                                                        }))].map((image, index) => (
                                                            <div
                                                                key={image.key}
                                                                className="group relative aspect-square overflow-hidden rounded-[18px] border border-orange-100 bg-white"
                                                            >
                                                                <Image
                                                                    src={image.src}
                                                                    alt={image.name || `Reference image ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (index < pendingReferenceFiles.length) {
                                                                            setPendingReferenceFiles((current) => {
                                                                                const target = current[index];
                                                                                if (target) {
                                                                                    URL.revokeObjectURL(target.previewUrl);
                                                                                }
                                                                                return current.filter((_, itemIndex) => itemIndex !== index);
                                                                            });
                                                                        } else {
                                                                            const referenceIndex = index - pendingReferenceFiles.length;
                                                                            setReferenceImages((current) => {
                                                                                const target = current[referenceIndex];
                                                                                if (target?.previewUrl) {
                                                                                    URL.revokeObjectURL(target.previewUrl);
                                                                                }
                                                                                return current.filter((_, itemIndex) => itemIndex !== referenceIndex);
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow transition hover:bg-white hover:text-orange-700 group-hover:opacity-100"
                                                                    aria-label={locale === 'zh' ? '移除参考图' : 'Remove reference image'}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex min-h-[132px] items-center justify-center rounded-[22px] border border-orange-100 bg-[#fff8f1] px-5 text-center text-sm leading-6 text-slate-500">
                                                        {locale === 'zh'
                                                            ? '先把参考图拖进来，点击生成时系统会自动上传并进入图生图。'
                                                            : 'Add references first. They will upload automatically when you start editing.'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-[28px] border border-[#f1dcc7] bg-[#fffdfa] p-5 shadow-[0_20px_60px_rgba(235,145,71,0.08)] sm:p-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-[1.15rem]">
                                                <Sparkles className="h-5 w-5 text-orange-400" />
                                                {locale === 'zh' ? '描述你的想法' : 'Describe your idea'}
                                            </label>
                                            <span className="text-sm text-slate-400">{prompt.length}/20000</span>
                                        </div>

                                        <Textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            className="min-h-[126px] resize-none rounded-[22px] border-orange-200 bg-white text-base leading-7 text-slate-900 shadow-[inset_0_1px_6px_rgba(30,41,59,0.04)] placeholder:text-slate-400 focus:border-orange-300 focus:ring-orange-200 sm:min-h-[136px]"
                                            maxLength={20000}
                                        />

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {INSPIRATION_PROMPTS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setPrompt(locale === 'zh' ? item.promptZh : item.prompt)}
                                                    className="rounded-full bg-[#f5f1ea] px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-[#ffe6d8] hover:text-orange-700"
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
                                                className="inline-flex items-center gap-2 rounded-full bg-[#ffe7d9] px-3.5 py-1.5 text-[13px] font-medium text-orange-700 transition-colors hover:bg-[#ffd8c0]"
                                            >
                                                <Dices className="h-4 w-4" />
                                                {locale === 'zh' ? '随机灵感' : 'Random'}
                                            </button>
                                        </div>

                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            size="lg"
                                            className="hidden h-14 w-full rounded-[20px] bg-[#ff6b2c] text-base font-semibold text-white shadow-[0_18px_38px_rgba(255,107,44,0.32)] transition-transform hover:translate-y-[-1px] hover:bg-[#f86120] sm:flex"
                                            onClick={handlePrimaryAction}
                                            disabled={isGenerating || isUploadingReference}
                                        >
                                            {(isGenerating || isUploadingReference) ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {isUploadingReference
                                                        ? (locale === 'zh' ? '正在上传参考图...' : 'Uploading references...')
                                                        : (locale === 'zh' ? '正在生成图片...' : 'Generating image...')}
                                                </>
                                            ) : needsReferenceBeforeEdit ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <ImagePlus className="h-5 w-5" />
                                                    {locale === 'zh' ? '先上传参考图，再开始编辑' : 'Upload a reference, then start editing'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    <Wand2 className="h-5 w-5" />
                                                    {generationMode === "image-to-image"
                                                        ? (locale === 'zh' ? '开始编辑' : 'Start Editing')
                                                        : (locale === 'zh' ? '生成图片' : 'Generate Image')}
                                                </span>
                                            )}
                                        </Button>

                                        {error && (
                                            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-600">
                                                {error}
                                            </p>
                                        )}

                                    </div>

                                    <div className="rounded-[28px] border border-orange-100 bg-[#fffaf4] p-5 sm:p-6">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '画面比例' : 'Aspect Ratio'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                            {ASPECT_RATIO_OPTIONS.map((option) => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => setAspectRatio(option.id)}
                                                    className={`flex min-h-10 items-center justify-center rounded-2xl border px-2.5 py-2 text-[12px] font-semibold transition-all sm:text-[13px] ${aspectRatio === option.id
                                                        ? 'border-orange-200 bg-[#ff6b2c] text-white shadow-[0_12px_28px_rgba(255,107,44,0.22)]'
                                                        : 'border-[#ecd9c7] bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                                                        }`}
                                                >
                                                    {locale === 'zh' ? option.labelZh : option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-[28px] border border-orange-100 bg-[#fffaf4] p-5 sm:p-6">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '输出分辨率' : 'Resolution'}
                                            </p>
                                            {!canUseHighResolution && (
                                                <span className="rounded-full bg-[#fff3ea] px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                                                    {locale === 'zh' ? '免费版仅支持 1K' : 'Free plan: 1K only'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {RESOLUTION_OPTIONS.map((option) => {
                                                const isLocked = option.id !== "1K" && !canUseHighResolution;
                                                const aspectValidation = validateResolutionForAspectRatio(aspectRatio, option.id);
                                                const isAspectDisabled = !aspectValidation.valid;
                                                const isActive = resolution === option.id;

                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isAspectDisabled) {
                                                                toast({
                                                                    title: locale === 'zh' ? '当前比例不支持该分辨率' : 'This aspect ratio does not support that resolution',
                                                                    description: locale === 'zh'
                                                                        ? (aspectRatio === 'auto'
                                                                            ? '请先选择固定画面比例，再使用 2K 或 4K。'
                                                                            : '1:1 画面比例目前不支持 4K，请改用 2K 或其他比例。')
                                                                        : (aspectRatio === 'auto'
                                                                            ? 'Choose a fixed aspect ratio before using 2K or 4K.'
                                                                            : '4K is not available for 1:1 images. Please use 2K or another aspect ratio.'),
                                                                });
                                                                return;
                                                            }
                                                            handleResolutionSelect(option.id);
                                                        }}
                                                        className={`flex min-h-10 items-center justify-center rounded-2xl border px-2.5 py-2 text-[12px] font-semibold transition-all sm:text-[13px] ${isActive
                                                            ? 'border-orange-200 bg-[#ff6b2c] text-white shadow-[0_12px_28px_rgba(255,107,44,0.22)]'
                                                            : isLocked || isAspectDisabled
                                                                ? 'border-[#ecd9c7] bg-white text-slate-400 hover:border-orange-200 hover:bg-orange-50'
                                                                : 'border-[#ecd9c7] bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                                                            }`}
                                                        aria-disabled={isLocked || isAspectDisabled}
                                                    >
                                                        <span className="inline-flex items-center gap-1.5">
                                                            {option.id}
                                                            {isLocked && <span className="text-[10px] opacity-80">Pro</span>}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="mt-3 text-[12px] leading-5 text-slate-500">
                                            {canUseHighResolution
                                                ? (locale === 'zh'
                                                    ? '已解锁 2K / 4K。注意：Auto 仅支持 1K，1:1 不支持 4K。'
                                                    : '2K and 4K are unlocked. Note: Auto only supports 1K, and 1:1 does not support 4K.')
                                                : (locale === 'zh'
                                                    ? '购买任意积分包或订阅后，即可解锁 2K 和 4K；Auto 仅支持 1K，1:1 不支持 4K。'
                                                    : 'Buy any credits pack or subscription to unlock 2K and 4K. Auto only supports 1K, and 1:1 does not support 4K.')}
                                        </p>
                                    </div>

                                    {currentUser ? (
                                        <div className="flex items-center justify-between rounded-[22px] border border-orange-100 bg-[#fffaf4] px-4 py-3.5">
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
                                        <div className="rounded-[22px] border border-orange-100 bg-[#fff6ef] px-4 py-3.5 text-sm text-slate-600">
                                            <span className="font-semibold text-orange-700">{locale === 'zh' ? '免费试用：' : 'Free trial:'}</span>{' '}
                                            {locale === 'zh' ? '新用户可先体验 3 次生成。' : 'New users can try 3 generations first.'}
                                        </div>
                                    )}

                                </div>

                                <div className="rounded-[28px] border border-orange-100 bg-[#fffdf9] p-4 shadow-[0_20px_60px_rgba(235,145,71,0.08)] sm:p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {locale === 'zh' ? '预览' : 'Preview'}
                                            </p>
                                            <h3 className="mt-1 text-[1.55rem] font-semibold leading-tight text-slate-900">
                                                {locale === 'zh' ? '生成结果会显示在这里' : 'Generated image will appear here'}
                                            </h3>
                                        </div>
                                        <div className="whitespace-nowrap rounded-full bg-[#fff3ea] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600 sm:px-3.5 sm:text-[11px]">
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
                                                    setPrompt(generationMode === "image-to-image" ? defaultEditPrompt : defaultPrompt);
                                                }}
                                            >
                                                {locale === 'zh' ? '重新开始' : 'Start Over'}
                                            </Button>
                                        </div>
                                    ) : (isGenerating || isUploadingReference) ? (
                                        <div className="flex min-h-[500px] flex-col justify-center rounded-[24px] border border-dashed border-orange-200 bg-[linear-gradient(180deg,#fff7ef_0%,#fffdfb_100%)] p-6 text-center">
                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(235,145,71,0.18)]">
                                                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                                            </div>
                                            <h4 className="mt-6 text-[1.7rem] font-semibold leading-tight text-slate-900">
                                                {isUploadingReference
                                                    ? (locale === 'zh' ? '正在上传参考图...' : 'Uploading reference images...')
                                                    : (locale === 'zh' ? '正在生成图片...' : 'Generating your image...')}
                                            </h4>
                                            <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-slate-500">
                                                {isUploadingReference
                                                    ? (locale === 'zh'
                                                        ? '上传完成后会自动继续图生图，无需重复点击。'
                                                        : 'The editor will continue automatically once the references finish uploading.')
                                                    : (locale === 'zh'
                                                        ? '结果出来后会直接显示在这里，你可以继续预览和下载。'
                                                        : 'Your result will appear here as soon as it is ready for preview and download.')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[500px] flex-col justify-center rounded-[24px] border border-dashed border-orange-200 bg-[linear-gradient(180deg,#fff7ef_0%,#fffdfb_100%)] p-4 text-center">
                                            <div className="relative mx-auto w-full max-w-[540px]">
                                                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_24px_54px_rgba(235,145,71,0.16)]">
                                                    <Image
                                                        src={activeSample.src}
                                                        alt={locale === 'zh' ? activeSample.promptZh : activeSample.prompt}
                                                        fill
                                                        className="object-cover"
                                                        priority
                                                    />
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
                                            <div className="mt-6">
                                                <h4 className="text-[1.7rem] font-semibold leading-tight text-slate-900">
                                                    {locale === 'zh' ? '先看看示例效果，再开始生成你的画面' : 'Browse a few example outputs before creating your own'}
                                                </h4>
                                                <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-slate-500">
                                                    {locale === 'zh'
                                                        ? '你生成成功后，这里会自动切换成你的结果轮播，方便连续预览和下载。'
                                                        : 'Once your images are ready, this preview area automatically switches to your own result carousel.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/90 px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_36px_rgba(234,120,45,0.14)] backdrop-blur sm:hidden">
                <Button
                    size="lg"
                    className="h-[3.25rem] w-full rounded-[18px] bg-[#ff6b2c] text-[15px] font-semibold text-white shadow-[0_16px_34px_rgba(255,107,44,0.28)] hover:bg-[#f86120]"
                    onClick={handlePrimaryAction}
                    disabled={isGenerating || isUploadingReference}
                >
                    {(isGenerating || isUploadingReference) ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isUploadingReference
                                ? (locale === 'zh' ? '正在上传参考图...' : 'Uploading references...')
                                : (locale === 'zh' ? '正在生成图片...' : 'Generating image...')}
                        </>
                    ) : needsReferenceBeforeEdit ? (
                        <span className="inline-flex items-center gap-2">
                            <ImagePlus className="h-5 w-5" />
                            {locale === 'zh' ? '先上传参考图，再开始编辑' : 'Upload a reference, then start editing'}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <Wand2 className="h-5 w-5" />
                            {generationMode === "image-to-image"
                                ? (locale === 'zh' ? '开始编辑' : 'Start Editing')
                                : (locale === 'zh' ? '生成图片' : 'Generate Image')}
                        </span>
                    )}
                </Button>
            </div>

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
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleUseSamplePrompt(locale === 'zh' ? item.promptZh : item.prompt)}
                                                className="inline-flex items-center rounded-full bg-[#ff6b2c] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#f86120]"
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                {locale === 'zh' ? '复制并试玩' : 'Copy & Try'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveSampleIndex(index)}
                                                className="inline-flex items-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50"
                                            >
                                                {locale === 'zh' ? '在右侧预览' : 'Preview on the right'}
                                            </button>
                                        </div>
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
