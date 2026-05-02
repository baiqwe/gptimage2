"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ALL_PLANS, PLAN_MINI, PLAN_PRO_MONTHLY, PricingPlan } from "@/config/pricing";
import { PaymentProviderPanel } from "@/components/payment/payment-provider-panel";

interface QuickRefillModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath?: string;
}

export function QuickRefillModal({ isOpen, onClose, currentPath }: QuickRefillModalProps) {
    const t = useTranslations('Pricing');
    const pathname = usePathname();
    const locale = pathname?.split("/")[1] === "zh" ? "zh" : "en";
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PLAN_PRO_MONTHLY);
    const returnPath = currentPath || pathname || `/${locale}/create`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">⚡️</span>
                        {t('refill_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('refill_subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-3">
                        {ALL_PLANS.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan)}
                                className={`rounded-2xl border p-4 text-left transition ${selectedPlan.id === plan.id
                                        ? "border-orange-300 bg-[#fff7ef] shadow-[0_12px_28px_rgba(255,107,44,0.12)]"
                                        : "border-slate-200 bg-white hover:border-orange-200 hover:bg-[#fffaf4]"
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold text-slate-900">
                                                {locale === "zh" ? plan.nameZh : plan.name}
                                            </span>
                                            {plan.id === PLAN_PRO_MONTHLY.id ? (
                                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700">
                                                    Recommended
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {plan.type === "subscription"
                                                ? `${plan.credits.toLocaleString()} credits · $${plan.price.toFixed(2)}/${plan.interval === "year" ? "yr" : "mo"}`
                                                : `${plan.credits.toLocaleString()} credits · $${plan.price.toFixed(2)}`}
                                        </p>
                                    </div>
                                    {plan.id === PLAN_PRO_MONTHLY.id ? (
                                        <Zap className="h-5 w-5 text-orange-500" />
                                    ) : null}
                                </div>
                            </button>
                        ))}
                    </div>

                    <PaymentProviderPanel
                        plan={selectedPlan}
                        locale={locale}
                        returnPath={returnPath}
                        source="quick_refill"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
