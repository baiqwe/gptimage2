import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CREDITS_PER_GENERATION } from "@/config/pricing";
import {
    COUNT_OPTIONS,
    GPT_IMAGE_MODEL,
    resolveSizePreset,
} from "@/config/gpt-image";

// Use Node.js runtime for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute timeout

const KIE_API_BASE_URL = process.env.KIE_API_BASE_URL || "https://api.kie.ai";
const KIE_GPT_IMAGE_MODEL = "gpt-image-2-text-to-image";
const KIE_POLL_INTERVAL_MS = 2500;
const KIE_POLL_TIMEOUT_MS = 45000;

type SupportedQuality = "auto" | "low" | "medium" | "high";
type SupportedFormat = "png" | "jpeg" | "webp";

interface KieCreateTaskResponse {
    code: number;
    msg: string;
    data?: {
        taskId?: string;
    };
}

interface KieTaskRecordResponse {
    code: number;
    msg: string;
    data?: {
        taskId?: string;
        model?: string;
        state?: "waiting" | "queuing" | "generating" | "success" | "fail";
        resultJson?: string;
        failCode?: string;
        failMsg?: string;
    };
}

function optimizePrompt(prompt: string, locale: "zh" | "en") {
    if (locale === "zh") {
        return `${prompt.trim()}，主体清晰，构图完整，光线层次自然，材质细节丰富，画面干净，整体质感高级。`;
    }

    return `${prompt.trim()}, clear focal subject, cohesive composition, natural layered lighting, refined material detail, clean background separation, premium visual polish.`;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseKieResultUrls(resultJson?: string | null): string[] {
    if (!resultJson) return [];

    try {
        const parsed = JSON.parse(resultJson);
        if (Array.isArray(parsed?.resultUrls)) {
            return parsed.resultUrls.filter(Boolean);
        }
        if (typeof parsed?.resultUrl === "string") {
            return [parsed.resultUrl];
        }
        if (Array.isArray(parsed?.images)) {
            return parsed.images.filter(Boolean);
        }
    } catch (error) {
        console.error("Failed to parse Kie resultJson:", error);
    }

    return [];
}

async function generateWithKie({
    prompt,
    sizePreset,
    quality,
    outputFormat,
}: {
    prompt: string;
    sizePreset: string;
    quality: SupportedQuality;
    outputFormat: SupportedFormat;
}) {
    const createTaskUrl = `${KIE_API_BASE_URL}/api/v1/jobs/createTask`;
    const recordInfoBaseUrl = `${KIE_API_BASE_URL}/api/v1/jobs/recordInfo`;

    const createResponse = await fetch(createTaskUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
        },
        body: JSON.stringify({
            model: KIE_GPT_IMAGE_MODEL,
            input: {
                prompt,
                nsfw_checker: false,
            },
        }),
    });

    const createData = await createResponse.json() as KieCreateTaskResponse;
    if (!createResponse.ok || createData.code !== 200 || !createData.data?.taskId) {
        throw new Error(createData?.msg || `Kie task creation failed: ${createResponse.status}`);
    }

    const taskId = createData.data.taskId;
    const startedAt = Date.now();

    while (Date.now() - startedAt < KIE_POLL_TIMEOUT_MS) {
        await sleep(KIE_POLL_INTERVAL_MS);

        const recordInfoUrl = `${recordInfoBaseUrl}?taskId=${encodeURIComponent(taskId)}`;
        const recordResponse = await fetch(recordInfoUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
            },
            cache: "no-store",
        });

        const recordData = await recordResponse.json() as KieTaskRecordResponse;
        if (!recordResponse.ok || recordData.code !== 200) {
            throw new Error(recordData?.msg || `Kie task query failed: ${recordResponse.status}`);
        }

        const state = recordData.data?.state;
        if (state === "success") {
            const images = parseKieResultUrls(recordData.data?.resultJson);
            if (images.length === 0) {
                throw new Error("Kie task succeeded but returned no images");
            }

            return {
                provider: "kie" as const,
                taskId,
                model: KIE_GPT_IMAGE_MODEL,
                images,
                metadata: {
                    provider: "kie",
                    provider_model: KIE_GPT_IMAGE_MODEL,
                    provider_task_id: taskId,
                    size_preset: sizePreset,
                    quality,
                    output_format: outputFormat,
                },
            };
        }

        if (state === "fail") {
            throw new Error(recordData.data?.failMsg || recordData.data?.failCode || "Kie generation failed");
        }
    }

    throw new Error("Kie generation timed out while waiting for task completion");
}

