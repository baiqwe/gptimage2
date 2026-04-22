import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sparkles, Lock, Zap, Palette, Smartphone, Printer, Heart, ArrowRight, Star } from 'lucide-react';
import { PricingSection } from '@/components/marketing/pricing-section';

interface HomeStaticContentProps {
    locale: string;
}

export default async function HomeStaticContent({ locale }: HomeStaticContentProps) {
    const tHome = await getTranslations({ locale, namespace: 'home' });
    const tFeatures = await getTranslations({ locale, namespace: 'features' });

    return (
        <div className="bg-[linear-gradient(180deg,#fff9f2_0%,#fff6ed_48%,#fffdf9_100%)]">
            <WhatSection t={tHome} />
            <HowSection t={tHome} />
            <FeaturesSection t={tFeatures} />
            <HomePricingSection locale={locale} />
            <SEOContentSection t={tHome} />
            <FAQSection t={tHome} />
            <CTASection t={tHome} locale={locale} />
        </div>
    );
}

function HomePricingSection({ locale }: { locale: string }) {
    return (
        <section className="border-t border-orange-100 bg-[linear-gradient(180deg,#fff8f0_0%,#fffdf9_100%)] py-16">
            <div className="container px-4 md:px-6">
                <PricingSection locale={locale} />
            </div>
        </section>
    );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">{subtitle}</p>
        </div>
    );
}

