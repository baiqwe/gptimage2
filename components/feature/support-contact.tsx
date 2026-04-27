import Image from "next/image";
import { MessageCircleMore, QrCode, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";

export function SupportContactDock({ locale }: { locale: "en" | "zh" }) {
  const isZh = locale === "zh";

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-3 z-40 sm:bottom-4 sm:left-4">
      <div className="group pointer-events-auto relative">
        <a
          href={siteConfig.wecomLink}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-200/90 bg-white/92 p-0 shadow-[0_18px_40px_rgba(235,145,71,0.16)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_24px_48px_rgba(235,145,71,0.22)] sm:h-auto sm:w-auto sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3"
          aria-label={isZh ? "联系企业微信支持" : "Contact support on WeCom"}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3e8] text-orange-600 sm:rounded-2xl">
            <MessageCircleMore className="h-5 w-5" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
              {isZh ? "在线支持" : "Support"}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {isZh ? "企业微信联系我" : "Message me on WeCom"}
            </p>
          </div>
          <ExternalLink className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
        </a>

        <div className="pointer-events-none absolute bottom-[calc(100%+14px)] left-0 hidden w-[280px] translate-y-2 rounded-[28px] border border-orange-100 bg-white p-4 opacity-0 shadow-[0_22px_60px_rgba(235,145,71,0.18)] transition-all duration-200 group-hover:block group-hover:translate-y-0 group-hover:opacity-100 sm:block">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <QrCode className="h-4 w-4 text-orange-500" />
            {isZh ? "扫码添加企业微信" : "Scan to add WeCom"}
          </div>
          <div className="overflow-hidden rounded-2xl border border-orange-100 bg-[#fff9f1]">
            <Image
              src={siteConfig.wecomImage}
              alt={isZh ? "企业微信支持二维码" : "WeCom support QR code"}
              width={720}
              height={1200}
              className="h-auto w-full"
            />
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            {isZh
              ? "如果你在付款、登录或生图过程中遇到问题，可以直接通过企业微信联系我。"
              : "If you run into questions about billing, sign-in, or image generation, you can reach me directly on WeCom."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SupportContactPanel({
  locale,
  compact = false,
}: {
  locale: "en" | "zh";
  compact?: boolean;
}) {
  const isZh = locale === "zh";

  return (
    <div className={`rounded-[28px] border border-orange-100 bg-[linear-gradient(135deg,#fffdf8_0%,#fff6ed_100%)] shadow-[0_20px_60px_rgba(255,107,44,0.08)] ${compact ? "p-6" : "p-8 md:p-10"}`}>
      <div className={`grid gap-6 ${compact ? "lg:grid-cols-[1.05fr_0.95fr]" : "lg:grid-cols-[1.1fr_0.9fr]"}`}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
            <MessageCircleMore className="h-4 w-4" />
            {isZh ? "需要人工支持？" : "Need direct help?"}
          </div>
          <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            {isZh ? "付款、账号或生成问题，都可以直接联系我" : "Reach me directly for billing, account, or generation help"}
          </h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              {isZh
                ? "如果你在套餐选择、支付失败、登录恢复、分辨率权限或生成异常上遇到问题，不需要反复猜测系统状态。最快的方式是直接通过企业微信联系我。"
                : "If you run into questions about plan choice, payment failures, sign-in recovery, resolution access, or generation errors, the fastest path is to contact me directly on WeCom."}
            </p>
            <p>
              {isZh
                ? "对于付款相关页面，我们会把这条联系路径放得更明显，方便你在真正需要帮助时快速找到人工支持。"
                : "We keep this support path especially visible on pricing and payment-related pages so you can reach a human quickly when it matters."}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={siteConfig.wecomLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#ff6b2c] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.22)] transition-colors hover:bg-[#f86120]"
            >
              {isZh ? "打开企业微信联系我" : "Open WeCom contact"}
            </a>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50"
            >
              {isZh ? "发送邮件" : "Send email"}
            </a>
          </div>
        </div>

        <a
          href={siteConfig.wecomLink}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="group block"
        >
          <div className="overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_20px_60px_rgba(235,145,71,0.12)] transition-transform group-hover:-translate-y-1">
            <Image
              src={siteConfig.wecomImage}
              alt={isZh ? "企业微信支持二维码" : "WeCom support QR code"}
              width={720}
              height={1200}
              className="h-auto w-full"
            />
          </div>
        </a>
      </div>
    </div>
  );
}
