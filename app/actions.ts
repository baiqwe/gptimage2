"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const turnstileToken = formData.get("turnstile_token")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const localePrefix = resolveLocalePrefix(headersList.get("referer"));
  const locale = localePrefix === "/zh" ? "zh" : "en";

  if (!email || !password) {
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-up`,
      locale === "zh" ? "请输入邮箱和密码。" : "Email and password are required."
    );
  }

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-up`,
      humanizeAuthError(error.message, locale)
    );
  }

  if (data.session) {
    return redirect(`${localePrefix}/dashboard`);
  }

  return encodedRedirect(
    "success",
    `${localePrefix}/sign-in`,
    locale === "zh"
      ? "账号已创建，请先去邮箱点击验证链接，完成后再登录。"
      : "Your account has been created. Please confirm your email first, then sign in."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const headersList = await headers();
  const localePrefix = resolveLocalePrefix(headersList.get("referer"));
  const locale = localePrefix === "/zh" ? "zh" : "en";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      `${localePrefix}/sign-in`,
      humanizeAuthError(error.message, locale)
    );
  }

  return redirect(`${localePrefix}/dashboard`);
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
