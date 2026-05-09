import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCreditsRequired } from "@/config/pricing";
import {
    COUNT_OPTIONS,
    GPT_IMAGE_MODEL,
    isHighResolutionUnlocked,
    resolveAspectRatio,
    resolveOpenAISize,
    resolveResolution,
    validateResolutionForAspectRatio,
} from "@/config/gpt-image";
import {
    KIE_IMAGE_TO_IMAGE_MODEL,
    KIE_TEXT_TO_IMAGE_MODEL,
    createKieTask,
} from "@/utils/ai/kie";
import {
    createPendingGeneration,
    markGenerationFailed,
    markGenerationTaskSubmitted,
} from "@/utils/ai/generations";

// Use Node.js runtime for Vercel
export const runtime = 'nodejs';
export const maxDuration = 180;

function optimizePrompt(prompt: string, locale: "zh" | "en") {
    if (locale === "zh") {
        return `${prompt.trim()}，主体清晰，构图完整，光线层次自然，材质细节丰富，画面干净，整体质感高级。`;
    }

    return `${prompt.trim()}, clear focal subject, cohesive composition, natural layered lighting, refined material detail, clean background separation, premium visual polish.`;
}

async function generateWithOpenAI({
    prompt,
    aspectRatio,
    count,
}: {
    prompt: string;
    aspectRatio: string;
    count: number;
}) {
    const selectedSize = resolveOpenAISize(aspectRatio);
    const openaiApiUrl = `${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/images/generations`;

    const response = await fetch(openaiApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: GPT_IMAGE_MODEL,
            prompt,
            size: selectedSize,
            quality: "auto",
            output_format: "png",
            n: count,
            background: "auto",
            moderation: "auto",
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
        .map((b64: string) => `data:image/png;base64,${b64}`);

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
            aspect_ratio: resolveAspectRatio(aspectRatio),
            size: selectedSize,
            output_format: "png",
            count,
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            prompt,
            aspect_ratio,
            size_preset,
            resolution = "1K",
            count = 1,
            prompt_optimization = false,
            input_urls = [],
        } = await request.json();
        const requestedAspectRatio = resolveAspectRatio(aspect_ratio ?? size_preset ?? "auto");
        const requestedResolution = resolveResolution(resolution);

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

        if (prompt.length > 20000) {
            return NextResponse.json({
                error: "Prompt too long (max 20000 characters)",
                code: "PROMPT_TOO_LONG"
            }, { status: 400 });
        }

        if (!COUNT_OPTIONS.includes(count)) {
            return NextResponse.json({
                error: "Unsupported image count",
                code: "INVALID_COUNT",
            }, { status: 400 });
        }

        const validatedInputUrls = Array.isArray(input_urls)
            ? input_urls.filter((url) => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, 10)
            : [];

        const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("user_id", user.id)
            .single();

        const hasPaidAccess = isHighResolutionUnlocked(customer);

        if (requestedResolution !== "1K" && !hasPaidAccess) {
            return NextResponse.json({
                error: "2K and 4K output unlock after any paid credits package or subscription",
                code: "RESOLUTION_UPGRADE_REQUIRED",
                required_purchase: true,
                resolution: requestedResolution,
            }, { status: 402 });
        }

        const resolutionValidation = validateResolutionForAspectRatio(
            requestedAspectRatio,
            requestedResolution
        );

        if (!resolutionValidation.valid) {
            return NextResponse.json({
                error: resolutionValidation.message,
                code: resolutionValidation.code,
                resolution: requestedResolution,
                aspect_ratio: requestedAspectRatio,
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

        if (provider !== "kie" && validatedInputUrls.length > 0) {
            return NextResponse.json({
                error: "Image-to-image generation requires Kie.ai configuration",
                code: "IMAGE_TO_IMAGE_PROVIDER_UNAVAILABLE",
            }, { status: 400 });
        }

        if (provider !== "kie" && requestedResolution !== "1K") {
            return NextResponse.json({
                error: "Selected resolution requires Kie.ai configuration",
                code: "RESOLUTION_PROVIDER_UNAVAILABLE",
            }, { status: 400 });
        }

        const creditsRequired = getCreditsRequired(requestedResolution, count);

        // 3. Deduct Credits
        const { data: deductSuccess, error: rpcError } = await supabase.rpc('decrease_credits', {
            p_user_id: user.id,
            p_amount: creditsRequired,
            p_description: `GPT Image 2 Generation (${requestedResolution}, ${count} image${count > 1 ? "s" : ""})`
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
            console.log("Aspect Ratio:", requestedAspectRatio);
            console.log("Resolution:", requestedResolution);
            console.log("Input URLs:", validatedInputUrls.length);
            console.log("Count:", count);

            if (provider === "kie") {
                let generation = null;

                try {
                    const requestedMode = validatedInputUrls.length > 0 ? "image-to-image" : "text-to-image";
                    const requestedModel = requestedMode === "image-to-image"
                        ? KIE_IMAGE_TO_IMAGE_MODEL
                        : KIE_TEXT_TO_IMAGE_MODEL;

                    generation = await createPendingGeneration({
                        userId: user.id,
                        prompt: trimmedPrompt,
                        modelId: requestedModel,
                        inputImageUrl: validatedInputUrls[0] || null,
                        creditsCost: creditsRequired,
                        provider: "kie",
                        metadata: {
                            provider: "kie",
                            provider_model: requestedModel,
                            mode: requestedMode,
                            aspect_ratio: requestedAspectRatio,
                            resolution: requestedResolution,
                            input_urls: requestedMode === "image-to-image" ? validatedInputUrls : null,
                            prompt_optimization,
                            optimized_prompt: prompt_optimization ? finalPrompt : null,
                            image_count_requested: count,
                            submitted_at: new Date().toISOString(),
                        },
                    });

                    const task = await createKieTask({
                        prompt: finalPrompt,
                        aspectRatio: requestedAspectRatio,
                        resolution: requestedResolution,
                        inputUrls: validatedInputUrls,
                        generationId: generation.id,
                    });

                    const submittedGeneration = await markGenerationTaskSubmitted({
                        generation,
                        taskId: task.taskId,
                        providerModel: task.model,
                        metadata: {
                            ...task.metadata,
                            provider_task_id: task.taskId,
                            submitted_at: new Date().toISOString(),
                        },
                    });

                    return NextResponse.json({
                        success: true,
                        queued: true,
                        generationId: submittedGeneration.id,
                        status: submittedGeneration.status,
                        provider,
                        revisedPrompt: prompt_optimization ? finalPrompt : null,
                        pollAfterMs: 2500,
                    });
                } catch (aiError: any) {
                    if (generation) {
                        await markGenerationFailed({
                            generation,
                            errorMessage: aiError?.message || "Kie generation submission failed",
                            metadata: {
                                provider_state: "submission_failed",
                            },
                            refundReason: "Refund: GPT Image 2 Generation Failed",
                        });
                    } else {
                        await supabase.rpc('decrease_credits', {
                            p_user_id: user.id,
                            p_amount: -creditsRequired,
                            p_description: 'Refund: GPT Image 2 Generation Failed'
                        });
                    }

                    throw aiError;
                }
            }

            const generationResult = await generateWithOpenAI({
                    prompt: finalPrompt,
                    aspectRatio: requestedAspectRatio,
                    count,
                });

            // 6. Log Generation
            await supabase.from("generations").insert({
                user_id: user.id,
                prompt: trimmedPrompt,
                model_id: generationResult.model,
                image_url: generationResult.images[0],
                input_image_url: validatedInputUrls[0] || null,
                status: "succeeded",
                credits_cost: creditsRequired,
                metadata: {
                    ...generationResult.metadata,
                    prompt_optimization,
                    optimized_prompt: prompt_optimization ? finalPrompt : null,
                    image_count: generationResult.images.length,
                    resolution: requestedResolution,
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

            if (provider !== "kie") {
                await supabase.rpc('decrease_credits', {
                    p_user_id: user.id,
                    p_amount: -creditsRequired,
                    p_description: 'Refund: GPT Image 2 Generation Failed'
                });
            }

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
