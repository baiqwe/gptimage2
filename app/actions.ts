"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

const SIGNUP_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_SIGNUPS_PER_IP = 3;
const MAX_SIGNUPS_PER_DEVICE = 3;
const BLOCKED_SIGNUP_DOMAINS = new Set([
  "drafterplus.nl",
  ...(process.env.BLOCKED_SIGNUP_EMAIL_DOMAINS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
]);

function getServiceRoleClientSafe() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    return createServiceRoleClient();
  } catch (error) {
    console.error("Failed to create service-role client:", error);
    return null;
  }
}

function resolveLocalePrefix(referer: string | null) {
  if (!referer) return "/en";

  try {
    const pathname = new URL(referer).pathname;
    const maybeLocale = pathname.split("/")[1];
    if (maybeLocale === "zh" || maybeLocale === "en") {
      return `/${maybeLocale}`;
    }
  } catch {
    // ignore invalid referer
  }

  return "/en";
}

function resolveSafeNextPath(
  nextPath: string | null | undefined,
  localePrefix: string,
  fallback: string = "/dashboard"
) {
  if (!nextPath) {
    return `${localePrefix}${fallback}`;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return `${localePrefix}${fallback}`;
  }

  return nextPath;
}

function humanizeAuthError(message: string, locale: "en" | "zh") {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return locale === "zh"
      ? "你的邮箱还没有验证，请先去收件箱点击确认链接，再回来登录。"
      : "Your email is not confirmed yet. Please open the verification email in your inbox, confirm your address, and then sign in again.";
  }

  if (normalized.includes("invalid login credentials")) {
    return locale === "zh"
      ? "邮箱或密码不正确，请检查后重试。"
      : "Your email or password is incorrect. Please check it and try again.";
  }

  if (normalized.includes("user already registered")) {
    return locale === "zh"
      ? "这个邮箱已经注册过了，请直接登录。"
      : "This email is already registered. Please sign in instead.";
  }

  return message;
}

function getEmailDomain(email: string) {
  const parts = email.toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

function hashUserAgent(value: string | null) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex");
}

async function recordSignupAttempt(params: {
  clientIp: string | null;
  deviceId: string | null;
  userAgentHash: string | null;
  emailDomain: string;
  outcome: "blocked_ip" | "blocked_device" | "blocked_domain" | "blocked_config" | "signup_error" | "signup_success";
  metadata?: Record<string, unknown>;
}) {
  try {
    const serviceRole = getServiceRoleClientSafe();
    if (!serviceRole) return;

    await serviceRole.from("signup_attempt_logs").insert({
      client_ip: params.clientIp,
      device_id: params.deviceId,
      user_agent_hash: params.userAgentHash,
      email_domain: params.emailDomain || null,
      outcome: params.outcome,
      metadata: params.metadata || {},
    });
  } catch (error) {
    console.error("Failed to record signup attempt:", error);
  }
}

