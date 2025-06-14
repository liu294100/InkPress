const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // 静态导出配置（可选，用于静态部署）
  // output: 'export',
  // trailingSlash: true,
  
  // 优化构建
  swcMinify: true,
  
  // 自定义webpack配置
  webpack: (config, { isServer }) => {
    // 处理node模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
        'nock': false,
      };
      
      // 完全排除nodejieba及其依赖在客户端构建
      config.resolve.alias = {
        ...config.resolve.alias,
        'nodejieba': false,
        '@mapbox/node-pre-gyp': false,
      };
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);