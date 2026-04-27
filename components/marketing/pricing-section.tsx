"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, Zap, Crown, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
    ALL_PLANS,
    CREDITS_PER_GENERATION,
    calculateCostPerGeneration,
    calculateDiscount,
    getLocalizedPlan,
    PricingPlan
} from "@/config/pricing";

interface PricingSectionProps {
    locale: string;
}

// 限时倒计时组件 - 永远显示紧迫感
function DiscountTimer({ locale }: { locale: string }) {
    const [time, setTime] = useState({ hours: 4, minutes: 59, seconds: 59 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    // 重置倒计时
                    return { hours: 4, minutes: 59, seconds: 59 };
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
        <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-[#fff3e7] px-3 py-1.5 text-xs font-medium text-orange-700">
            <Clock className="w-3.5 h-3.5" />
            <span>{locale === 'zh' ? '限时优惠' : 'Offer ends in'}</span>
            <span className="font-mono font-bold text-orange-600">
                {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>
        </div>
    );
}

export function PricingSection({ locale }: PricingSectionProps) {
    const t = useTranslations('Pricing');
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

    const handlePurchase = async (plan: PricingPlan) => {
        try {
            setLoadingPlanId(plan.id);

            const formData = new FormData();
            formData.append('priceId', plan.productId);
            formData.append('productType', plan.type === 'subscription' ? 'subscription' : 'credits');

            if (plan.credits) {
                formData.append('credits', plan.credits.toString());
            }

            const successUrl = new URL(window.location.href);
            successUrl.pathname = `/${locale}/create`;
            successUrl.searchParams.set('checkout', 'success');
            formData.append('redirectUrl', successUrl.toString());

            const response = await fetch('/api/creem/checkout', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: locale === 'zh' ? '请先登录' : 'Sign in first',
                        description: locale === 'zh'
                            ? '登录后即可继续购买并解锁更高分辨率。'
                            : 'Please sign in before purchasing and unlocking higher resolutions.',
                    });
                    window.location.href = `/${locale}/sign-in?next=${encodeURIComponent(window.location.pathname)}`;
                    return;
                }
                throw new Error(data.error || 'Checkout failed');
            }

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                toast({
                    title: locale === 'zh' ? '错误' : 'Error',
                    description: "Failed to initialize checkout.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: locale === 'zh' ? '错误' : 'Error',
                description: "Failed to start payment process.",
                variant: "destructive"
            });
        } finally {
            setLoadingPlanId(null);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    };

    const renderCard = (plan: PricingPlan, index: number) => {
        const localizedPlan = getLocalizedPlan(plan, locale);
        const costPerGen = calculateCostPerGeneration(plan);
        const discount = calculateDiscount(plan);
        const generations = Math.floor(plan.credits / CREDITS_PER_GENERATION);

        const icons = [
            <Zap key="zap" className="w-8 h-8 text-yellow-400" />,
            <Sparkles key="sparkles" className="w-8 h-8 text-indigo-400" />,
            <Crown key="crown" className="w-8 h-8 text-amber-400" />
        ];

        let cardClass = "bg-white border-orange-100 hover:border-orange-200 shadow-[0_20px_50px_rgba(235,145,71,0.08)]";
        let buttonClass = "border border-orange-100 bg-[#fff7ef] text-slate-800 hover:bg-orange-50";

        if (plan.isPopular) {
            cardClass = "bg-[linear-gradient(180deg,#fffaf4_0%,#ffffff_100%)] border-orange-300 shadow-[0_28px_80px_rgba(255,107,44,0.16)] scale-105";
            buttonClass = "bg-[#ff6b2c] text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] hover:bg-[#f86120]";
        }

        return (
            <div
                key={plan.id}
                className={cn(
                    "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
                    cardClass,
                    plan.isPopular && "z-10"
                )}
            >
                {/* Badge */}
                {localizedPlan.displayLabel && (
                    <div className={cn(
                        "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap",
                        discount > 0
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                            : "border border-orange-200 bg-[#fff3e7] text-orange-700"
                    )}>
                        {plan.isPopular && discount > 0
                            ? `${localizedPlan.displayLabel} · SAVE ${discount}%`
                            : localizedPlan.displayLabel}
                    </div>
                )}

                <div className="text-center pt-4">
                    {/* Timer for subscription plans */}
                    {plan.type === 'subscription' && <DiscountTimer locale={locale} />}

                    {/* Icon */}
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff3e7]">
                        {icons[index]}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{localizedPlan.displayName}</h3>
                    <p className="mt-1 text-sm text-slate-500">{localizedPlan.displayDescription}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-center gap-2 my-6">
                    {discount > 0 && (
                        <span className="text-lg text-slate-400 line-through decoration-red-500/70 decoration-2">
                            {formatPrice(plan.originalPrice)}
                        </span>
                    )}
                    <span className="text-4xl font-extrabold text-slate-900">{formatPrice(plan.price)}</span>
                    {plan.interval && (
                        <span className="text-sm text-slate-500">
                            /{plan.interval === 'month' ? (locale === 'zh' ? '月' : 'mo') : (locale === 'zh' ? '年' : 'yr')}
                        </span>
                    )}
                </div>

                {localizedPlan.displayPriceNote && (
                    <p className="mb-5 text-center text-xs text-slate-500">
                        {localizedPlan.displayPriceNote}
                    </p>
                )}

                {/* Credits Highlight */}
                <div className="mb-6 rounded-2xl border border-orange-100 bg-[#fff7ef] p-4 text-center">
                    <span className="block text-3xl font-bold text-slate-900">{plan.credits.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">
                        {locale === 'zh' ? '积分' : 'Credits'} ({generations} {locale === 'zh' ? '张图' : 'Images'})
                    </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                    {localizedPlan.displayFeatures.map((feature: string) => (
                        <li key={feature} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* Cost per image */}
                <div className="mb-4 rounded-lg bg-[#fffaf4] py-2 text-center">
                    <span className="text-xs text-slate-500">
                        {locale === 'zh' ? '单张成本：' : 'Per image: '}
                    </span>
                    <span className={cn(
                        "font-bold text-sm",
                        plan.isPopular ? "text-orange-600" : "text-slate-700"
                    )}>
                        ${costPerGen.toFixed(3)}
                    </span>
                </div>

                {/* CTA */}
                <Button
                    className={cn(
                        "w-full font-bold h-12 text-md transition-transform active:scale-95",
                        buttonClass
                    )}
                    onClick={() => handlePurchase(plan)}
                    disabled={!!loadingPlanId}
                >
                    {loadingPlanId === plan.id ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : plan.type === 'subscription' ? (
                        plan.interval === 'year'
                            ? (locale === 'zh' ? '锁定年付优惠' : 'Lock Annual Savings')
                            : (locale === 'zh' ? '立即订阅' : 'Subscribe Now')
                    ) : (
                        locale === 'zh' ? '立即买断' : 'Buy Once'
                    )}
                </Button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <Check className="w-3 h-3" />
                    <span>Secure Payment via Creem</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-16">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-[#fff3e7] px-4 py-2 text-sm text-orange-700">
                    <Sparkles className="w-4 h-4" />
                    {locale === 'zh' ? '🎉 首发特惠' : '🎉 Launch Special'}
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    {locale === 'zh' ? '简单透明的定价' : 'Simple, Transparent Pricing'}
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-slate-600">
                    {locale === 'zh'
                        ? '选择适合你的套餐，立即开始 AI 图像创作'
                        : 'Choose the plan that fits your needs. No hidden fees.'}
                </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {ALL_PLANS.map((plan, index) => renderCard(plan, index))}
            </div>

            {/* Bottom note */}
            <div className="mt-12 space-y-2 text-center">
                <p className="text-sm text-slate-600">
                    {locale === 'zh' ? '💰 所有套餐积分永久有效，无过期限制' : '💰 All credits never expire'}
                </p>
                <p className="text-xs text-slate-400">
                    {locale === 'zh' ? '支持 Visa、Mastercard、PayPal' : 'Visa, Mastercard, PayPal accepted'}
                </p>
            </div>
        </div>
    );
}

export default PricingSection;