async function enforceSignupGuards(params: {
  email: string;
  clientIp: string | null;
  deviceId: string | null;
  userAgent: string | null;
  locale: "en" | "zh";
}) {
  const emailDomain = getEmailDomain(params.email);
  const userAgentHash = hashUserAgent(params.userAgent);

  if (!emailDomain) {
    return {
      allowed: false,
      emailDomain,
      userAgentHash,
      message:
        params.locale === "zh"
          ? "请输入有效的邮箱地址。"
          : "Please enter a valid email address.",
      outcome: "blocked_config" as const,
    };
  }

  if (BLOCKED_SIGNUP_DOMAINS.has(emailDomain)) {
    await recordSignupAttempt({
      clientIp: params.clientIp,
      deviceId: params.deviceId,
      userAgentHash,
      emailDomain,
      outcome: "blocked_domain",
      metadata: { reason: "blocked_domain" },
    });

    return {
      allowed: false,
      emailDomain,
      userAgentHash,
      message:
        params.locale === "zh"
          ? "当前邮箱域名暂不支持注册，请更换常用邮箱后重试。"
          : "This email domain is not eligible for signup. Please use a different email address.",
      outcome: "blocked_domain" as const,
    };
  }

  const serviceRole = getServiceRoleClientSafe();
  if (!serviceRole) {
    return {
      allowed: true,
      emailDomain,
      userAgentHash,
      message: null,
      outcome: null,
    };
  }

  const since = new Date(Date.now() - SIGNUP_LIMIT_WINDOW_MS).toISOString();
  try {
    if (params.clientIp) {
      const { count, error } = await serviceRole
        .from("signup_attempt_logs")
        .select("*", { count: "exact", head: true })
        .eq("client_ip", params.clientIp)
        .gte("attempted_at", since);

      if (error) {
        console.error("Signup IP guard query failed:", error);
      } else if ((count || 0) >= MAX_SIGNUPS_PER_IP) {
        await recordSignupAttempt({
          clientIp: params.clientIp,
          deviceId: params.deviceId,
          userAgentHash,
          emailDomain,
          outcome: "blocked_ip",
          metadata: { reason: "ip_limit", count, window_hours: 24 },
        });

        return {
          allowed: false,
          emailDomain,
          userAgentHash,
          message:
            params.locale === "zh"
              ? "当前网络环境的注册次数已达上限，请 24 小时后再试。"
              : "This network has reached the signup limit. Please try again in 24 hours.",
          outcome: "blocked_ip" as const,
        };
      }
    }

    if (params.deviceId) {
      const { count, error } = await serviceRole
        .from("signup_attempt_logs")
        .select("*", { count: "exact", head: true })
        .eq("device_id", params.deviceId)
        .gte("attempted_at", since);

      if (error) {
        console.error("Signup device guard query failed:", error);
      } else if ((count || 0) >= MAX_SIGNUPS_PER_DEVICE) {
        await recordSignupAttempt({
          clientIp: params.clientIp,
          deviceId: params.deviceId,
          userAgentHash,
          emailDomain,
          outcome: "blocked_device",
          metadata: { reason: "device_limit", count, window_hours: 24 },
        });

        return {
          allowed: false,
          emailDomain,
          userAgentHash,
          message:
            params.locale === "zh"
              ? "当前设备的注册次数已达上限，请 24 小时后再试。"
              : "This device has reached the signup limit. Please try again in 24 hours.",
          outcome: "blocked_device" as const,
        };
      }
    }
  } catch (error) {
    console.error("Signup guard enforcement failed:", error);
  }

  return {
    allowed: true,
    emailDomain,
    userAgentHash,
    message: null,
    outcome: null,
  };
}

async function verifyTurnstileToken({
  token,
  ip,
}: {
  token?: string;
  ip?: string | null;
}) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { success: false, code: "missing_secret" as const };
  }

  if (!token) {
    return { success: false, code: "missing_token" as const };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (ip) {
    body.set("remoteip", ip);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { success: false, code: "request_failed" as const };
  }

  const data = await response.json();

  return {
    success: Boolean(data?.success),
    code: data?.["error-codes"]?.[0] || null,
  };
}

