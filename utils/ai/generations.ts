import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getKieTaskDetails, parseKieResultUrls, type KieTaskRecord } from "@/utils/ai/kie";
import { persistGeneratedImagesToStorage } from "@/utils/ai/generated-image-storage";

export type GenerationStatus = "pending" | "processing" | "succeeded" | "failed";

export type GenerationRecord = {
  id: string;
  user_id: string;
  prompt: string | null;
  model_id: string | null;
  image_url: string | null;
  input_image_url: string | null;
  status: string | null;
  credits_cost: number | null;
  metadata: Record<string, any> | null;
  provider: string | null;
  provider_task_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  refunded_at: string | null;
};

const GENERATION_SELECT =
  "id,user_id,prompt,model_id,image_url,input_image_url,status,credits_cost,metadata,provider,provider_task_id,error_message,created_at,updated_at,completed_at,refunded_at";

function mergeMetadata(
  current: Record<string, any> | null | undefined,
  next: Record<string, any> | null | undefined
) {
  return {
    ...(current || {}),
    ...(next || {}),
  };
}

function getCompletionIso(providerRecord: KieTaskRecord) {
  const timeValue = providerRecord.completeTime || providerRecord.updateTime || Date.now();
  return new Date(timeValue).toISOString();
}

export function getGenerationImages(generation: Pick<GenerationRecord, "image_url" | "metadata">) {
  const metadata = generation.metadata || {};
  if (Array.isArray(metadata.stored_result_urls) && metadata.stored_result_urls.length > 0) {
    return metadata.stored_result_urls.filter(Boolean);
  }
  if (Array.isArray(metadata.result_urls) && metadata.result_urls.length > 0) {
    return metadata.result_urls.filter(Boolean);
  }
  return generation.image_url ? [generation.image_url] : [];
}

export async function createPendingGeneration({
  userId,
  prompt,
  modelId,
  inputImageUrl,
  creditsCost,
  provider,
  metadata,
}: {
  userId: string;
  prompt: string;
  modelId: string;
  inputImageUrl: string | null;
  creditsCost: number;
  provider: string;
  metadata: Record<string, any>;
}) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("generations")
    .insert({
      user_id: userId,
      prompt,
      model_id: modelId,
      input_image_url: inputImageUrl,
      status: "pending",
      credits_cost: creditsCost,
      provider,
      metadata,
    })
    .select(GENERATION_SELECT)
    .single();

  if (error || !data) {
    throw error || new Error("Failed to create generation record");
  }

  return data as GenerationRecord;
}

export async function getGenerationForUser(generationId: string, userId: string) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("generations")
    .select(GENERATION_SELECT)
    .eq("id", generationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as GenerationRecord;
}

export async function getGenerationById(generationId: string) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("generations")
    .select(GENERATION_SELECT)
    .eq("id", generationId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as GenerationRecord;
}

export async function getGenerationByProviderTaskId(taskId: string) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("generations")
    .select(GENERATION_SELECT)
    .eq("provider_task_id", taskId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as GenerationRecord;
}

export async function updateGeneration(generationId: string, patch: Record<string, any>) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("generations")
    .update(patch)
    .eq("id", generationId)
    .select(GENERATION_SELECT)
    .single();

  if (error || !data) {
    throw error || new Error("Failed to update generation");
  }

  return data as GenerationRecord;
}

export async function markGenerationTaskSubmitted({
  generation,
  taskId,
  providerModel,
  metadata,
}: {
  generation: GenerationRecord;
  taskId: string;
  providerModel: string;
  metadata?: Record<string, any>;
}) {
  return await updateGeneration(generation.id, {
    status: "processing",
    provider_task_id: taskId,
    model_id: providerModel,
    metadata: mergeMetadata(generation.metadata, metadata),
    error_message: null,
  });
}

