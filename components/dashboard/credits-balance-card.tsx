import { Coins } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CreditsBalanceCardProps {
    credits: number;
    locale?: string;
}

export function CreditsBalanceCard({ credits, locale = 'en' }: CreditsBalanceCardProps) {
    return (
        <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
            <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#fff3df] p-3">
                    <Coins className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {locale === 'zh' ? '可用积分' : 'Available Credits'}
                    </p>
                    <h3 className="mt-1 text-3xl font-bold text-slate-900">{credits}</h3>
                </div>
            </div>

            <div className="mt-6">
                <Link href={`/${locale}/pricing`}>
                    <Button variant="outline" className="w-full border-orange-200 bg-white text-orange-700 hover:bg-orange-50">
                        {locale === 'zh' ? '购买更多积分' : 'Buy More Credits'}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