async function generateWithOpenAI({
    prompt,
    sizePreset,
    quality,
    outputFormat,
    count,
}: {
    prompt: string;
    sizePreset: string;
    quality: SupportedQuality;
    outputFormat: SupportedFormat;
    count: number;
}) {
    const selectedSizePreset = resolveSizePreset(sizePreset);
    const openaiApiUrl = `${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/images/generations`;
    const outputCompression = outputFormat === "png" ? undefined : 90;

    const response = await fetch(openaiApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: GPT_IMAGE_MODEL,
            prompt,
            size: selectedSizePreset.size,
            quality,
            output_format: outputFormat,
            n: count,
            background: "auto",
            moderation: "auto",
            ...(typeof outputCompression === "number"
                ? { output_compression: outputCompression }
                : {}),
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("OpenAI Images Error:", response.status, data);
        throw new Error(data?.error?.message || `OpenAI API error: ${response.status}`);
    }

    const images = (data?.data || [])
        .map((item: { b64_json?: string }) => item?.b64_json)
        .filter(Boolean)
        .map((b64: string) => `data:image/${outputFormat};base64,${b64}`);

    if (images.length === 0) {
        throw new Error("OpenAI did not return any images");
    }

    return {
        provider: "openai" as const,
        images,
        model: GPT_IMAGE_MODEL,
        metadata: {
            provider: "openai",
            provider_model: GPT_IMAGE_MODEL,
            size_preset: sizePreset,
            size: selectedSizePreset.size,
            quality,
            output_format: outputFormat,
            count,
        },
    };
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const {
            prompt,
            size_preset = "square",
            quality = "auto",
            output_format = "png",
            count = 1,
            prompt_optimization = false,
        } = await request.json();

        // 1. Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({
                error: "Please sign in first",
                code: "UNAUTHORIZED"
            }, { status: 401 });
        }

        // 2. Input Validation
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({
                error: "Please enter a prompt",
                code: "MISSING_PROMPT"
            }, { status: 400 });
        }

        if (prompt.length > 32000) {
            return NextResponse.json({
                error: "Prompt too long (max 32000 characters)",
                code: "PROMPT_TOO_LONG"
            }, { status: 400 });
        }

        if (!COUNT_OPTIONS.includes(count)) {
            return NextResponse.json({
                error: "Unsupported image count",
                code: "INVALID_COUNT",
            }, { status: 400 });
        }

        const allowedQualities = new Set(["auto", "low", "medium", "high"]);
        if (!allowedQualities.has(quality)) {
            return NextResponse.json({
                error: "Unsupported quality option",
                code: "INVALID_QUALITY",
            }, { status: 400 });
        }

        const allowedFormats = new Set(["png", "jpeg", "webp"]);
        if (!allowedFormats.has(output_format)) {
            return NextResponse.json({
                error: "Unsupported output format",
                code: "INVALID_OUTPUT_FORMAT",
            }, { status: 400 });
        }

        const provider = process.env.KIE_API_KEY ? "kie" : process.env.OPENAI_API_KEY ? "openai" : null;
        if (!provider) {
            console.error("No image provider is configured");
            return NextResponse.json({
                error: "Service configuration error",
                code: "CONFIG_ERROR"
            }, { status: 500 });
        }

        const creditsRequired = CREDITS_PER_GENERATION * count;

        // 3. Deduct Credits
        const { data: deductSuccess, error: rpcError } = await supabase.rpc('decrease_credits', {
            p_user_id: user.id,
            p_amount: creditsRequired,
            p_description: `GPT Image 2 Generation (${count} image${count > 1 ? "s" : ""})`
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({
                error: "System busy, please retry",
                code: "SYSTEM_ERROR"
            }, { status: 500 });
        }

        if (!deductSuccess) {
            return NextResponse.json({
                error: "Insufficient credits, please top up",
                code: "INSUFFICIENT_CREDITS",
                required: creditsRequired
            }, { status: 402 });
        }

        const trimmedPrompt = prompt.trim();
        const locale = /[\u4e00-\u9fff]/.test(trimmedPrompt) ? "zh" : "en";
        const finalPrompt = prompt_optimization
            ? optimizePrompt(trimmedPrompt, locale)
            : trimmedPrompt;

        try {
            console.log("=== GPT Image 2 Generation ===");
            console.log("Provider:", provider);
            console.log("Original Prompt:", prompt);
            console.log("Final Prompt:", finalPrompt);
            console.log("Prompt Optimization:", prompt_optimization);
            console.log("Size Preset:", size_preset);
            console.log("Quality:", quality);
            console.log("Output Format:", output_format);
            console.log("Count:", count);

            const generationResult = provider === "kie"
                ? await generateWithKie({
                    prompt: finalPrompt,
                    sizePreset: size_preset,
                    quality,
                    outputFormat: output_format,
                })
                : await generateWithOpenAI({
                    prompt: finalPrompt,
                    sizePreset: size_preset,
                    quality,
                    outputFormat: output_format,
                    count,
                });

            // 6. Log Generation
            await supabase.from("generations").insert({
                user_id: user.id,
                prompt: trimmedPrompt,
                model_id: generationResult.model,
                image_url: generationResult.images[0],
                input_image_url: null,
                status: "succeeded",
                credits_cost: creditsRequired,
                metadata: {
                    ...generationResult.metadata,
                    prompt_optimization,
                    optimized_prompt: prompt_optimization ? finalPrompt : null,
                    image_count: generationResult.images.length,
                }
            });

            return NextResponse.json({
                url: generationResult.images[0],
                images: generationResult.images,
                success: true,
                provider,
                revisedPrompt: prompt_optimization ? finalPrompt : null,
            });

        } catch (aiError: any) {
            console.error("GPT Image 2 Service Error:", aiError);

            // Refund credits on failure
            await supabase.rpc('decrease_credits', {
                p_user_id: user.id,
                p_amount: -creditsRequired,
                p_description: 'Refund: GPT Image 2 Generation Failed'
            });

            return NextResponse.json({
                error: "Generation failed, credits refunded",
                code: "AI_FAILED",
                refunded: true,
                details: aiError?.message || "Unknown error"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Route Error:", error);
        return NextResponse.json(
            { error: error.message || "Server error", code: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
