"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AiPromotionBannerProps {
    className?: string;
}

export function AiPromotionBanner({ className }: AiPromotionBannerProps) {
    return (
        <div className={`mt-8 rounded-[28px] border border-orange-100 bg-[linear-gradient(135deg,#fffaf3_0%,#fff4e8_52%,#fff0e3_100%)] p-6 shadow-[0_20px_60px_rgba(255,107,44,0.08)] flex flex-col md:flex-row items-center gap-6 ${className}`}>
            {/* 1. 左侧：静态对比图 */}
            <div className="relative h-48 w-full overflow-hidden rounded-[22px] border border-orange-100 bg-white shadow-sm md:w-1/2">
                {/* 对比图区域 - 用CSS制作分割效果 */}
                <div className="absolute inset-0 flex">
                    {/* 普通版 - 左半边 */}
                    <div className="flex h-full w-1/2 items-center justify-center border-r-2 border-dashed border-orange-100 bg-stone-100">
                        <div className="text-center p-4">
                            <div className="text-4xl mb-2 opacity-50">🖼️</div>
                            <p className="text-xs text-slate-500">普通算法</p>
                            <p className="text-xs text-slate-400">线条断裂 · 细节丢失</p>
                        </div>
                    </div>
                    {/* AI版 - 右半边 */}
                    <div className="flex h-full w-1/2 items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                        <div className="text-center p-4">
                            <div className="text-4xl mb-2">✨</div>
                            <p className="text-xs font-medium text-orange-600">AI 专业版</p>
                            <p className="text-xs text-orange-500">连贯线条 · 完美细节</p>
                        </div>
                    </div>
                </div>
                {/* 标签 */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">普通版</div>
                <div className="absolute bottom-2 right-2 rounded bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-1 text-xs text-white">AI 专业版</div>
            </div>

            {/* 2. 右侧：文案与CTA */}
            <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-900">
                    想要更加完美、连贯的线稿？
                </h3>
                <p className="text-sm text-slate-600">
                    普通算法无法处理阴影和复杂细节。升级到 AI Studio，利用大模型重绘，获得专业级出版质量。
                </p>
                <div className="pt-2">
                    <Button asChild size="lg" className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg transition-opacity hover:opacity-90">
                        <Link href="/sign-up?next=/create" rel="nofollow">
                            <Sparkles className="w-4 h-4 mr-2" />
                            注册免费领 30 积分试用
                        </Link>
                    </Button>
                    <p className="mt-2 text-xs text-slate-500">新用户限时福利，可生成 3 张专业图</p>
                </div>
            </div>
        </div>
    );
}
