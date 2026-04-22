"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AiPromotionBannerProps {
    className?: string;
}

export function AiPromotionBanner({ className }: AiPromotionBannerProps) {
    return (
        <div className={`mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl flex flex-col md:flex-row items-center gap-6 ${className}`}>
            {/* 1. 左侧：静态对比图 */}
            <div className="w-full md:w-1/2 relative h-48 rounded-lg overflow-hidden border shadow-sm bg-white dark:bg-slate-900">
                {/* 对比图区域 - 用CSS制作分割效果 */}
                <div className="absolute inset-0 flex">
                    {/* 普通版 - 左半边 */}
                    <div className="w-1/2 h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-r-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="text-center p-4">
                            <div className="text-4xl mb-2 opacity-50">🖼️</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">普通算法</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">线条断裂 · 细节丢失</p>
                        </div>
                    </div>
                    {/* AI版 - 右半边 */}
                    <div className="w-1/2 h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center">
                        <div className="text-center p-4">
                            <div className="text-4xl mb-2">✨</div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">AI 专业版</p>
                            <p className="text-xs text-blue-500 dark:text-blue-500">连贯线条 · 完美细节</p>
                        </div>
                    </div>
                </div>
                {/* 标签 */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">普通版</div>
                <div className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded">AI 专业版</div>
            </div>

            {/* 2. 右侧：文案与CTA */}
            <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    想要更加完美、连贯的线稿？
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    普通算法无法处理阴影和复杂细节。升级到 AI Studio，利用大模型重绘，获得专业级出版质量。
                </p>
                <div className="pt-2">
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity shadow-lg border-0">
                        <Link href="/sign-up?next=/create" rel="nofollow">
                            <Sparkles className="w-4 h-4 mr-2" />
                            注册免费领 30 积分试用
                        </Link>
                    </Button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">新用户限时福利，可生成 3 张专业图</p>
                </div>
            </div>
        </div>
    );
}
