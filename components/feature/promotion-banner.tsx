"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PromotionBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();

    const locale = pathname?.split('/')[1] === 'zh' ? 'zh' : 'en';
    const localePrefix = `/${locale}`;

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-[#ff7a34] to-orange-600 text-white">
            <Link
                href={`${localePrefix}/pricing`}
                className="block px-4 py-2.5 text-center text-sm font-medium"
                aria-label={locale === 'zh' ? '查看套餐与付款页面' : 'View pricing and checkout options'}
            >
                <div className="pointer-events-none flex items-center justify-center gap-2.5 pr-8 flex-wrap">
                    <span className="text-lg">✨</span>
                    <span>
                        {locale === 'zh'
                            ? '现在可直接购买：套餐'
                            : 'Plans are live now:'}
                    </span>
                    <span className="font-bold">
                        {locale === 'zh' ? '$9.99 起' : 'from $9.99'}
                    </span>
                    <span>
                        {locale === 'zh'
                            ? '，年付相较按月订阅可节省'
                            : 'and annual billing saves'}
                    </span>
                    <span className="font-bold underline decoration-white/50 decoration-2 underline-offset-2">
                        65%
                    </span>
                    <span>
                        {locale === 'zh'
                            ? '。点击查看定价 →'
                            : 'vs monthly. View pricing →'}
                    </span>
                </div>
            </Link>

            <button
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsVisible(false);
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 transition-colors hover:bg-white/20"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default PromotionBanner;
