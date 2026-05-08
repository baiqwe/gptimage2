"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink, Gift, QrCode, Sparkles } from "lucide-react";

type ShareRewardLocale = "zh" | "en";

interface ShareRewardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    locale?: ShareRewardLocale;
}

interface ShareRewardCtaProps {
    locale?: ShareRewardLocale;
    variant?: "success" | "refill" | "dashboard";
    onClick: () => void;
    className?: string;
}

const SHARE_REWARD_COPY = {
    zh: {
        title: "免费领 30 积分！",
        subtitle: "分享你的 AI 灵感，解锁更多算力",
        stepsLabel: "活动规则",
        steps: [
            {
                title: "生成并发布",
                lines: [
                    "先用站内生成一张图，再发布到小红书。",
                    "内容里请带上 GPT Image 2 和网站地址。",
                ],
            },
            {
                title: "提交材料",
                lines: [
                    "发送小红书帖子链接",
                    "发送发帖截图",
                    "发送注册邮箱",
                ],
            },
            {
                title: "审核发放",
                lines: [
                    "每个账号仅限 1 次",
                    "审核通过后 24 小时内发放",
                ],
            },
        ],
        rulesLabel: "活动规则",
        rules: [
            "目前仅支持小红书晒单，不包含朋友圈。",
            "每个账号仅可领取 1 次，重复提交不重复发放。",
            "纯搬运、无产品信息、无帖子链接或明显作弊内容不通过审核。",
        ],
        qrTitle: "扫码添加企业微信",
        qrCaption: "添加后发送：帖子链接 + 发帖截图 + 注册邮箱",
        primaryButton: "打开企业微信",
        secondaryButton: "我知道了",
        ctaButton: "查看活动规则",
        successTitle: "晒出这张图，免费领 30 积分",
        successDescription: "把作品发到小红书，带上 GPT Image 2 和网站链接，审核通过后赠送 30 积分。",
        refillTitle: "暂时不想购买？",
        refillDescription: "发一条小红书晒单，审核通过后可领 30 积分，再继续生成。",
        dashboardTitle: "分享作品赚 30 积分",
        dashboardDescription: "发布小红书晒单并提交审核，积分会发回你的账号。",
    },
    en: {
        title: "Share your work and earn 30 credits",
        subtitle: "Post your generated work on Xiaohongshu and get 30 credits after review.",
        stepsLabel: "How it works",
        steps: [
            {
                title: "Generate and post",
                lines: [
                    "Create a result you like inside GPT Image 2.",
                    "Post it to Xiaohongshu and mention GPT Image 2 or the site name.",
                ],
            },
            {
                title: "Submit materials",
                lines: [
                    "Send the Xiaohongshu post link",
                    "Send a screenshot of the post",
                    "Send your registered email",
                ],
            },
            {
                title: "Review and reward",
                lines: [
                    "Each account can claim once",
                    "Approved rewards are added within 24 hours",
                ],
            },
        ],
        rulesLabel: "Rules",
        rules: [
            "This reward currently supports Xiaohongshu posts only.",
            "Each account can claim this reward once.",
            "Low-quality reposts, missing product mentions, or invalid links will not be approved.",
        ],
        qrTitle: "Scan to add WeCom",
        qrCaption: "Send your email, Xiaohongshu link, and screenshot after adding us.",
        primaryButton: "Open WeCom",
        secondaryButton: "Got it",
        ctaButton: "View rules",
        successTitle: "Share this image and earn 30 credits",
        successDescription: "Post it to Xiaohongshu with GPT Image 2 and submit the link for review.",
        refillTitle: "Not ready to buy yet?",
        refillDescription: "Post a Xiaohongshu review and get 30 credits after approval.",
        dashboardTitle: "Share your work for 30 credits",
        dashboardDescription: "Publish a Xiaohongshu post and send it in for manual review.",
    },
} as const;

function getShareRewardCopy(locale: ShareRewardLocale) {
    return SHARE_REWARD_COPY[locale] ?? SHARE_REWARD_COPY.zh;
}

