export const GPT_IMAGE_MODEL = "gpt-image-2";

export const DEFAULT_PROMPTS = {
  en: "A cinematic portrait of a stylish person standing on a rain-soaked city street at night, soft neon reflections, realistic skin texture, detailed clothing, shallow depth of field, high realism",
  zh: "一位穿着时尚的人站在雨夜城市街头的电影感肖像，地面有柔和霓虹倒影，皮肤纹理真实，服装细节丰富，浅景深，高度写实",
} as const;

export const SIZE_PRESETS = [
  {
    id: "square",
    label: "Square",
    labelZh: "方形",
    size: "1024x1024",
    hint: "1024×1024",
    icon: "□",
  },
  {
    id: "portrait",
    label: "Portrait",
    labelZh: "竖版",
    size: "1024x1536",
    hint: "1024×1536",
    icon: "▯",
  },
  {
    id: "landscape",
    label: "Landscape",
    labelZh: "横版",
    size: "1536x1024",
    hint: "1536×1024",
    icon: "▭",
  },
] as const;

export const QUALITY_OPTIONS = [
  { id: "auto", label: "Auto", labelZh: "自动" },
  { id: "low", label: "Low", labelZh: "快速" },
  { id: "medium", label: "Medium", labelZh: "标准" },
  { id: "high", label: "High", labelZh: "精细" },
] as const;

export const OUTPUT_FORMAT_OPTIONS = [
  { id: "png", label: "PNG" },
  { id: "jpeg", label: "JPEG" },
  { id: "webp", label: "WebP" },
] as const;

export const COUNT_OPTIONS = [1, 2, 4] as const;

export type SizePresetId = (typeof SIZE_PRESETS)[number]["id"];
export type QualityOption = (typeof QUALITY_OPTIONS)[number]["id"];
export type OutputFormatOption = (typeof OUTPUT_FORMAT_OPTIONS)[number]["id"];
export type CountOption = (typeof COUNT_OPTIONS)[number];

export function resolveSizePreset(sizePreset: string) {
  return SIZE_PRESETS.find((preset) => preset.id === sizePreset) ?? SIZE_PRESETS[0];
}

