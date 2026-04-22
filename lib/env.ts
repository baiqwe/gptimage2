const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
} as const;

type RequiredEnvKey = keyof typeof REQUIRED_ENV_VARS;

export function getRequiredEnv(name: RequiredEnvKey): string {
  const value = REQUIRED_ENV_VARS[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function hasRequiredEnv(name: RequiredEnvKey): boolean {
  const value = REQUIRED_ENV_VARS[name];
  return Boolean(value && value.trim().length > 0);
}
