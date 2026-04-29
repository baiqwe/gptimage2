"use client";

import { useState } from "react";
import { Download, Eye, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type GenerationRecord = {
    id: string;
    prompt: string;
    image_url: string | null;
    status: string | null;
    credits_cost: number | null;
    created_at: string;
    metadata?: {
        mode?: string;
        resolution?: string;
        aspect_ratio?: string;
        provider?: string;
    } | null;
};

interface GenerationHistorySectionProps {
    items: GenerationRecord[];
    locale?: string;
}

function formatDate(date: string, locale: string) {
    try {
        return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date));
    } catch {
        return date;
    }
}

function toModeLabel(mode: string | undefined, locale: string) {
    if (mode === "image-to-image") {
        return locale === "zh" ? "图生图" : "Image to Image";
    }

    return locale === "zh" ? "文生图" : "Text to Image";
}

function toStatusLabel(status: string | null | undefined, locale: string) {
    if (status === "succeeded") {
        return locale === "zh" ? "成功" : "Succeeded";
    }

    if (status === "failed") {
        return locale === "zh" ? "失败" : "Failed";
    }

    return locale === "zh" ? "处理中" : "Pending";
}

export function GenerationHistorySection({
    items,
    locale = "en",
}: GenerationHistorySectionProps) {
    const isZh = locale === "zh";
    const [previewItem, setPreviewItem] = useState<GenerationRecord | null>(null);

    return (
        <section className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {isZh ? "生成历史记录" : "Generation History"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {isZh
                            ? "按列表查看您最近生成过的图片记录，并按需预览或下载。"
                            : "Browse your recent image records in a compact list and preview or download on demand."}
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-orange-200 bg-[#fffaf4] px-6 py-10 text-center">
                    <p className="text-base font-medium text-slate-700">
                        {isZh ? "您还没有生成记录" : "You do not have any generation history yet"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {isZh
                            ? "先去生成几张图片，之后这里会自动保存您的历史记录。"
                            : "Create a few images first and your history will appear here automatically."}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-[20px] border border-orange-100">
                    <div className="hidden grid-cols-[1.25fr_1fr_0.8fr_0.8fr_0.7fr_1fr] gap-4 bg-[#fff8f1] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
                        <span>{isZh ? "提示词" : "Prompt"}</span>
                        <span>{isZh ? "时间" : "Created"}</span>
                        <span>{isZh ? "模式" : "Mode"}</span>
                        <span>{isZh ? "比例 / 分辨率" : "Aspect / Resolution"}</span>
                        <span>{isZh ? "积分" : "Credits"}</span>
                        <span>{isZh ? "操作" : "Actions"}</span>
                    </div>

                    <div className="divide-y divide-orange-100">
                        {items.map((item) => {
                            const modeLabel = toModeLabel(item.metadata?.mode, locale);
                            const resolution = item.metadata?.resolution || "1K";
                            const aspectRatio = item.metadata?.aspect_ratio || "auto";
                            const statusLabel = toStatusLabel(item.status, locale);

                            return (
                                <article
                                    key={item.id}
                                    className="px-4 py-4 sm:px-5"
                                >
                                    <div className="grid gap-4 md:grid-cols-[1.25fr_1fr_0.8fr_0.8fr_0.7fr_1fr] md:items-center">
                                        <div className="min-w-0">
                                            <div className="mb-2 flex items-center gap-2 md:hidden">
                                                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                                                    {modeLabel}
                                                </span>
                                                <span className="text-xs text-slate-500">{statusLabel}</span>
                                            </div>
                                            <p className="line-clamp-2 text-sm leading-6 text-slate-700">
                                                {item.prompt}
                                            </p>
                                        </div>

                                        <div className="text-sm text-slate-600">
                                            <span className="md:hidden text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                {isZh ? "时间 · " : "Created · "}
                                            </span>
                                            {formatDate(item.created_at, locale)}
                                        </div>

                                        <div className="hidden text-sm text-slate-600 md:block">
                                            {modeLabel}
                                        </div>

                                        <div className="text-sm text-slate-600">
                                            <span className="md:hidden text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                {isZh ? "参数 · " : "Settings · "}
                                            </span>
                                            {aspectRatio} / {resolution}
                                        </div>

                                        <div className="text-sm text-slate-600">
                                            <span className="md:hidden text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                {isZh ? "积分 · " : "Credits · "}
                                            </span>
                                            {item.credits_cost ?? 0}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="border-orange-200 bg-white text-slate-700 hover:bg-orange-50"
                                                onClick={() => setPreviewItem(item)}
                                                disabled={!item.image_url}
                                            >
                                                <Eye className="mr-1.5 h-4 w-4" />
                                                {isZh ? "预览" : "Preview"}
                                            </Button>

                                            {item.image_url ? (
                                                <a
                                                    href={item.image_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                >
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="bg-orange-500 text-white hover:bg-orange-600"
                                                    >
                                                        <Download className="mr-1.5 h-4 w-4" />
                                                        {isZh ? "下载" : "Download"}
                                                    </Button>
                                                </a>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-slate-200 text-slate-400"
                                                    disabled
                                                >
                                                    <ImageOff className="mr-1.5 h-4 w-4" />
                                                    {isZh ? "无图片" : "No Image"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            )}

            <Dialog
                open={Boolean(previewItem)}
                onOpenChange={(open) => {
                    if (!open) setPreviewItem(null);
                }}
            >
                <DialogContent className="max-w-3xl border-orange-100 bg-white">
                    <DialogHeader>
                        <DialogTitle>{isZh ? "生成记录预览" : "Generation Preview"}</DialogTitle>
                        <DialogDescription>
                            {previewItem
                                ? `${toModeLabel(previewItem.metadata?.mode, locale)} · ${previewItem.metadata?.aspect_ratio || "auto"} / ${previewItem.metadata?.resolution || "1K"}`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>

                    {previewItem ? (
                        <div className="space-y-4">
                            {previewItem.image_url ? (
                                <img
                                    src={previewItem.image_url}
                                    alt={previewItem.prompt}
                                    className="max-h-[70vh] w-full rounded-2xl border border-orange-100 object-contain bg-[#fff8f1]"
                                />
                            ) : (
                                <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf4] text-slate-500">
                                    {isZh ? "图片不可用" : "Image unavailable"}
                                </div>
                            )}

                            <div className="rounded-2xl bg-[#fffaf4] p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    {isZh ? "提示词" : "Prompt"}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-slate-700">
                                    {previewItem.prompt}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </section>
    );
}