export async function refundGenerationCreditsIfNeeded({
  generationId,
  reason,
  metadata,
}: {
  generationId: string;
  reason: string;
  metadata?: Record<string, any>;
}) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.rpc("refund_generation_credits", {
    p_generation_id: generationId,
    p_description: reason,
    p_metadata: metadata || {},
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function markGenerationFailed({
  generation,
  errorMessage,
  metadata,
  refundReason,
}: {
  generation: GenerationRecord;
  errorMessage: string;
  metadata?: Record<string, any>;
  refundReason?: string;
}) {
  const failedGeneration = await updateGeneration(generation.id, {
    status: "failed",
    error_message: errorMessage,
    completed_at: generation.completed_at || new Date().toISOString(),
    metadata: mergeMetadata(generation.metadata, metadata),
  });

  await refundGenerationCreditsIfNeeded({
    generationId: generation.id,
    reason: refundReason || "Refund: GPT Image 2 Generation Failed",
    metadata: {
      reason: errorMessage,
      ...(metadata || {}),
    },
  });

  const refreshedGeneration = await getGenerationById(failedGeneration.id);
  if (!refreshedGeneration) {
    throw new Error("Failed to reload generation after marking it as failed");
  }

  return refreshedGeneration;
}

async function tryPersistGenerationImages({
  generation,
  imageUrls,
  timeoutMs,
}: {
  generation: GenerationRecord;
  imageUrls: string[];
  timeoutMs?: number;
}) {
  try {
    const storedUrls = await persistGeneratedImagesToStorage({
      generationId: generation.id,
      imageUrls,
      timeoutMs,
    });

    return {
      imageUrls: storedUrls,
      storedLocally: true,
    };
  } catch (error) {
    console.error("Failed to persist generated images locally:", error);
    return {
      imageUrls,
      storedLocally: false,
    };
  }
}

export async function syncGenerationWithKieTask({
  generation,
  providerRecord,
  persistenceTimeoutMs,
}: {
  generation: GenerationRecord;
  providerRecord: KieTaskRecord;
  persistenceTimeoutMs?: number;
}) {
  const providerState = providerRecord.state;

  if (generation.status === "failed" && generation.refunded_at) {
    return generation;
  }

  if (generation.status === "succeeded" && providerState && providerState !== "success") {
    return generation;
  }

  if (!providerState || providerState === "waiting" || providerState === "queuing" || providerState === "generating") {
    if (generation.status === "processing" || generation.status === "pending") {
      return await updateGeneration(generation.id, {
        status: "processing",
        metadata: mergeMetadata(generation.metadata, {
          provider_state: providerState || "processing",
          provider_update_time: providerRecord.updateTime || null,
        }),
      });
    }

    return generation;
  }

  if (providerState === "fail") {
    if (generation.status === "failed" && generation.refunded_at) {
      return generation;
    }

    return await markGenerationFailed({
      generation,
      errorMessage: providerRecord.failMsg || providerRecord.failCode || "Kie generation failed",
      metadata: {
        provider_state: providerState,
        provider_fail_code: providerRecord.failCode || null,
        provider_fail_message: providerRecord.failMsg || null,
        provider_update_time: providerRecord.updateTime || null,
        provider_complete_time: providerRecord.completeTime || null,
      },
      refundReason: "Refund: Kie generation failed",
    });
  }

  if (providerState === "success") {
    const providerImageUrls = parseKieResultUrls(providerRecord.resultJson);
    if (providerImageUrls.length === 0) {
      return await markGenerationFailed({
        generation,
        errorMessage: "Kie task succeeded but returned no images",
        metadata: {
          provider_state: providerState,
          provider_update_time: providerRecord.updateTime || null,
          provider_complete_time: providerRecord.completeTime || null,
        },
        refundReason: "Refund: Kie generation returned no images",
      });
    }

    const alreadyStoredLocally = Boolean(generation.metadata?.stored_locally);
    const persisted = alreadyStoredLocally
      ? {
          imageUrls: getGenerationImages(generation),
          storedLocally: true,
        }
      : await tryPersistGenerationImages({
          generation,
          imageUrls: providerImageUrls,
          timeoutMs: persistenceTimeoutMs,
        });

    return await updateGeneration(generation.id, {
      status: "succeeded",
      image_url: persisted.imageUrls[0] || providerImageUrls[0],
      error_message: null,
      completed_at: generation.completed_at || getCompletionIso(providerRecord),
      metadata: mergeMetadata(generation.metadata, {
        provider_state: providerState,
        provider_fail_code: null,
        provider_fail_message: null,
        provider_update_time: providerRecord.updateTime || null,
        provider_complete_time: providerRecord.completeTime || null,
        result_urls: providerImageUrls,
        stored_result_urls: persisted.imageUrls,
        stored_locally: persisted.storedLocally,
      }),
    });
  }

  return generation;
}

export async function syncGenerationFromProvider({
  generation,
  persistenceTimeoutMs,
}: {
  generation: GenerationRecord;
  persistenceTimeoutMs?: number;
}) {
  if (generation.provider !== "kie" || !generation.provider_task_id) {
    return generation;
  }

  const providerRecord = await getKieTaskDetails(generation.provider_task_id);
  return await syncGenerationWithKieTask({
    generation,
    providerRecord,
    persistenceTimeoutMs,
  });
}
