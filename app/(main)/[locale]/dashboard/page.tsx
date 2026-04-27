import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { CreditsBalanceCard } from "@/components/dashboard/credits-balance-card";



export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const supabase = await createClient();

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data?.user || null;
    } catch (error) {
        console.error("Error fetching user in dashboard:", error);
    }

    if (!user) {
        return redirect(`/${locale}/sign-in`);
    }

    // 获取客户数据、订阅和积分
    const { data: customerData } = await supabase
        .from("customers")
        .select(
            `
      *,
      subscriptions (
        status,
        current_period_end,
        creem_product_id
      )
    `
        )
        .eq("user_id", user.id)
        .single();

    const subscription = customerData?.subscriptions?.[0];
    const credits = customerData?.credits || 0;

    const welcomeText = locale === 'zh' ? '欢迎回来' : 'Welcome back';
    const manageText = locale === 'zh' ? '在这里管理您的订阅和积分。' : 'Manage your subscription and credits here.';
    const accountText = locale === 'zh' ? '账户信息' : 'Account Information';
    const emailText = locale === 'zh' ? '邮箱' : 'Email';
    const userIdText = locale === 'zh' ? '用户 ID' : 'User ID';

    return (
        <div className="container flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-8">
            {/* Welcome Banner */}
            <div className="rounded-[28px] border border-orange-100 bg-[linear-gradient(135deg,#fffaf4_0%,#fff3e6_100%)] p-6 shadow-[0_20px_60px_rgba(235,145,71,0.12)] sm:p-8">
                <h1 className="mb-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                    {welcomeText}, <span className="text-orange-600">{user.email}</span>
                </h1>
                <p className="text-base text-slate-600">
                    {manageText}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <SubscriptionStatusCard subscription={subscription} locale={locale} />
                <CreditsBalanceCard credits={credits} locale={locale} />
            </div>

            {/* Account Details */}
            <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                <h2 className="mb-4 text-lg font-bold text-slate-900">{accountText}</h2>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-slate-500">{emailText}</p>
                        <p className="font-medium text-slate-900">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">{userIdText}</p>
                        <p className="inline-block rounded bg-[#fff7ef] p-1 font-mono text-xs font-medium text-slate-700">
                            {user.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
