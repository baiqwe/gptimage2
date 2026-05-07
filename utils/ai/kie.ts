import { createHmac, timingSafeEqual } from "node:crypto";
import { resolveAspectRatio, resolveResolution } from "@/config/gpt-image";
import { siteConfig } from "@/config/site";

export const KIE_API_BASE_URL = process.env.KIE_API_BASE_URL || "https://api.kie.ai";
export const KIE_TEXT_TO_IMAGE_MODEL = "gpt-image-2-text-to-image";
export const KIE_IMAGE_TO_IMAGE_MODEL = "gpt-image-2-image-to-image";

const KIE_MAX_RETRY_ATTEMPTS = 3;
const KIE_RETRYABLE_ERROR_PATTERNS = [
  "Internal Error, Please try again later.",
  "internal error",
  "server error",
  "please try again later",
] as const;

export type KieTaskState = "waiting" | "queuing" | "generating" | "success" | "fail";

export interface KieCreateTaskResponse {
  code: number;
  msg: string;
  data?: {
    taskId?: string;
  };
}

export interface KieTaskRecord {
  taskId?: string;
  model?: string;
  state?: KieTaskState;
  resultJson?: string;
  failCode?: string;
  failMsg?: string;
  costTime?: number;
  completeTime?: number;
  createTime?: number;
  updateTime?: number;
  param?: string;
}

export interface KieTaskRecordResponse {
  code: number;
  msg: string;
  data?: KieTaskRecord;
}

export function parseKieResultUrls(resultJson?: string | null): string[] {
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

function isRetryableKieError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const normalized = message.toLowerCase();
  return KIE_RETRYABLE_ERROR_PATTERNS.some((pattern) =>
    normalized.includes(pattern.toLowerCase())
  );
}

function getKieCallbackBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || siteConfig.url).replace(/\/$/, "");
}

export function getKieCallbackUrl(generationId: string) {
  return `${getKieCallbackBaseUrl()}/api/webhooks/kie?generationId=${encodeURIComponent(generationId)}`;
}

export async function createKieTask({
  prompt,
  aspectRatio,
  resolution,
  inputUrls,
  generationId,
}: {
  prompt: string;
  aspectRatio: string;
  resolution: string;
  inputUrls?: string[];
  generationId: string;
}) {
  if (!process.env.KIE_API_KEY) {
    throw new Error("KIE_API_KEY is not configured");
  }

  const hasInputImage = Array.isArray(inputUrls) && inputUrls.length > 0;
  const model = hasInputImage ? KIE_IMAGE_TO_IMAGE_MODEL : KIE_TEXT_TO_IMAGE_MODEL;
  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: resolveAspectRatio(aspectRatio),
    resolution: resolveResolution(resolution),
    nsfw_checker: false,
  };

  if (hasInputImage) {
    input.input_urls = inputUrls;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= KIE_MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const createResponse = await fetch(`${KIE_API_BASE_URL}/api/v1/jobs/createTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          callBackUrl: getKieCallbackUrl(generationId),
          input,
        }),
      });

      const createData = (await createResponse.json()) as KieCreateTaskResponse;
      if (!createResponse.ok || createData.code !== 200 || !createData.data?.taskId) {
        throw new Error(createData?.msg || `Kie task creation failed: ${createResponse.status}`);
      }

      return {
        taskId: createData.data.taskId,
        model,
        mode: hasInputImage ? "image-to-image" as const : "text-to-image" as const,
        metadata: {
          provider: "kie",
          provider_model: model,
          mode: hasInputImage ? "image-to-image" : "text-to-image",
          aspect_ratio: input.aspect_ratio,
          resolution: input.resolution,
          input_urls: hasInputImage ? inputUrls : null,
          nsfw_checker: false,
          callback_url: getKieCallbackUrl(generationId),
        },
      };
    } catch (error) {
      lastError = error;

      if (!isRetryableKieError(error) || attempt === KIE_MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Kie task creation failed");
}

export async function getKieTaskDetails(taskId: string) {
  if (!process.env.KIE_API_KEY) {
    throw new Error("KIE_API_KEY is not configured");
  }

  const response = await fetch(
    `${KIE_API_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.KIE_API_KEY}`,
      },
      cache: "no-store",
    }
  );

  const data = (await response.json()) as KieTaskRecordResponse;
  if (!response.ok || data.code !== 200 || !data.data?.taskId) {
    throw new Error(data?.msg || `Kie task query failed: ${response.status}`);
  }

  return data.data;
}

export function extractKieTaskId(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const directTaskId = (payload as { taskId?: unknown }).taskId;
  if (typeof directTaskId === "string" && directTaskId) {
    return directTaskId;
  }

  const nestedTaskId = (payload as { data?: { taskId?: unknown } }).data?.taskId;
  if (typeof nestedTaskId === "string" && nestedTaskId) {
    return nestedTaskId;
  }

  return null;
}

export function verifyKieWebhookSignature({
  taskId,
  timestamp,
  signature,
  secret,
}: {
  taskId: string;
  timestamp: string;
  signature: string;
  secret: string;
}) {
  const expected = createHmac("sha256", secret)
    .update(`${taskId}.${timestamp}`)
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
