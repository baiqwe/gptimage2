"use client";

import { signOutAction } from "@/app/actions";
import { useUser } from "@/hooks/use-user";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

const MobileNav = dynamic(
  () => import("./mobile-nav").then((mod) => mod.MobileNav),
  { ssr: false }
);

interface NavItem {
  label: string;
  href: string;
  hot?: boolean;
}

interface HeaderClientControlsProps {
  user: any;
  locale: 'en' | 'zh';
  navItems: NavItem[];
}

export function HeaderClientControls({ user: initialUser, locale, navItems }: HeaderClientControlsProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { user: clientUser, loading } = useUser();
  const user = loading ? initialUser : clientUser;
  const localePrefix = `/${locale}`;

  const getPathWithoutLocale = () => {
    if (!pathname) return '/';
    const withoutLocale = pathname.replace(/^\/(en|zh)/, '');
    return withoutLocale || '/';
  };

  const pathWithoutLocale = getPathWithoutLocale();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-1 rounded-full border border-orange-100 bg-[#fff8f1] p-1 shadow-[0_10px_24px_rgba(232,145,73,0.06)] md:flex">
        <Link
          href={`/en${pathWithoutLocale}`}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${locale === 'en'
            ? 'bg-[#ff6b2c] text-white'
            : 'text-slate-500 hover:text-orange-700'
            }`}
        >
          EN
        </Link>
        <Link
          href={`/zh${pathWithoutLocale}`}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${locale === 'zh'
            ? 'bg-[#ff6b2c] text-white'
            : 'text-slate-500 hover:text-orange-700'
            }`}
        >
          中文
        </Link>
      </div>

      {loading ? (
        <div className="hidden items-center gap-2 md:flex">
          <div className="h-9 w-[92px] rounded-full border border-orange-100 bg-white/80" />
          <div className="h-9 w-[92px] rounded-full border border-orange-100 bg-white/80" />
        </div>
      ) : user ? (
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="ghost" className="text-slate-600 hover:bg-orange-50 hover:text-orange-700">
            <Link href={`${localePrefix}/dashboard`} rel="nofollow">
              {locale === 'zh' ? '控制台' : 'Dashboard'}
            </Link>
          </Button>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm" className="border-orange-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700">
              {t('sign_out')}
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden gap-2 md:flex">
          <Button asChild size="sm" variant="ghost" className="text-slate-600 hover:bg-orange-50 hover:text-orange-700">
            <Link href={`${localePrefix}/sign-in`} rel="nofollow">{t('sign_in')}</Link>
          </Button>
          <Button asChild size="sm" className="border-0 bg-[#ff6b2c] text-white shadow-[0_14px_32px_rgba(255,107,44,0.22)] hover:bg-[#f86120]">
            <Link href={`${localePrefix}/sign-up`} rel="nofollow" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t('sign_up')}
            </Link>
          </Button>
        </div>
      )}

      <MobileNav items={navItems} user={user} isDashboard={false} currentLocale={locale} />
    </div>
  );
}
