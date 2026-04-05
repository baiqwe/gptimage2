// config/site.ts
// 站点全局配置 - 上站时只需修改此文件

export const siteConfig = {
  // === 品牌标识 ===
  name: "GPT Image 2 Generator",                        // 网站名称
  domain: "gptimage2.online",                  // 主域名
  url: "https://gptimage2.online",             // 完整 URL
  author: "GPT Image 2 Generator Team",                 // 作者
  supportEmail: "support@gptimage2.online",    // 联系邮箱

  // === 分析追踪 ===
  gaId: "G-RF6Z4S359Y",                     // Google Analytics ID

  // === 国际化配置 ===
  i18n: {
    locales: ['en', 'zh'] as const,         // 支持的语言列表
    defaultLocale: 'en' as const,           // 默认语言
    baseLocale: 'en' as const,              // 翻译基准语言
  },

  // === PWA 主题 ===
  themeColor: "#f97316",                    // Orange 主题色（匹配新 logo）
  backgroundColor: "#0f172a",               // 深色背景
};

// 类型导出
export type Locale = (typeof siteConfig.i18n.locales)[number];
