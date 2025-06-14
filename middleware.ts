import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

export default createMiddleware({
  // 支持的语言列表
  locales,
  
  // 默认语言
  defaultLocale,
  
  // 语言检测策略
  localeDetection: true,
  
  // URL路径前缀策略
  localePrefix: 'as-needed'
});

export const config = {
  // 匹配所有路径，除了以下路径：
  // - api 路由
  // - _next 静态文件
  // - _vercel 部署文件
  // - 图片和其他静态资源
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
    '/(zh|en|ja|fr|ko)/:path*'
  ]
};