-- ============================================
-- GPT Image 2 Generator: 完整数据库设置脚本
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 创建 customers 表
-- ============================================
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    creem_customer_id text not null,
    email text not null,
    name text,
    country text,
    credits integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb,
    constraint credits_non_negative check (credits >= 0)
);

-- 添加唯一约束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_user_id_key') THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- ============================================
-- 2. 创建 credits_history 表
-- ============================================
CREATE TABLE IF NOT EXISTS public.credits_history (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    amount integer not null,
    type text not null check (type in ('add', 'subtract')),
    description text,
    creem_order_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb
);

-- ============================================
-- 3. 创建 subscriptions 表
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    creem_subscription_id text not null unique,
    creem_product_id text not null,
    status text not null check (status in ('incomplete', 'expired', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'trialing')),
    current_period_start timestamp with time zone not null,
    current_period_end timestamp with time zone not null,
    canceled_at timestamp with time zone,
    trial_end timestamp with time zone,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 4. 创建 generations 表（记录生成历史）
-- ============================================
CREATE TABLE IF NOT EXISTS public.generations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    prompt text,
    model_id text,
    image_url text,
    input_image_url text,
    status text default 'pending',
    credits_cost integer default 10,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 5. 创建索引
-- ============================================
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS credits_history_customer_id_idx ON public.credits_history(customer_id);
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON public.generations(user_id);

-- ============================================
-- 6. 启用 RLS
-- ============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS 策略
-- ============================================
-- 删除可能已存在的策略
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Service role can manage customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own credits history" ON public.credits_history;
DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;

-- Customers 策略
CREATE POLICY "Users can view their own customer data"
    ON public.customers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data"
    ON public.customers FOR UPDATE
    USING (auth.uid() = user_id);

-- Credits history 策略
CREATE POLICY "Users can view their own credits history"
    ON public.credits_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = credits_history.customer_id
            AND customers.user_id = auth.uid()
        )
    );

-- Generations 策略
CREATE POLICY "Users can view their own generations"
    ON public.generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
    ON public.generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. 新用户注册自动创建 customer 并发放 30 积分
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 检查是否已存在
  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- 创建 Customer 记录，赠送 30 积分
  INSERT INTO public.customers (
    user_id,
    email,
    credits,
    creem_customer_id,
    created_at,
    updated_at,
    metadata
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, 'no-email@placeholder.com'),
    30,
    'auto_' || NEW.id::text,
    NOW(),
    NOW(),
    jsonb_build_object(
      'source', 'auto_registration',
      'initial_credits', 30,
      'registration_date', NOW()
    )
  );

  -- 记录积分历史
  INSERT INTO public.credits_history (
    customer_id,
    amount,
    type,
    description,
    created_at,
    metadata
  ) VALUES (
    (SELECT id FROM public.customers WHERE user_id = NEW.id),
    30,
    'add',
    'Welcome bonus: 30 credits for new user',
    NOW(),
    jsonb_build_object('source', 'welcome_bonus')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器（先删除可能存在的）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. 原子扣费函数
-- ============================================
CREATE OR REPLACE FUNCTION decrease_credits(
  p_user_id UUID, 
  p_amount INTEGER,
  p_description TEXT DEFAULT 'AI Generation'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_current_credits INTEGER;
BEGIN
  -- 锁定行并获取当前积分
  SELECT id, credits INTO v_customer_id, v_current_credits
  FROM customers
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_customer_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 退款处理
  IF p_amount < 0 THEN
    UPDATE customers
    SET credits = credits - p_amount, updated_at = NOW()
    WHERE id = v_customer_id;

    INSERT INTO credits_history (customer_id, amount, type, description, created_at, metadata)
    VALUES (v_customer_id, ABS(p_amount), 'add', p_description, NOW(), '{"action": "refund"}'::jsonb);

    RETURN TRUE;
  END IF;

  -- 余额不足
  IF v_current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- 执行扣费
  UPDATE customers
  SET credits = credits - p_amount, updated_at = NOW()
  WHERE id = v_customer_id;

  INSERT INTO credits_history (customer_id, amount, type, description, created_at, metadata)
  VALUES (v_customer_id, p_amount, 'subtract', p_description, NOW(), '{"action": "ai_generation"}'::jsonb);

  RETURN TRUE;
END;
$$;

-- 授权
GRANT EXECUTE ON FUNCTION decrease_credits TO authenticated;

-- ============================================
-- 10. 为现有用户补发积分（如果你已经登录过但没有 customer 记录）
-- ============================================
INSERT INTO public.customers (user_id, email, credits, creem_customer_id, created_at, updated_at, metadata)
SELECT 
  id,
  COALESCE(email, 'no-email@placeholder.com'),
  30,
  'auto_' || id::text,
  NOW(),
  NOW(),
  jsonb_build_object('source', 'retroactive_fix', 'initial_credits', 30)
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.customers)
ON CONFLICT (user_id) DO NOTHING;

-- 完成提示
SELECT 'GPT Image 2 Generator 数据库设置完成！新用户将自动获得 30 积分。' AS result;
