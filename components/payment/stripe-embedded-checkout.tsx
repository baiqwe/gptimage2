"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
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

export function StripeEmbeddedCheckoutSection({
  plan,
  locale,
  returnPath,
  source,
}: StripeEmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <p className="mb-4 text-sm leading-6 text-slate-600">
          {locale === "zh"
            ? "Stripe 会根据你的地区、设备、浏览器和账户配置自动展示本次可用的支付方式，例如银行卡、Apple Pay、Google Pay 以及其他本地钱包。"
            : "Stripe automatically shows the payment methods available for this checkout based on your region, device, browser, and account setup, including cards, Apple Pay, Google Pay, and local wallets when eligible."}
        </p>
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
      <p className="mb-4 text-sm leading-6 text-slate-600">
        {locale === "zh"
          ? "Stripe 会根据你的地区、设备、浏览器和账户配置自动展示本次可用的支付方式。下方实际显示的方式，就是当前这次结账可以使用的渠道。"
          : "Stripe automatically shows the payment methods available for this checkout based on your region, device, browser, and account setup. The methods shown below are the ones actually available right now."}
      </p>

      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
