import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

interface LogoProps {
  locale?: string;
}

export function Logo({ locale = 'en' }: LogoProps) {
  const localePrefix = `/${locale}`;

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
        <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
          GPT Image 2
        </span>
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-slate-500">
          Generator
        </span>
      </span>
    </Link>
  );
}
