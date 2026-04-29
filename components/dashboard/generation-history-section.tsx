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

export function GenerationHistorySection({
    items,
    locale = "en",
}: GenerationHistorySectionProps) {
    const isZh = locale === "zh";

    return (
        <section className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {isZh ? "生成历史记录" : "Generation History"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {isZh
                            ? "查看您最近生成过的图片，并快速回顾提示词和参数。"
                            : "Review your recent generations, prompts, and key settings in one place."}
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
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => {
                        const modeLabel = toModeLabel(item.metadata?.mode, locale);
                        const resolution = item.metadata?.resolution || "1K";
                        const aspectRatio = item.metadata?.aspect_ratio || "auto";

                        return (
                            <article
                                key={item.id}
                                className="overflow-hidden rounded-[20px] border border-orange-100 bg-[#fffdf9] shadow-[0_12px_32px_rgba(235,145,71,0.08)]"
                            >
                                {item.image_url ? (
                                    <a
                                        href={item.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block bg-[#fff3e6]"
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.prompt}
                                            className="aspect-[4/3] w-full object-cover"
                                            loading="lazy"
                                        />
                                    </a>
                                ) : (
                                    <div className="flex aspect-[4/3] items-center justify-center bg-[#fff3e6] text-sm text-slate-500">
                                        {isZh ? "图片不可用" : "Image unavailable"}
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">
                                            {modeLabel}
                                        </span>
                                        <span>{resolution}</span>
                                        <span>{aspectRatio}</span>
                                    </div>

                                    <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                                        {item.prompt}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                                        <span>{formatDate(item.created_at, locale)}</span>
                                        <span>
                                            {isZh ? "消耗" : "Cost"} {item.credits_cost ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
