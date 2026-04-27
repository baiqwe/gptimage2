"use client";

import {
    CreditCard,
    Package2,
    AlertCircle,
    Clock,
    Ban,
    LucideIcon,
} from "lucide-react";
import { SubscriptionPortalDialog } from "./subscription-portal-dialog";

type StatusConfig = {
    color: string;
    icon: LucideIcon;
    message: string;
    iconColor: string;
};

// 辅助函数：格式化日期
function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
}

function isFutureDate(date: string) {
    return new Date(date) > new Date();
}

function getStatusConfig(
    status: string,
    current_period_end: string
): StatusConfig {
    const inGracePeriod = isFutureDate(current_period_end);

    // 状态配置映射
    const configs: Record<string, StatusConfig> = {
        active: {
            color: "text-green-500",
            icon: Package2,
            message: `Renews on ${formatDate(current_period_end)}`,
            iconColor: "text-green-500",
        },
        trialing: {
            color: "text-primary",
            icon: Clock,
            message: `Trial ends on ${formatDate(current_period_end)}`,
            iconColor: "text-primary",
        },
        canceled: {
            color: inGracePeriod ? "text-yellow-500" : "text-destructive",
            icon: Ban,
            message: inGracePeriod
                ? `Access until ${formatDate(current_period_end)}`
                : `Ended on ${formatDate(current_period_end)}`,
            iconColor: inGracePeriod ? "text-yellow-500" : "text-destructive",
        },
        past_due: {
            color: "text-orange-500",
            icon: AlertCircle,
            message: "Payment past due",
            iconColor: "text-orange-500",
        },
        unpaid: {
            color: "text-destructive",
            icon: AlertCircle,
            message: "Payment failed",
            iconColor: "text-destructive",
        },
    };

    return (
        configs[status] || {
            color: "text-muted-foreground",
            icon: AlertCircle,
            message: "No active plan",
            iconColor: "text-muted-foreground",
        }
    );
}

type SubscriptionStatusCardProps = {
    subscription?: {
        status: string;
        current_period_end: string;
    } | null;
    locale?: string;
};

export function SubscriptionStatusCard({
    subscription,
    locale = "en",
}: SubscriptionStatusCardProps) {
    return (
        <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
            <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#fff3ea] p-3">
                    <CreditCard className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Subscription Status</p>
                    {subscription ? (
                        <h3
                            className={`text-2xl font-bold capitalize mt-1 ${getStatusConfig(
                                subscription.status,
                                subscription.current_period_end
                            ).color
                                }`}
                        >
                            {subscription.status}
                        </h3>
                    ) : (
                        <h3 className="mt-1 text-2xl font-bold text-slate-700">
                            Free Plan
                        </h3>
                    )}
                </div>
            </div>
            {subscription && (
                <div className="mt-4 flex items-center text-sm gap-2">
                    <span className="text-slate-600">
                        {getStatusConfig(subscription.status, subscription.current_period_end).message}
                    </span>
                </div>
            )}
            <div className="mt-4">
                <SubscriptionPortalDialog locale={locale} />
            </div>
        </div>
    );
}
