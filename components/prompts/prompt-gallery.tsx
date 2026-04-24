"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PROMPT_CATEGORIES,
  PROMPT_GALLERY,
  type PromptCategory,
  type PromptItem,
} from "@/config/prompts-data";
import { useToast } from "@/hooks/use-toast";

interface PromptGalleryProps {
  locale: "en" | "zh";
  items?: PromptItem[];
  hideFilters?: boolean;
  initialCategory?: PromptCategory | "All";
}

const categoryLabelMap: Record<PromptCategory, { en: string; zh: string }> = {
  Portrait: { en: "Portrait", zh: "人像" },
  Social: { en: "Social", zh: "社媒" },
  UI: { en: "UI", zh: "界面" },
  Product: { en: "Product", zh: "产品" },
  "Pixel Art": { en: "Pixel Art", zh: "像素艺术" },
  "3D Render": { en: "3D Render", zh: "3D 渲染" },
};

export default function PromptGallery({
  locale,
  items = PROMPT_GALLERY,
  hideFilters = false,
  initialCategory = "All",
}: PromptGalleryProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "All">(initialCategory);

  const filteredPrompts = useMemo(() => {
    if (activeCategory === "All") {
      return items;
    }

    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  const handleCopy = async (prompt: string, id: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      toast({
        title: locale === "zh" ? "提示词已复制" : "Prompt copied",
        description:
          locale === "zh"
            ? "现在可以直接粘贴到生成器里使用。"
            : "You can paste it into the generator right away.",
      });
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast({
        title: locale === "zh" ? "复制失败" : "Copy failed",
        description:
          locale === "zh"
            ? "你可以手动复制下面的提示词。"
            : "You can still copy the prompt manually.",
      });
    }
  };

  const handleTryIt = async (prompt: string, aspectRatio: string) => {
    try {
      window.localStorage.setItem(
        "prompt_gallery_prefill",
        JSON.stringify({
          prompt,
          aspectRatio,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore localStorage issues and continue routing
    }

    router.push(`/${locale}/create`);
  };

  return (
    <div className="space-y-8">
      {!hideFilters ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveCategory("All")}
            className={`rounded-full border-orange-200 px-4 py-2 text-sm font-semibold ${
              activeCategory === "All"
                ? "bg-[#ff6b2c] text-white hover:bg-[#f86120] hover:text-white"
                : "bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700"
            }`}
          >
            {locale === "zh" ? "全部" : "All prompts"}
          </Button>
          {PROMPT_CATEGORIES.map((category) => (
            <Button
              key={category}
              type="button"
              variant="outline"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border-orange-200 px-4 py-2 text-sm font-semibold ${
                activeCategory === category
                  ? "bg-[#ff6b2c] text-white hover:bg-[#f86120] hover:text-white"
                  : "bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              {locale === "zh" ? categoryLabelMap[category].zh : categoryLabelMap[category].en}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPrompts.map((item) => {
          const localizedPrompt = locale === "zh" ? item.promptZh : item.prompt;
          const localizedTitle = locale === "zh" ? item.titleZh : item.title;
          const localizedDescription =
            locale === "zh" ? item.descriptionZh : item.description;

          return (
            <article
              key={item.id}
              id={item.id}
              className="group section-shell overflow-hidden border border-orange-100 bg-white/90 shadow-[0_22px_70px_rgba(232,145,73,0.10)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[1/1] overflow-hidden bg-[#fff6ee]">
                <Image
                  src={item.image}
                  alt={`${localizedTitle} - ${localizedPrompt}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <Badge className="border border-white/60 bg-white/86 text-slate-800 shadow-sm backdrop-blur">
                    {locale === "zh"
                      ? categoryLabelMap[item.category].zh
                      : categoryLabelMap[item.category].en}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="border border-white/50 bg-[#fff6ee]/90 text-orange-700 shadow-sm backdrop-blur"
                  >
                    {item.aspectRatio}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {localizedTitle}
                  </h2>
                  <p className="text-sm leading-7 text-slate-600">
                    {localizedDescription}
                  </p>
                </div>

                <div className="rounded-[22px] border border-orange-100 bg-[linear-gradient(180deg,#fffaf4_0%,#fff5eb_100%)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                    {locale === "zh" ? "Prompt" : "Prompt"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {localizedPrompt}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopy(localizedPrompt, item.id)}
                    className="h-11 rounded-2xl border-orange-200 bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {copiedId === item.id ? (
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {locale === "zh" ? "复制提示词" : "Copy prompt"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleTryIt(localizedPrompt, item.aspectRatio)}
                    className="h-11 rounded-2xl bg-[#ff6b2c] text-white shadow-[0_14px_30px_rgba(255,107,44,0.22)] hover:bg-[#f86120]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {locale === "zh" ? "去生成器试试" : "Try it now"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
