"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PricingPlan } from "@/config/pricing";
import { PaymentProviderPanel } from "@/components/payment/payment-provider-panel";

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PricingPlan | null;
  locale: string;
  returnPath: string;
  source: "pricing" | "quick_refill";
};

export function PaymentDialog({
  open,
  onOpenChange,
  plan,
  locale,
  returnPath,
  source,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {locale === "zh" ? "选择支付方式" : "Choose a payment method"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {locale === "zh"
              ? "Stripe 作为默认主支付方式，Creem 作为备用支付渠道。"
              : "Stripe is the primary checkout, while Creem remains available as an alternative."}
          </DialogDescription>
        </DialogHeader>

        {plan ? (
          <PaymentProviderPanel
            plan={plan}
            locale={locale}
            returnPath={returnPath}
            source={source}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
