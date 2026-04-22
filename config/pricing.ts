// ============================================
// GPT Image 2 Generator 定价策略
// 核心：10积分/张，高额锚定原价，制造紧迫感
// ============================================

// 每次生成消耗积分数
export const CREDITS_PER_GENERATION = 10;

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
    productId: string;       // Creem Product ID
    badge?: string;
    badgeZh?: string;
    isPopular?: boolean;
    priceNote?: string;
    priceNoteZh?: string;
    features: string[];
    featuresZh: string[];
}

// 单次包 - Starter
export const PLAN_STARTER: PricingPlan = {
    id: 'starter',
    name: 'Pay Once',
    nameZh: '一次买断',
    description: 'Good for a quick project',
    descriptionZh: '适合一个短期项目',
    price: 9.99,
    originalPrice: 19.99,
    credits: 400,            // 40张
    type: 'one_time',
    productId: 'prod_5zsJuy4XoAHe7vdPJXWeWA',
    badge: 'Good for a quick project',
    badgeZh: '适合快速项目',
    features: [
        '400 Credits (40 Images)',
        'Best for one-off image needs',
        'Commercial License',
        'Never Expires'
    ],
    featuresZh: [
        '400 积分（40 张图）',
        '适合一次性图片需求',
        '商用授权',
        '永不过期'
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
    credits: 1000,           // 100张
    type: 'subscription',
    interval: 'month',
    productId: 'prod_5dlhcPKZ6PGN0BcjgDxymV',
    badge: 'Most Flexible',
    badgeZh: '灵活升级',
    features: [
        '1,000 Credits/Month (100 Images)',
        'Priority Generation',
        'Commercial Use Included',
        'Ideal for recurring client work'
    ],
    featuresZh: [
        '每月 1,000 积分（100 张图）',
        '优先生成队列',
        '包含商用授权',
        '适合持续型创作需求'
    ]
};

// 年卡 - Pro Yearly (高利润)
export const PLAN_PRO_YEARLY: PricingPlan = {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    nameZh: '专业年付',
    description: 'Best value for long-term creators',
    descriptionZh: '最适合长期创作团队',
    price: 149.99,
    originalPrice: 239.88,
    credits: 12000,          // 1200张/年
    type: 'subscription',
    interval: 'year',
    productId: 'prod_4QnIT6F1UW5MRQJDlvvyx',
    badge: 'Best Value',
    badgeZh: '最佳选择',
    isPopular: true,
    priceNote: 'Billed annually at $149.99 ($12.49/month)',
    priceNoteZh: '按年支付 $149.99（约 $12.49 / 月）',
    features: [
        '12,000 Credits/Year (1,200 Images)',
        'Equivalent to 100 images/month value',
        'Highest Priority',
        'Best price per image'
    ],
    featuresZh: [
        '年度 12,000 积分（1,200 张图）',
        '折合每月 100 张图的额度价值',
        '最高优先级',
        '单张成本最低'
    ]
};

// 所有套餐
export const ALL_PLANS = [PLAN_STARTER, PLAN_PRO_MONTHLY, PLAN_PRO_YEARLY];

// 兼容旧代码的别名
export const PLAN_MINI = PLAN_STARTER;
export const PLAN_ANCHOR = PLAN_PRO_YEARLY;

// 计算单张成本
export function calculateCostPerGeneration(plan: PricingPlan): number {
    const generations = plan.credits / CREDITS_PER_GENERATION;
    return plan.price / generations;
}

// 计算折扣百分比
export function calculateDiscount(plan: PricingPlan): number {
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
