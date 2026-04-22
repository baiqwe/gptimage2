"use client";

import { Logo } from "./logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations('footer');

  const pathParts = pathname?.split('/') || [];
  const currentLocale = (pathParts[1] === 'en' || pathParts[1] === 'zh') ? pathParts[1] : 'en';
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
  ];

  const toolLinks = [
    { label: "Color to Black & White", labelZh: "彩色转黑白", href: `${localePrefix}/color-to-black-and-white` },
    { label: "Invert Colors", labelZh: "反色工具", href: `${localePrefix}/invert-colors` },
    { label: "Photo to Coloring Page", labelZh: "照片转填色画", href: `${localePrefix}/photo-to-coloring-page` },
  ];

  return (
    <footer className="border-t border-orange-100 bg-white/70">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Logo />
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

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {currentLocale === 'zh' ? '工具' : 'Tools'}
            </h3>
            <nav className="flex flex-col gap-2">
              {toolLinks.map((link) => (
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
        </div>

        {/* Friends / 友链 */}
        <div className="mt-8 pt-6 border-t border-orange-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {currentLocale === 'zh' ? '友情链接' : 'Friends'}
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://findly.tools/gpt-image-2-generator?utm_source=gpt-image-2-generator"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://findly.tools/badges/findly-tools-badge-light.svg"
                alt="Featured on Findly.tools"
                width={175}
                height={55}
                className="h-auto w-[175px] opacity-90 transition-opacity hover:opacity-100"
              />
            </a>
            <a
              href="https://z-image.net/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-orange-600"
            >
              Z-Image
            </a>
            <a
              href="https://goodaitools.com/ai/gpt-image-2-generator"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm text-slate-600 transition-colors hover:text-orange-600"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://goodaitools.com/assets/images/badge.png"
                alt="Badge"
                height={54}
                className="h-[54px] w-auto opacity-90 transition-opacity hover:opacity-100"
              />
            </a>
            <a
              href="https://apphublist.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://apphublist.com/assets/images/badge.png"
                alt="App Hub List"
                height={54}
                className="h-[54px] w-auto opacity-90 transition-opacity hover:opacity-100"
              />
            </a>
            <a
              href="https://tooldynamo.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://tooldynamo.com/assets/images/badge.png"
                alt="Tool Dynamo"
                height={54}
                className="h-[54px] w-auto opacity-90 transition-opacity hover:opacity-100"
              />
            </a>
            <a
              href="https://aixcollection.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://aixcollection.com/assets/images/badge.png"
                alt="AI X Collection"
                height={54}
                className="h-[54px] w-auto opacity-90 transition-opacity hover:opacity-100"
              />
            </a>
            <a
              href="https://weliketools.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://weliketools.com/assets/images/badge.png"
                alt="We Like Tools"
                height={54}
                className="h-[54px] w-auto opacity-90 transition-opacity hover:opacity-100"
              />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-orange-100 pt-8 md:flex-row">
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
