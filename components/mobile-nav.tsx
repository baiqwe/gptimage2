"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  items: { label: string; href: string }[];
  user: any;
  isDashboard: boolean;
  currentLocale?: string;
}

export function MobileNav({ items, user, isDashboard, currentLocale = 'en' }: MobileNavProps) {
  const pathname = usePathname();
  const localePrefix = `/${currentLocale}`;

  // 获取不带 locale 前缀的路径
  const getPathWithoutLocale = () => {
    if (!pathname) return '/';
    const withoutLocale = pathname.replace(/^\/(en|zh)/, '');
    return withoutLocale || '/';
  };

  const pathWithoutLocale = getPathWithoutLocale();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="border border-orange-100 bg-white/80 shadow-[0_10px_24px_rgba(232,145,73,0.08)] md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col border-r border-orange-100 bg-[linear-gradient(180deg,#fffdf8_0%,#fff4e8_100%)]">
        <SheetHeader>
          <SheetTitle className="text-slate-900">{currentLocale === 'zh' ? '导航' : 'Navigation'}</SheetTitle>
        </SheetHeader>

        {/* Language Switcher for Mobile */}
        <div className="mt-4 flex items-center gap-2 border-b border-orange-100 pb-4">
          <span className="text-sm text-muted-foreground">
            {currentLocale === 'zh' ? '语言:' : 'Language:'}
          </span>
          <Link
            href={`/en${pathWithoutLocale}`}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${currentLocale === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'bg-white text-muted-foreground hover:text-foreground'
              }`}
          >
            EN
          </Link>
          <Link
            href={`/zh${pathWithoutLocale}`}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${currentLocale === 'zh'
              ? 'bg-primary text-primary-foreground'
              : 'bg-white text-muted-foreground hover:text-foreground'
              }`}
          >
            中文
          </Link>
        </div>

        <nav className="flex flex-col gap-4 mt-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-transparent px-3 py-2 text-lg font-semibold text-muted-foreground transition-colors hover:border-orange-100 hover:bg-white hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-orange-100 pt-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <Button asChild variant="default" className="w-full">
                <Link href={`${localePrefix}/dashboard`} rel="nofollow">
                  {currentLocale === 'zh' ? '控制台' : 'Dashboard'}
                </Link>
              </Button>
              <form action={signOutAction} className="w-full">
                <Button type="submit" variant="outline" className="w-full">
                  {currentLocale === 'zh' ? '退出登录' : 'Sign out'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={`${localePrefix}/sign-in`} rel="nofollow">
                  {currentLocale === 'zh' ? '登录' : 'Sign in'}
                </Link>
              </Button>
              <Button asChild variant="default" className="w-full">
                <Link href={`${localePrefix}/sign-up`} rel="nofollow">
                  {currentLocale === 'zh' ? '注册' : 'Sign up'}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
