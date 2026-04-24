"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, Wand2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AdaptiveAuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locale: "en" | "zh";
}

export function AdaptiveAuthModal({
  isOpen,
  onOpenChange,
  locale,
}: AdaptiveAuthModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const localePrefix = `/${locale}`;

  const title =
    locale === "zh" ? "登录后即可开始生成" : "Sign in to start creating";
  const description =
    locale === "zh"
      ? "登录后可立即使用免费额度，保存结果，并继续你的图像工作流。"
      : "Sign in to use your free credits, save results, and continue your image workflow.";

  const content = (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-orange-100 bg-[linear-gradient(180deg,#fffaf4_0%,#fff3e9_100%)] p-5 shadow-[0_20px_60px_rgba(255,107,44,0.08)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b2c] text-white shadow-[0_12px_24px_rgba(255,107,44,0.26)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            {locale === "zh" ? "免费试用" : "Free credits"}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-900">
            {locale === "zh"
              ? "创建账号后即可使用免费试用额度"
              : "Create an account to unlock free trial credits"}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            {locale === "zh"
              ? "你当前的提示词和设置会保留，登录后回来就能继续生成。"
              : "Your prompt and current settings stay in place, so you can come back and generate right away."}
          </p>
        </div>
      </div>

      <div className="grid gap-3 text-sm text-slate-600">
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Wand2 className="mt-0.5 h-4 w-4 text-orange-500" />
          <span>
            {locale === "zh"
              ? "继续当前文生图或图生图流程，不会丢失已填写的内容。"
              : "Continue your text-to-image or image-to-image flow without losing what you already entered."}
          </span>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-orange-500" />
          <span>
            {locale === "zh"
              ? "登录后可保存结果、查看积分并进入付款与管理流程。"
              : "Save outputs, view credits, and unlock billing and account management after signing in."}
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        <Button asChild className="h-12 rounded-2xl bg-[#ff6b2c] text-base font-semibold text-white shadow-[0_16px_30px_rgba(255,107,44,0.24)] hover:bg-[#f86120]">
          <Link href={`${localePrefix}/sign-up`}>
            {locale === "zh" ? "免费注册并继续" : "Create account and continue"}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-2xl border-orange-200 bg-white text-slate-700 hover:bg-orange-50">
          <Link href={`${localePrefix}/sign-in`}>
            {locale === "zh" ? "我已有账号，去登录" : "I already have an account"}
          </Link>
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[520px] rounded-[28px] border border-orange-100 bg-[#fffdf9] p-6 shadow-[0_30px_120px_rgba(255,107,44,0.18)]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600">
              {description}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-orange-100 bg-[#fffdf9] px-5 pb-8 pt-6 shadow-[0_-20px_80px_rgba(15,23,42,0.18)]"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="text-2xl font-semibold text-slate-900">
            {title}
          </SheetTitle>
          <SheetDescription className="text-sm leading-6 text-slate-600">
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="max-h-[78vh] overflow-y-auto pb-2">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AdaptiveAuthModal;
