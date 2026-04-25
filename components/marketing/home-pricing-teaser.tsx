import Link from "next/link";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import {
  ALL_PLANS,
  CREDITS_PER_GENERATION,
  calculateCostPerGeneration,
  calculateDiscount,
  getLocalizedPlan,
  type PricingPlan,
} from "@/config/pricing";

interface HomePricingTeaserProps {
  locale: string;
}

const iconMap = {
  starter: <Zap className="h-7 w-7 text-amber-500" />,
  pro_monthly: <Sparkles className="h-7 w-7 text-orange-500" />,
  pro_yearly: <Crown className="h-7 w-7 text-yellow-500" />,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function TeaserCard({
  locale,
  plan,
}: {
  locale: string;
  plan: PricingPlan;
}) {
  const localizedPlan = getLocalizedPlan(plan, locale);
  const generations = Math.floor(plan.credits / CREDITS_PER_GENERATION);
  const discount = calculateDiscount(plan);
  const costPerImage = calculateCostPerGeneration(plan);

  return (
    <div
      className={`rounded-[28px] border p-6 shadow-[0_18px_50px_rgba(235,145,71,0.08)] ${
        plan.isPopular
          ? "border-orange-300 bg-[linear-gradient(180deg,#fffaf4_0%,#ffffff_100%)]"
          : "border-orange-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3e7]">
          {iconMap[plan.id as keyof typeof iconMap]}
        </div>
        {localizedPlan.displayLabel ? (
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
              plan.isPopular
                ? "bg-[#ff6b2c] text-white"
                : "bg-[#fff2e8] text-orange-700"
            }`}
          >
            {localizedPlan.displayLabel}
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {localizedPlan.displayName}
      </h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {localizedPlan.displayDescription}
      </p>

      <div className="mt-5 flex items-end gap-2">
        {discount > 0 ? (
          <span className="text-base text-slate-400 line-through">
            {formatPrice(plan.originalPrice)}
          </span>
        ) : null}
        <span className="text-3xl font-extrabold text-slate-900">
          {formatPrice(plan.price)}
        </span>
        {plan.interval ? (
          <span className="pb-1 text-sm text-slate-500">
            /{plan.interval === "year" ? (locale === "zh" ? "年" : "yr") : locale === "zh" ? "月" : "mo"}
          </span>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-orange-100 bg-[#fffaf4] p-4">
        <p className="text-sm font-semibold text-slate-900">
          {plan.credits.toLocaleString()} {locale === "zh" ? "积分" : "credits"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {generations} {locale === "zh" ? "张图的生成额度" : "image generations included"}
        </p>
        <p className="mt-2 text-xs text-orange-700">
          {locale === "zh" ? "单张成本" : "Per image"} ${costPerImage.toFixed(3)}
        </p>
      </div>

      <ul className="mt-5 space-y-2.5">
        {localizedPlan.displayFeatures.slice(0, 3).map((feature: string) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomePricingTeaser({ locale }: HomePricingTeaserProps) {
  const isZh = locale === "zh";
  const localePrefix = `/${locale}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
          {isZh ? "Pricing snapshot" : "Pricing snapshot"}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {isZh ? "首页只保留轻量价格预览，完整购买流程放到定价页" : "Keep pricing light on the homepage and move purchase logic to the pricing page"}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          {isZh
            ? "这里先帮你快速理解档位差异：一次买断、月付和年付分别适合什么使用频率。真正的结账逻辑放在定价页，可以减少首页的客户端负担。"
            : "Use this section to understand the difference between the one-time plan, the monthly plan, and the yearly option. The full purchase flow lives on the pricing page, which keeps the homepage much lighter."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {ALL_PLANS.map((plan) => (
          <TeaserCard key={plan.id} locale={locale} plan={plan} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href={`${localePrefix}/pricing`}
          className="inline-flex items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]"
        >
          {isZh ? "查看完整定价并购买" : "View full pricing and purchase"}
        </Link>
      </div>
    </div>
  );
}
