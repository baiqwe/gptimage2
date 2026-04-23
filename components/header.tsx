"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface HeaderProps {
  user: any;
}

interface NavItem {
  label: string;
  href: string;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { user: clientUser, loading } = useUser();
  const user = loading ? initialUser : clientUser;

  const pathParts = pathname?.split('/') || [];
  const currentLocale = (pathParts[1] === 'en' || pathParts[1] === 'zh') ? pathParts[1] : 'en';
  const localePrefix = `/${currentLocale}`;

  const getPathWithoutLocale = () => {
    if (!pathname) return '/';
    const withoutLocale = pathname.replace(/^\/(en|zh)/, '');
    return withoutLocale || '/';
  };

  const pathWithoutLocale = getPathWithoutLocale();

  const mainNavItems: NavItem[] = [
    { label: t('home'), href: localePrefix },
    { label: t('pricing'), href: `${localePrefix}/pricing` },
    { label: currentLocale === 'zh' ? '博客' : 'Blog', href: `${localePrefix}/blog` },
    { label: t('about'), href: `${localePrefix}/about` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100/80 bg-[rgba(255,251,246,0.82)] backdrop-blur-xl">
      <div className="container flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden items-center gap-2 rounded-full border border-orange-100 bg-white/70 p-1.5 shadow-[0_12px_30px_rgba(232,145,73,0.06)] md:flex">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-orange-50 hover:text-orange-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-orange-100 bg-[#fff8f1] p-1 shadow-[0_10px_24px_rgba(232,145,73,0.06)] md:flex">
            <Link
              href={`/en${pathWithoutLocale}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${currentLocale === 'en'
                ? 'bg-[#ff6b2c] text-white'
                : 'text-slate-500 hover:text-orange-700'
                }`}
            >
              EN
            </Link>
            <Link
              href={`/zh${pathWithoutLocale}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${currentLocale === 'zh'
                ? 'bg-[#ff6b2c] text-white'
                : 'text-slate-500 hover:text-orange-700'
                }`}
            >
              中文
            </Link>
          </div>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" className="text-slate-600 hover:bg-orange-50 hover:text-orange-700">
                <Link href={`${localePrefix}/dashboard`} rel="nofollow">
                  {currentLocale === 'zh' ? '控制台' : 'Dashboard'}
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm" className="border-orange-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700">
                  {t('sign_out')}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button asChild size="sm" variant="ghost" className="text-slate-600 hover:bg-orange-50 hover:text-orange-700">
                <Link href={`${localePrefix}/sign-in`} rel="nofollow">{t('sign_in')}</Link>
              </Button>
              <Button asChild size="sm" className="border-0 bg-[#ff6b2c] text-white shadow-[0_14px_32px_rgba(255,107,44,0.22)] hover:bg-[#f86120]">
                <Link href={`${localePrefix}/sign-up`} rel="nofollow" className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('sign_up')}
                </Link>
              </Button>
            </div>
          )}

          <MobileNav items={mainNavItems} user={user} isDashboard={false} currentLocale={currentLocale} />
        </div>
      </div>
    </header>
  );
}
