"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset?: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  locale?: "en" | "zh";
}

export function TurnstileWidget({
  siteKey,
  locale = "en",
}: TurnstileWidgetProps) {
  const generatedId = useId().replace(/:/g, "");
  const containerId = `turnstile-${generatedId}`;
  const widgetIdRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const [token, setToken] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptLoaded || !window.turnstile || mountedRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
      sitekey: siteKey,
      theme: "light",
      callback: (nextToken) => setToken(nextToken),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });

    mountedRef.current = true;

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      mountedRef.current = false;
      widgetIdRef.current = null;
    };
  }, [containerId, scriptLoaded, siteKey]);

  if (!siteKey) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {locale === "zh"
          ? "Turnstile 尚未配置，当前无法完成注册验证。"
          : "Turnstile is not configured yet, so sign-up verification is unavailable."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        id={containerId}
        className="min-h-[65px] overflow-hidden rounded-2xl border border-orange-100 bg-white px-3 py-2 shadow-sm"
      />
      <input type="hidden" name="turnstile_token" value={token} readOnly />
      <p className="text-xs leading-5 text-slate-500">
        {locale === "zh"
          ? "请先完成人机验证后再提交注册。"
          : "Please complete the human verification before submitting sign-up."}
      </p>
    </div>
  );
}

export default TurnstileWidget;
