"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import type { PricingPlan } from "@/config/pricing";
import { getLocalizedPlan } from "@/config/pricing";
import { StripeEmbeddedCheckoutSection } from "@/components/payment/stripe-embedded-checkout";
import { toast } from "@/hooks/use-toast";

type PaymentProviderPanelProps = {
  plan: PricingPlan;
  locale: string;
  returnPath: string;
  source: "pricing" | "quick_refill";
};

export function PaymentProviderPanel({
  plan,
  locale,
  returnPath,
  source,
}: PaymentProviderPanelProps) {
  const [provider, setProvider] = useState<"stripe" | "creem">("stripe");
  const [isCreemLoading, setIsCreemLoading] = useState(false);
  const localizedPlan = getLocalizedPlan(plan, locale);

  const handleCreemCheckout = async () => {
    try {
      setIsCreemLoading(true);

      const successUrl = new URL(window.location.href);
      successUrl.pathname = returnPath;
      successUrl.searchParams.set("checkout", "success");
      successUrl.searchParams.set("provider", "creem");
      successUrl.searchParams.set("plan", plan.id);

      const formData = new FormData();
      formData.append("priceId", plan.productId);
      formData.append("productType", plan.type === "subscription" ? "subscription" : "credits");
      formData.append("credits", String(plan.credits));
      formData.append("redirectUrl", successUrl.toString());

      const response = await fetch("/api/creem/checkout", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: locale === "zh" ? "请先登录" : "Sign in first",
            description:
              locale === "zh"
                ? "登录后即可继续购买并解锁对应权益。"
                : "Please sign in before purchasing and unlocking the related benefits.",
          });
          window.location.href = `/${locale}/sign-in?next=${encodeURIComponent(returnPath)}`;
          return;
        }
        throw new Error(data.error || "Alternative checkout failed");
      }

      if (!data.checkout_url) {
        throw new Error("Missing checkout url");
      }

      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Creem checkout error:", error);
      toast({
        title: locale === "zh" ? "切换备用支付失败" : "Could not open alternative checkout",
        description:
          error instanceof Error
            ? error.message
            : locale === "zh"
              ? "请稍后重试"
              : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCreemLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fffaf4_0%,#ffffff_100%)] p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {locale === "zh" ? "订单摘要" : "Order Summary"}
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{localizedPlan.displayName}</h3>
            <p className="mt-1 text-sm text-slate-600">{localizedPlan.displayDescription}</p>
          </div>
          <Badge className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100">
            {plan.type === "subscription"
              ? locale === "zh"
                ? "持续权益"
                : "Recurring access"
              : locale === "zh"
                ? "一次性购买"
                : "One-time purchase"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-slate-500">{locale === "zh" ? "价格" : "Price"}</p>
            <p className="mt-1 font-semibold text-slate-900">${plan.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">{locale === "zh" ? "积分" : "Credits"}</p>
            <p className="mt-1 font-semibold text-slate-900">{plan.credits.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">{locale === "zh" ? "类型" : "Billing"}</p>
            <p className="mt-1 font-semibold text-slate-900">
              {plan.type === "subscription"
                ? plan.interval === "year"
                  ? locale === "zh"
                    ? "年付订阅"
                    : "Yearly subscription"
                  : locale === "zh"
                    ? "月付订阅"
                    : "Monthly subscription"
                : locale === "zh"
                  ? "一次性积分包"
                  : "One-time credits pack"}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={provider} onValueChange={(value) => setProvider(value as "stripe" | "creem")} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <TabsTrigger
            value="stripe"
            className="rounded-xl py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Stripe</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {locale === "zh" ? "默认推荐" : "Recommended"}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="creem"
            className="rounded-xl py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Creem</span>
              <span className="text-xs text-slate-400">
                {locale === "zh" ? "备用" : "Alternative"}
              </span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-3">
          <p className="text-sm text-slate-600">
            {locale === "zh"
              ? "Stripe 作为主支付渠道，会优先展示卡支付、Apple Pay、Google Pay 以及当前地区可用的其他方式。"
              : "Stripe is the primary checkout. It will show card payments, Apple Pay, Google Pay, and other eligible methods for the current region."}
          </p>
          <StripeEmbeddedCheckoutSection
            plan={plan}
            locale={locale}
            returnPath={returnPath}
            source={source}
          />
        </TabsContent>

        <TabsContent value="creem" className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <h4 className="text-base font-semibold">
                {locale === "zh" ? "备用结账渠道" : "Alternative checkout"}
              </h4>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "如果 Stripe 当前不可用，或者你希望尝试另一条支付流程，可以切换到 Creem 托管结账。支付完成后会自动返回当前站点。"
                : "If Stripe is unavailable right now, or you prefer another flow, you can continue with Creem hosted checkout and return here after payment."}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• {locale === "zh" ? "托管结账，减少前端表单复杂度" : "Hosted checkout to keep the flow simple"}</li>
              <li>• {locale === "zh" ? "支付成功后自动返回当前页面" : "Returns to the current page after payment"}</li>
              <li>• {locale === "zh" ? "适合 Stripe 异常或用户主动备选时使用" : "Useful when Stripe fails or as a user-selected fallback"}</li>
            </ul>

            <Button
              className="mt-5 h-12 w-full gap-2 border border-orange-200 bg-[#fff7ef] text-slate-900 hover:bg-orange-50"
              variant="outline"
              onClick={handleCreemCheckout}
              disabled={isCreemLoading}
            >
              {isCreemLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{locale === "zh" ? "使用 Creem 继续支付" : "Continue with Creem"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
