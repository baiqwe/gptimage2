import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export async function middleware(request: NextRequest) {
  try {
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(
        new URL(`/${routing.defaultLocale}`, request.url),
        308
      )
    }

    // 1. 将 intl 中间件初始化移入函数内部，防止顶层初始化崩溃导致整个模块加载失败
    const intlMiddleware = createIntlMiddleware(routing)
    let response = intlMiddleware(request)

    // 2. 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
              // 同时更新 request 和 response
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value)
              })

              // 更新 response 是为了写入浏览器
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      // 3. 刷新 Session (这会触发上面的 setAll)
      await supabase.auth.getUser()
    } else {
      // console.warn("Middleware: Supabase env vars missing, skipping auth check.")
    }

    return response
  } catch (error) {
    console.error("Middleware execution failed:", error);
    // 发生错误时，降级为直接放行，避免 500 页面
    return NextResponse.next();
  }
}

export const config = {
  // ✅ 使用静态宽泛匹配，不依赖动态变量
  // next-intl 中间件内部会自动处理语言匹配
  matcher: ['/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',]
}
