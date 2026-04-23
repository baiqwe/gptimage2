export const GPT_IMAGE_MODEL = "gpt-image-2";

export const DEFAULT_PROMPTS = {
  en: "A cinematic portrait of a stylish person standing on a rain-soaked city street at night, soft neon reflections, realistic skin texture, detailed clothing, shallow depth of field, high realism",
  zh: "一位穿着时尚的人站在雨夜城市街头的电影感肖像，地面有柔和霓虹倒影，皮肤纹理真实，服装细节丰富，浅景深，高度写实",
} as const;

export const ASPECT_RATIO_OPTIONS = [
  { id: "auto", label: "Auto", labelZh: "自动" },
  { id: "1:1", label: "1:1", labelZh: "1:1" },
  { id: "9:16", label: "9:16", labelZh: "9:16" },
  { id: "16:9", label: "16:9", labelZh: "16:9" },
  { id: "4:3", label: "4:3", labelZh: "4:3" },
  { id: "3:4", label: "3:4", labelZh: "3:4" },
] as const;

export const COUNT_OPTIONS = [1, 2, 4] as const;

export type AspectRatioOption = (typeof ASPECT_RATIO_OPTIONS)[number]["id"];
export type CountOption = (typeof COUNT_OPTIONS)[number];

export function resolveAspectRatio(aspectRatio: string): AspectRatioOption {
  return ASPECT_RATIO_OPTIONS.find((option) => option.id === aspectRatio)?.id ?? "auto";
}

export function resolveOpenAISize(aspectRatio: string) {
  const resolved = resolveAspectRatio(aspectRatio);

  if (resolved === "9:16" || resolved === "3:4") {
    return "1024x1536";
  }

  if (resolved === "16:9" || resolved === "4:3") {
    return "1536x1024";
  }

  return "1024x1024";
}
