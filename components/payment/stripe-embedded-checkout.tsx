"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Loader2, CreditCard, Wallet, Smartphone, MoreHorizontal } from "lucide-react";
import type { PricingPlan } from "@/config/pricing";
import { toast } from "@/hooks/use-toast";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type StripeEmbeddedCheckoutProps = {
  plan: PricingPlan;
  locale: string;
  returnPath: string;
  source: "pricing" | "quick_refill";
};

type StripeMethodKey = "card" | "apple_google" | "mobile_wallets" | "more";

const STRIPE_METHODS: Record<
  StripeMethodKey,
  {
    icon: typeof CreditCard;
    label: { en: string; zh: string };
    description: { en: string; zh: string };
  }
> = {
  card: {
    icon: CreditCard,
    label: { en: "Card", zh: "银行卡" },
    description: {
      en: "Best for most international payments and recurring subscriptions.",
      zh: "最适合大多数国际卡支付和自动续费订阅。",
    },
  },
  apple_google: {
    icon: Wallet,
    label: { en: "Apple / Google Pay", zh: "Apple / Google Pay" },
    description: {
      en: "Shown automatically on supported devices and browsers.",
      zh: "会在支持的设备和浏览器中自动显示。",
    },
  },
  mobile_wallets: {
    icon: Smartphone,
    label: { en: "Local wallets", zh: "本地钱包" },
    description: {
      en: "Availability depends on your region, browser, and Stripe account settings.",
      zh: "是否可用取决于地区、浏览器和 Stripe 账户配置。",
    },
  },
  more: {
    icon: MoreHorizontal,
    label: { en: "More", zh: "更多方式" },
    description: {
      en: "Stripe may surface other eligible payment methods when available.",
      zh: "当条件满足时，Stripe 还会自动展示其他可用方式。",
    },
  },
};

export function StripeEmbeddedCheckoutSection({
  plan,
  locale,
  returnPath,
  source,
}: StripeEmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<StripeMethodKey>("card");

  const localizedText = locale === "zh" ? "zh" : "en";

  useEffect(() => {
    let active = true;

    const fetchClientSecret = async () => {
      if (!stripePromise) {
        if (!active) return;
        setError(locale === "zh" ? "Stripe 尚未配置完成" : "Stripe is not configured yet");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setClientSecret(null);

      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
            locale,
            returnPath,
            source,
          }),
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: locale === "zh" ? "请先登录" : "Sign in first",
              description:
                locale === "zh"
                  ? "登录后即可继续付款并解锁对应权益。"
                  : "Please sign in before continuing to payment.",
            });
            window.location.href = `/${locale}/sign-in?next=${encodeURIComponent(returnPath)}`;
            return;
          }

          throw new Error(data.error || "Failed to initialize Stripe checkout");
        }

        if (!active) return;
        setClientSecret(data.clientSecret);
      } catch (checkoutError) {
        console.error("Stripe embedded checkout error:", checkoutError);
        if (!active) return;
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : locale === "zh"
              ? "暂时无法加载 Stripe 支付"
              : "Could not load Stripe checkout"
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchClientSecret();
    return () => {
      active = false;
    };
  }, [locale, plan.id, returnPath, source]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(STRIPE_METHODS).map(([key, method]) => {
            const Icon = method.icon;
            return (
              <div
                key={key}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500"
              >
                <Icon className="h-4 w-4" />
                <span>{method.label[localizedText]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{locale === "zh" ? "正在加载 Stripe 支付…" : "Loading Stripe checkout..."}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clientSecret || !stripePromise) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || (locale === "zh" ? "暂时无法加载 Stripe 支付" : "Could not load Stripe checkout")}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(STRIPE_METHODS).map(([key, method]) => {
            const Icon = method.icon;
            const isActive = activeMethod === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMethod(key as StripeMethodKey)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-orange-200 bg-[#fff7ef] text-orange-700 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{method.label[localizedText]}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            {locale === "zh" ? "方式说明" : "Payment method note"}
          </p>
          <p className="mt-1 leading-6">
            {STRIPE_METHODS[activeMethod].description[localizedText]}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {locale === "zh"
              ? "Stripe 会根据你的地区、设备、浏览器和账户配置自动决定最终可展示的支付方式。"
              : "Stripe automatically decides which payment methods can be shown based on your region, device, browser, and account configuration."}
          </p>
        </div>
      </div>

      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
