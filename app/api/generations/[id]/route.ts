import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getGenerationForUser,
  getGenerationImages,
  syncGenerationFromProvider,
  type GenerationRecord,
} from "@/utils/ai/generations";

export const runtime = "nodejs";
export const maxDuration = 30;

function serializeGeneration(generation: GenerationRecord) {
  return {
    id: generation.id,
    status: generation.status || "pending",
    prompt: generation.prompt,
    imageUrl: generation.image_url,
    images: getGenerationImages(generation),
    error: generation.error_message,
    refunded: Boolean(generation.refunded_at),
    createdAt: generation.created_at,
    updatedAt: generation.updated_at,
    completedAt: generation.completed_at,
    metadata: {
      mode: generation.metadata?.mode || "text-to-image",
      resolution: generation.metadata?.resolution || "1K",
      aspect_ratio: generation.metadata?.aspect_ratio || "auto",
      provider: generation.provider || generation.metadata?.provider || null,
    },
    revisedPrompt: generation.metadata?.optimized_prompt || null,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    let generation = await getGenerationForUser(id, user.id);
    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    let resolvedGeneration = generation;

    const shouldSyncFromProvider =
      resolvedGeneration.provider === "kie" &&
      Boolean(resolvedGeneration.provider_task_id) &&
      (
        resolvedGeneration.status === "pending" ||
        resolvedGeneration.status === "processing" ||
        (resolvedGeneration.status === "failed" && !resolvedGeneration.refunded_at) ||
        (resolvedGeneration.status === "succeeded" && !resolvedGeneration.metadata?.stored_locally)
      );

    if (shouldSyncFromProvider) {
      try {
        resolvedGeneration = await syncGenerationFromProvider({
          generation: resolvedGeneration,
          persistenceTimeoutMs: resolvedGeneration.status === "succeeded" ? 15000 : 12000,
        });
      } catch (error) {
        console.error("Failed to sync generation status from provider:", error);
      }
    }

    return NextResponse.json({
      success: true,
      generation: serializeGeneration(resolvedGeneration),
    });
  } catch (error: any) {
    console.error("Generation status route error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error", code: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