function isTurnstileSignupEnabled() {
  return process.env.TURNSTILE_SIGNUP_ENABLED === "true";
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const turnstileToken = formData.get("turnstile_token")?.toString();
  const signupDeviceId = formData.get("signup_device_id")?.toString() || null;
  const requestedNextPath = formData.get("next")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const localePrefix = resolveLocalePrefix(headersList.get("referer"));
  const locale = localePrefix === "/zh" ? "zh" : "en";
  const nextPath = resolveSafeNextPath(requestedNextPath, localePrefix);
  const clientIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headersList.get("x-real-ip")
    || null;
  const userAgent = headersList.get("user-agent");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-up`,
      locale === "zh" ? "请输入邮箱和密码。" : "Email and password are required."
    );
  }

  const guardResult = await enforceSignupGuards({
    email,
    clientIp,
    deviceId: signupDeviceId,
    userAgent,
    locale,
  });

  if (!guardResult.allowed) {
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-up`,
      guardResult.message || (locale === "zh" ? "暂时无法完成注册，请稍后再试。" : "Signup is temporarily unavailable. Please try again.")
    );
  }

  if (isTurnstileSignupEnabled()) {
    const turnstile = await verifyTurnstileToken({
      token: turnstileToken,
      ip: headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    });

    if (!turnstile.success) {
      return encodedRedirect(
        "error",
        `${localePrefix}/sign-up`,
        locale === "zh"
          ? "请先完成安全验证后再注册。"
          : "Please complete the security check before signing up."
      );
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?redirect_to=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    await recordSignupAttempt({
      clientIp,
      deviceId: signupDeviceId,
      userAgentHash: guardResult.userAgentHash,
      emailDomain: guardResult.emailDomain,
      outcome: "signup_error",
      metadata: { error: error.message },
    });
    console.error(error.code + " " + error.message);
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-up`,
      humanizeAuthError(error.message, locale)
    );
  }

  await recordSignupAttempt({
    clientIp,
    deviceId: signupDeviceId,
    userAgentHash: guardResult.userAgentHash,
    emailDomain: guardResult.emailDomain,
    outcome: "signup_success",
    metadata: {
      has_session: Boolean(data.session),
      user_id: data.user?.id || null,
    },
  });

  if (data.session) {
    const cookieStore = await cookies();
    cookieStore.set("auth_just_signed_in", "1", {
      path: "/",
      maxAge: 20,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return redirect(nextPath);
  }

  return encodedRedirect(
    "success",
    `${localePrefix}/sign-in?next=${encodeURIComponent(nextPath)}`,
    locale === "zh"
      ? "账号已创建，请先去邮箱点击验证链接，完成后再登录。"
      : "Your account has been created. Please confirm your email first, then sign in."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const requestedNextPath = formData.get("next")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const localePrefix = resolveLocalePrefix(headersList.get("referer"));
  const locale = localePrefix === "/zh" ? "zh" : "en";
  const nextPath = resolveSafeNextPath(requestedNextPath, localePrefix);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-in?next=${encodeURIComponent(nextPath)}`,
      humanizeAuthError(error.message, locale)
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("auth_just_signed_in", "1", {
    path: "/",
    maxAge: 20,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return redirect(nextPath);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const localePrefix = resolveLocalePrefix(headersList.get("referer"));
  const locale = localePrefix === "/zh" ? "zh" : "en";
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      `${localePrefix}/forgot-password`,
      locale === "zh" ? "请输入邮箱地址。" : "Email is required."
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      `${localePrefix}/forgot-password`,
      locale === "zh" ? "暂时无法发送重置邮件，请稍后再试。" : "Could not reset password."
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    `${localePrefix}/forgot-password`,
    locale === "zh"
      ? "重置密码邮件已发送，请去邮箱查看。"
      : "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  const headersList = await headers();
  const localePrefix = resolveLocalePrefix(headersList.get("referer"));
  await supabase.auth.signOut();
  return redirect(`${localePrefix}/sign-in`);
};

export async function createCheckoutSession(
  productId: string,
  email: string,
  userId: string,
  productType: "subscription" | "credits",
  credits_amount?: number,
  discountCode?: string
) {
  try {
    const requestBody: any = {
      product_id: productId,
      // request_id: `${userId}-${Date.now()}`, // use Unique request ID if you need
      customer: {
        email: email,
      },
      metadata: {
        user_id: userId,
        product_type: productType,
        credits: credits_amount || 0,
      },
    };

    // 如果配置了成功重定向 URL，则添加到请求中
    if (process.env.CREEM_SUCCESS_URL) {
      requestBody.success_url = process.env.CREEM_SUCCESS_URL;
    }

    // 添加折扣码（如果有）
    if (discountCode) {
      requestBody.discount_code = discountCode;
    }

    const response = await fetch(process.env.CREEM_API_URL + "/checkouts", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CREEM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const data = await response.json();
    return data.checkout_url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
