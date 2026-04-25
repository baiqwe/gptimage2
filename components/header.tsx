import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "./ui/badge";
import { Logo } from "./logo";
import { HeaderClientControls } from "./header-client-controls";

interface HeaderProps {
  user: any;
  locale: 'en' | 'zh';
}

interface NavItem {
  label: string;
  href: string;
  hot?: boolean;
}

export default async function Header({ user, locale }: HeaderProps) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const localePrefix = `/${locale}`;

  const mainNavItems: NavItem[] = [
    { label: t('home'), href: localePrefix },
    { label: locale === 'zh' ? '提示词' : 'Prompts', href: `${localePrefix}/prompts`, hot: true },
    { label: t('pricing'), href: `${localePrefix}/pricing` },
    { label: locale === 'zh' ? '博客' : 'Blog', href: `${localePrefix}/blog` },
    { label: t('about'), href: `${localePrefix}/about` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100/80 bg-[rgba(255,251,246,0.82)] backdrop-blur-xl">
      <div className="container flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Logo locale={locale} />

          <nav className="hidden items-center gap-2 rounded-full border border-orange-100 bg-white/70 p-1.5 shadow-[0_12px_30px_rgba(232,145,73,0.06)] md:flex">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-orange-50 hover:text-orange-600"
              >
                {item.label}
                {item.hot ? (
                  <Badge className="bg-[#fff2e8] px-1.5 py-0 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700 hover:bg-[#fff2e8]">
                    Hot
                  </Badge>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>

        <HeaderClientControls
          user={user}
          locale={locale}
          navItems={mainNavItems}
        />
      </div>
    </header>
  );
}
