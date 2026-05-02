"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionPortalDialog({ locale = "en" }: { locale?: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleManageSubscription = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/billing/customer-portal");

            if (response.status === 404) {
                toast({
                    title: locale === "zh" ? "暂未开通账单中心" : "No billing portal yet",
                    description: locale === "zh"
                        ? "先购买积分包或订阅，之后就可以在这里管理账单。"
                        : "You can purchase a credits pack or subscription first, then manage billing here.",
                });
                return;
            }

            if (!response.ok) throw new Error("Failed to get portal link");

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            toast({
                title: locale === "zh" ? "打开失败" : "Error",
                description: locale === "zh" ? "暂时无法打开订阅中心" : "Could not open subscription portal",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            className="w-full gap-2 border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
            onClick={handleManageSubscription}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Manage Subscription
        </Button>
    );
}
