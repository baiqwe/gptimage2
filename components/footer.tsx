import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";

interface FooterProps {
  locale: 'en' | 'zh';
}

export async function Footer({ locale: currentLocale }: FooterProps) {
  const t = await getTranslations({ locale: currentLocale, namespace: 'footer' });
  const localePrefix = `/${currentLocale}`;

  const productLinks = [
    { label: "AI Image Generator", labelZh: "AI 图像生成", href: localePrefix },
    { label: "Create Image", labelZh: "开始创作", href: `${localePrefix}/create` },
    { label: "Gallery", labelZh: "示例画廊", href: `${localePrefix}/gallery` },
    { label: "Pricing", labelZh: "价格", href: `${localePrefix}/pricing` },
    { label: "Blog", labelZh: "博客", href: `${localePrefix}/blog` },
  ];

  const legalLinks = [
    { label: t('link_privacy'), href: `${localePrefix}/privacy` },
    { label: t('link_terms'), href: `${localePrefix}/terms` },
    { label: t('link_about'), href: `${localePrefix}/about` },
    { label: currentLocale === 'zh' ? '联系支持' : 'Contact support', href: `${localePrefix}/contact` },
  ];

  return (
    <footer className="border-t border-orange-100 bg-[linear-gradient(180deg,rgba(255,252,247,0.85)_0%,rgba(255,246,236,0.92)_100%)]">
      <div className="container px-4 py-12 md:py-16">
        <div className="section-shell grid grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4 md:px-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href={localePrefix}
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <Image
                src="/favicon.svg"
                alt={siteConfig.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl shadow-lg shadow-orange-500/10"
                sizes="40px"
              />
              <span className="flex flex-col leading-none">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-base font-bold text-transparent sm:text-lg">
                  GPT Image 2
                </span>
                <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
                  Generator
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 max-w-sm">
              {t('tagline')}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              GPT Image 2 Generator • Built for fast prompt-to-image creation
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {currentLocale === 'zh' ? '产品' : 'Product'}
            </h3>
            <nav className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-600 transition-colors hover:text-orange-600"
                >
                  {currentLocale === 'zh' ? link.labelZh : link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">{t('legal')}</h3>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-600 transition-colors hover:text-orange-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 px-2 pt-2 md:flex-row">
          <p className="text-center text-sm text-slate-500 md:text-left">
            © {new Date().getFullYear()} {siteConfig.domain}. {t('rights')}
          </p>
          <p className="text-center text-sm text-slate-500 md:text-right">
            Built by <span className="text-slate-700">{siteConfig.author}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