export function ShareRewardModal({
    open,
    onOpenChange,
    locale = "zh",
}: ShareRewardModalProps) {
    const copy = getShareRewardCopy(locale);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[min(92vw,920px)] max-h-[84vh] overflow-y-auto border-orange-100 bg-[linear-gradient(180deg,#fffdf9_0%,#fff7ef_100%)] p-0 sm:max-w-[920px]">
                <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="p-6 sm:p-7">
                        <DialogHeader className="text-left">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                                <Gift className="h-4 w-4" />
                                Xiaohongshu Reward
                            </div>
                            <DialogTitle className="text-2xl font-bold text-slate-900">
                                {copy.title}
                            </DialogTitle>
                            <DialogDescription className="mt-2 max-w-xl text-base font-medium leading-7 text-slate-700">
                                {copy.subtitle}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 grid gap-4">
                            <section className="rounded-[24px] border border-orange-100 bg-[linear-gradient(135deg,#fff9f2_0%,#ffffff_100%)] p-5 shadow-[0_14px_30px_rgba(255,107,44,0.08)]">
                                <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Sparkles className="h-4 w-4 text-orange-500" />
                                    {copy.stepsLabel}
                                </div>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {copy.steps.map((step, index) => (
                                        <div
                                            key={step.title}
                                            className="rounded-[22px] border border-orange-100 bg-white/95 p-4"
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-sm font-semibold text-[#2f6fee]">
                                                {index + 1}
                                            </span>
                                                <span className="text-base font-semibold text-slate-900">{step.title}</span>
                                            </div>
                                            <ul className="space-y-2.5 text-sm leading-6 text-slate-600">
                                                {step.lines.map((line) => (
                                                    <li key={line} className="flex gap-2.5">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-[24px] border border-orange-100 bg-[#fffaf4] p-5">
                                <div className="mb-3 text-sm font-semibold text-slate-900">
                                    {copy.rulesLabel}
                                </div>
                                <ul className="space-y-2.5 text-sm leading-7 text-slate-600">
                                    {copy.rules.map((rule) => (
                                        <li key={rule} className="flex gap-3">
                                            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="border-t border-orange-100 bg-white/80 p-6 lg:border-l lg:border-t-0 lg:p-7">
                        <div className="flex h-full flex-col rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_18px_44px_rgba(235,145,71,0.12)]">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <QrCode className="h-4 w-4 text-orange-500" />
                                {copy.qrTitle}
                            </div>

                            <div className="overflow-hidden rounded-[24px] border border-orange-100 bg-[#fff9f1]">
                                <Image
                                    src={siteConfig.wecomImage}
                                    alt={locale === "zh" ? "分享活动企业微信二维码" : "WeCom QR code for share reward"}
                                    width={720}
                                    height={1200}
                                    className="h-auto w-full"
                                    sizes="(max-width: 1024px) 100vw, 380px"
                                />
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {copy.qrCaption}
                            </p>

                            <div className="mt-5 flex flex-col gap-3">
                                <a
                                    href={siteConfig.wecomLink}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="w-full"
                                >
                                    <Button className="h-12 w-full rounded-2xl bg-[#ff6b2c] text-white hover:bg-[#f86120]">
                                        {copy.primaryButton}
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </a>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12 rounded-2xl border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {copy.secondaryButton}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ShareRewardCta({
    locale = "zh",
    variant = "success",
    onClick,
    className,
}: ShareRewardCtaProps) {
    if (locale !== "zh") {
        return null;
    }

    const copy = getShareRewardCopy(locale);

    if (variant === "dashboard") {
        return (
            <div className={cn("mt-4 rounded-[18px] border border-dashed border-orange-200 bg-[#fffaf4] px-4 py-3", className)}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-900">{copy.dashboardTitle}</p>
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                        onClick={onClick}
                    >
                        {copy.ctaButton}
                    </Button>
                </div>
            </div>
        );
    }

    if (variant === "refill") {
        return (
            <div className={cn("mt-5 rounded-[22px] border border-orange-100 bg-[#fffaf4] p-4", className)}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{copy.refillTitle}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{copy.refillDescription}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                        onClick={onClick}
                    >
                        {copy.ctaButton}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("rounded-[24px] border border-orange-100 bg-[linear-gradient(135deg,#fffaf4_0%,#fff2e8_100%)] p-4 shadow-[0_12px_34px_rgba(255,107,44,0.08)]", className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900">{copy.successTitle}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{copy.successDescription}</p>
                </div>
                <Button
                    type="button"
                    className="shrink-0 rounded-2xl bg-[#ff6b2c] text-white hover:bg-[#f86120]"
                    onClick={onClick}
                >
                    {copy.ctaButton}
                </Button>
            </div>
        </div>
    );
}
