"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

export function Logo() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';
  const localePrefix = `/${currentLocale}`;

  return (
    <Link
      href={localePrefix}
      className="flex items-center gap-3 hover:opacity-90 transition-opacity"
    >
      <Image
        src="/favicon.svg"
        alt={siteConfig.name}
        width={40}
        height={40}
        className="w-10 h-10 rounded-xl shadow-lg shadow-orange-500/10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
          GPT Image 2
        </span>
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-slate-400">
          Generator
        </span>
      </span>
    </Link>
  );
}
