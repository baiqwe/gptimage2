import { getRequiredEnv } from "@/lib/env";

const ZHIPU_API_URL =
  "https://open.bigmodel.cn/api/paas/v4/images/generations";
const ZHIPU_CHAT_URL =
  "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const SUPPORTED_SIZES: Record<string, string> = {
  "1:1": "1024x1024",
  "16:9": "1920x1080",
  "9:16": "1080x1920",
  "4:3": "1280x960",
  "3:4": "960x1280",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
};

const MODELS = {
  "cogview-4": "cogview-4",
  "glm-image": "glm-image",
  "cogview-3-flash": "cogview-3-flash",
} as const;

const STYLE_HINTS: Record<string, string> = {
  photo:
    "photorealistic photography, natural lighting, high resolution, sharp focus, professional camera",
  art: "artistic masterpiece, painterly style, vibrant colors, expressive brushstrokes, gallery quality",
  anime:
    "anime style, manga illustration, cel shading, vibrant colors, Japanese animation aesthetic",
  cinematic:
    "cinematic film still, dramatic lighting, movie scene, epic composition, anamorphic lens",
  default: "highly detailed, professional quality, stunning visual",
};

export type ZhipuModel = keyof typeof MODELS;

export class ZhipuApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "ZhipuApiError";
    this.status = status;
    this.details = details;
  }
}

export function resolveAspectRatioSize(aspectRatio: string): string {
  return SUPPORTED_SIZES[aspectRatio] || SUPPORTED_SIZES["1:1"];
}

export function resolveZhipuModel(model?: string): string {
  if (!model) {
    return MODELS["cogview-4"];
  }

  return MODELS[model as ZhipuModel] || MODELS["cogview-4"];
}

export async function enhancePromptWithZhipu(
  userPrompt: string,
  style: string
): Promise<{ enhanced: string; success: boolean }> {
  try {
    const apiKey = getRequiredEnv("ZHIPU_API_KEY");
    const styleHint = STYLE_HINTS[style] || STYLE_HINTS.default;

    const response = await fetch(ZHIPU_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert AI art prompt engineer for image generation. Your job is to transform simple user prompts into detailed, vivid descriptions that will produce stunning images.

Rules:
1. Detect whether the user input is Chinese or English.
2. If the user input is Chinese, the output must stay in Chinese.
3. If the user input is English, the output must stay in English.
4. Preserve any quoted text or literal text that should appear in the image exactly as written.
5. Expand the prompt with lighting, composition, atmosphere, texture, and color details.
6. Incorporate this style direction naturally: "${styleHint}".
7. Output only the improved prompt.
8. Keep the result under 200 words.`,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return { enhanced: userPrompt, success: false };
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim();

    if (!enhanced || enhanced.length <= 5) {
      return { enhanced: userPrompt, success: false };
    }

    return { enhanced, success: true };
  } catch {
    return { enhanced: userPrompt, success: false };
  }
}

export async function generateImageWithZhipu(params: {
  prompt: string;
  aspectRatio: string;
  model?: string;
}) {
  const apiKey = getRequiredEnv("ZHIPU_API_KEY");
  const size = resolveAspectRatioSize(params.aspectRatio);
  const selectedModel = resolveZhipuModel(params.model);

  const response = await fetch(ZHIPU_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      prompt: params.prompt,
      size,
      quality: "standard",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      `Zhipu API request failed with status ${response.status}`;

    throw new ZhipuApiError(message, response.status, errorData);
  }

  const data = await response.json();
  const resultUrl = data.data?.[0]?.url;

  if (!resultUrl || typeof resultUrl !== "string" || !resultUrl.startsWith("http")) {
    throw new ZhipuApiError("Zhipu API returned an invalid image URL", 502, data);
  }

  return {
    url: resultUrl,
    size,
    model: selectedModel,
    raw: data,
  };
}
