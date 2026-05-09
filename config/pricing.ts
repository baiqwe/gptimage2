// ============================================
// GPT Image 2 Generator 定价策略
// 核心：1K = 10 积分，2K = 20 积分，4K = 40 积分
// ============================================

import type { ResolutionOption } from "@/config/gpt-image";

// 1K 标准图单次消耗积分数
export const CREDITS_PER_GENERATION = 10;

export const RESOLUTION_CREDIT_MULTIPLIERS: Record<ResolutionOption, number> = {
    "1K": 1,
    "2K": 2,
    "4K": 4,
};

// 定价套餐接口
export interface PricingPlan {
    id: string;
    name: string;
    nameZh: string;
    description: string;
    descriptionZh: string;
    price: number;           // 实际价格
    originalPrice: number;   // 锚定原价（划线）
    credits: number;
    type: 'one_time' | 'subscription';
    interval?: 'month' | 'year';
    productId: string;       // Legacy Creem Product ID
    badge?: string;
    badgeZh?: string;
    isPopular?: boolean;
    discountOverride?: number;
    priceNote?: string;
    priceNoteZh?: string;
    features: string[];
    featuresZh: string[];
}

export type BillingProvider = "stripe" | "creem";
export type PricingPlanId = PricingPlan["id"];

// 单次包 - Starter
export const PLAN_STARTER: PricingPlan = {
    id: 'starter',
    name: 'Pay Once',
    nameZh: '一次买断',
    description: 'Good for a quick project',
    descriptionZh: '适合一个短期项目',
    price: 9.99,
    originalPrice: 19.99,
    credits: 1000,
    type: 'one_time',
    productId: 'prod_7bP8ivuMhl76frU67YaQUQ',
    badge: 'Good for a quick project',
    badgeZh: '适合快速项目',
    features: [
        '1,000 standard-image credits',
        '1K: 10 credits · 2K: 20 · 4K: 40',
        'Commercial use included',
        'Never expires'
    ],
    featuresZh: [
        '1,000 标准图积分',
        '1K 每张 10 分 · 2K 每张 20 分 · 4K 每张 40 分',
        '包含商用授权',
        '一次性积分永不过期'
    ]
};

// 月卡 - Pro Monthly (主推)
export const PLAN_PRO_MONTHLY: PricingPlan = {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    nameZh: '专业月卡',
    description: 'The smoothest upgrade for steady usage',
    descriptionZh: '最平滑的持续升级方案',
    price: 19.99,
    originalPrice: 39.99,
    credits: 5000,
    type: 'subscription',
    interval: 'month',
    productId: 'prod_XthXgy0iASIXG84KRQOBb',
    badge: 'Most Flexible',
    badgeZh: '灵活升级',
    features: [
        '5,000 standard-image credits / month',
        '1K: 10 credits · 2K: 20 · 4K: 40',
        'Priority Generation',
        'Commercial use included'
    ],
    featuresZh: [
        '每月 5,000 标准图积分',
        '1K 每张 10 分 · 2K 每张 20 分 · 4K 每张 40 分',
        '优先生成队列',
        '包含商用授权'
    ]
};

// 年卡 - Pro Yearly (高利润)
export const PLAN_PRO_YEARLY: PricingPlan = {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    nameZh: '专业年付',
    description: 'Best value for long-term creators',
    descriptionZh: '最适合长期创作团队',
    price: 189.99,
    originalPrice: 239.88,
    credits: 60000,
    type: 'subscription',
    interval: 'year',
    productId: 'prod_2o3W4tsUlKR6BbpNbGOp2g',
    badge: 'Best Value',
    badgeZh: '最佳选择',
    isPopular: true,
    priceNote: 'Billed annually at $189.99 ($15.83/month)',
    priceNoteZh: '按年支付 $189.99（约 $15.83 / 月）',
    features: [
        '60,000 standard-image credits / year',
        '1K: 10 credits · 2K: 20 · 4K: 40',
        'Highest Priority',
        'Save 21% vs monthly billing'
    ],
    featuresZh: [
        '每年 60,000 标准图积分',
        '1K 每张 10 分 · 2K 每张 20 分 · 4K 每张 40 分',
        '最高优先级',
        '相对月付节省 21%'
    ]
};

// 所有套餐
export const ALL_PLANS = [PLAN_STARTER, PLAN_PRO_MONTHLY, PLAN_PRO_YEARLY];

export function getPlanById(planId: string): PricingPlan | undefined {
    return ALL_PLANS.find((plan) => plan.id === planId);
}

export function getCreemProductId(planId: string): string | null {
    return getPlanById(planId)?.productId ?? null;
}

export function getStripePriceId(planId: string): string | null {
    switch (planId) {
        case PLAN_STARTER.id:
            return process.env.STRIPE_PRICE_STARTER_ID || null;
        case PLAN_PRO_MONTHLY.id:
            return process.env.STRIPE_PRICE_PRO_MONTHLY_ID || null;
        case PLAN_PRO_YEARLY.id:
            return process.env.STRIPE_PRICE_PRO_YEARLY_ID || null;
        default:
            return null;
    }
}

export function getPlanByStripePriceId(priceId: string): PricingPlan | undefined {
    return ALL_PLANS.find((plan) => getStripePriceId(plan.id) === priceId);
}

// 兼容旧代码的别名
export const PLAN_MINI = PLAN_STARTER;
export const PLAN_ANCHOR = PLAN_PRO_YEARLY;

export function getCreditsPerImage(resolution: ResolutionOption = "1K"): number {
    return CREDITS_PER_GENERATION * RESOLUTION_CREDIT_MULTIPLIERS[resolution];
}

export function getCreditsRequired(
    resolution: ResolutionOption = "1K",
    count: number = 1
): number {
    return getCreditsPerImage(resolution) * Math.max(count, 1);
}

export function getEstimatedStandardImages(plan: PricingPlan): number {
    return Math.floor(plan.credits / CREDITS_PER_GENERATION);
}

// 计算 1K 标准图等价单次成本
export function calculateCostPerGeneration(plan: PricingPlan): number {
    const generations = getEstimatedStandardImages(plan);
    return plan.price / generations;
}

// 计算折扣百分比
export function calculateDiscount(plan: PricingPlan): number {
    if (typeof plan.discountOverride === 'number') {
        return plan.discountOverride;
    }
    if (plan.originalPrice <= plan.price) return 0;
    return Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);
}

// 获取本地化套餐信息
export function getLocalizedPlan(plan: PricingPlan, locale: string) {
    const isZh = locale === 'zh';
    return {
        ...plan,
        displayName: isZh ? plan.nameZh : plan.name,
        displayLabel: isZh ? plan.badgeZh : plan.badge,
        displayDescription: isZh ? plan.descriptionZh : plan.description,
        displayPriceNote: isZh ? plan.priceNoteZh : plan.priceNote,
        displayFeatures: isZh ? plan.featuresZh : plan.features,
    };
}