function WhatSection({ t }: { t: any }) {
    const cards = [
        { title: t('what.feature_1_title'), desc: t('what.feature_1_desc'), icon: Palette, tone: 'bg-orange-100 text-orange-500' },
        { title: t('what.feature_2_title'), desc: t('what.feature_2_desc'), icon: Heart, tone: 'bg-amber-100 text-amber-500' },
        { title: t('what.feature_3_title'), desc: t('what.feature_3_desc'), icon: Sparkles, tone: 'bg-rose-100 text-rose-500' },
    ];

    return (
        <section className="py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-5xl">
                    <SectionTitle title={t('what.title')} subtitle={t('what.desc')} />
                    <div className="grid gap-6 md:grid-cols-3">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{card.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowSection({ t }: { t: any }) {
    const steps = [
        { number: 1, title: t('how.step_1_title'), desc: t('how.step_1_desc') },
        { number: 2, title: t('how.step_2_title'), desc: t('how.step_2_desc') },
        { number: 3, title: t('how.step_3_title'), desc: t('how.step_3_desc') },
        { number: 4, title: t('how.step_4_title'), desc: t('how.step_4_desc') },
    ];

    return (
        <section className="py-20 bg-white/50">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle title={t('how.title')} subtitle={t('how.subtitle')} />
                    <div className="grid gap-8 md:grid-cols-4">
                        {steps.map((step) => (
                            <div key={step.number} className="relative text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-2xl font-bold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)]">
                                    {step.number}
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{step.desc}</p>
                                {step.number < steps.length && (
                                    <div className="absolute left-full top-8 hidden w-8 -translate-y-1/2 items-center justify-center md:flex">
                                        <ArrowRight className="h-6 w-6 text-orange-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection({ t }: { t: any }) {
    const features = [
        { icon: Lock, title: t('feature_1_title'), desc: t('feature_1_desc'), tone: 'bg-orange-100 text-orange-500' },
        { icon: Zap, title: t('feature_2_title'), desc: t('feature_2_desc'), tone: 'bg-amber-100 text-amber-500' },
        { icon: Palette, title: t('feature_3_title'), desc: t('feature_3_desc'), tone: 'bg-rose-100 text-rose-500' },
        { icon: Sparkles, title: t('feature_4_title'), desc: t('feature_4_desc'), tone: 'bg-pink-100 text-pink-500' },
        { icon: Smartphone, title: t('feature_5_title'), desc: t('feature_5_desc'), tone: 'bg-sky-100 text-sky-500' },
        { icon: Printer, title: t('feature_6_title'), desc: t('feature_6_desc'), tone: 'bg-emerald-100 text-emerald-500' },
    ];

    return (
        <section className="py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle title={t('title')} subtitle={t('subtitle')} />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)] transition-transform hover:-translate-y-1">
                                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FAQSection({ t }: { t: any }) {
    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
    ];

    return (
        <section className="border-t border-orange-100 py-20">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl">
                    <SectionTitle title={t('faq.title')} subtitle={t('faq.subtitle')} />
                    <div className="grid gap-6">
                        {faqs.map((faq) => (
                            <div key={faq.q} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                                <h3 className="text-xl font-bold text-slate-900">{faq.q}</h3>
                                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CTASection({ t, locale }: { t: any; locale: string }) {
    const localePrefix = `/${locale}`;

    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white px-6 py-12 text-center shadow-[0_28px_80px_rgba(235,145,71,0.12)] sm:px-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-[#fff6ef] px-4 py-2 text-sm font-semibold text-orange-700">
                        <Star className="h-4 w-4" />
                        {locale === 'zh' ? '免费试用' : 'Free to Try'}
                    </div>
                    <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {t('cta.title')}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                        {t('cta.subtitle')}
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href={localePrefix}
                            className="rounded-full bg-[#ff6b2c] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,107,44,0.24)] transition-colors hover:bg-[#f86120]"
                        >
                            {t('cta.button_start')}
                        </Link>
                        <Link
                            href={`${localePrefix}/pricing`}
                            className="rounded-full border border-orange-100 bg-[#fffaf4] px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-orange-50"
                        >
                            {t('cta.button_coloring')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SEOContentSection({ t }: { t: any }) {
    return (
        <section className="border-t border-orange-100 bg-white/50 py-20">
            <div className="container max-w-5xl px-4 md:px-6">
                <SectionTitle title={t('seo.comparison_title')} subtitle={t('seo.comparison_intro')} />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <InfoCard emoji="🇨🇳" title={t('seo.compare_chinese')} desc={t('seo.compare_chinese_desc')} />
                    <InfoCard emoji="⚡️" title={t('seo.compare_speed')} desc={t('seo.compare_speed_desc')} />
                    <InfoCard emoji="💰" title={t('seo.compare_price')} desc={t('seo.compare_price_desc')} />
                    <InfoCard emoji="🚀" title={t('seo.compare_queue')} desc={t('seo.compare_queue_desc')} />
                </div>

                <div className="mt-16 rounded-[28px] border border-orange-100 bg-white p-8 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                    <h3 className="text-2xl font-bold text-slate-900">{t('seo.video_title')}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{t('seo.video_intro')}</p>
                    <div className="mt-8 space-y-6">
                        <StepItem number={1} title={t('seo.video_step_1')} desc={t('seo.video_step_1_desc')} />
                        <StepItem number={2} title={t('seo.video_step_2')} desc={t('seo.video_step_2_desc')} />
                        <StepItem number={3} title={t('seo.video_step_3')} desc={t('seo.video_step_3_desc')} />
                        <StepItem number={4} title={t('seo.video_step_4')} desc={t('seo.video_step_4_desc')} />
                    </div>
                </div>

                <div className="mt-10 rounded-[28px] border border-orange-100 bg-[#fffaf4] p-8 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
                    <h3 className="text-2xl font-bold text-slate-900">{t('seo.tech_title')}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{t('seo.tech_intro')}</p>
                    <ul className="mt-6 space-y-4">
                        <TechItem title={t('seo.tech_feature_1')} desc={t('seo.tech_feature_1_desc')} />
                        <TechItem title={t('seo.tech_feature_2')} desc={t('seo.tech_feature_2_desc')} />
                        <TechItem title={t('seo.tech_feature_3')} desc={t('seo.tech_feature_3_desc')} />
                        <TechItem title={t('seo.tech_feature_4')} desc={t('seo.tech_feature_4_desc')} />
                    </ul>
                </div>
            </div>
        </section>
    );
}

function InfoCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
    return (
        <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_20px_50px_rgba(235,145,71,0.08)]">
            <div className="text-2xl">{emoji}</div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
        </div>
    );
}

function StepItem({ number, title, desc }: { number: number; title: string; desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                {number}
            </div>
            <div>
                <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
                <p className="mt-1 leading-7 text-slate-600">{desc}</p>
            </div>
        </div>
    );
}

function TechItem({ title, desc }: { title: string; desc: string }) {
    return (
        <li className="flex gap-3 text-slate-700">
            <span className="text-orange-500">❖</span>
            <span>
                <strong className="text-slate-900">{title}:</strong> {desc}
            </span>
        </li>
    );
}
