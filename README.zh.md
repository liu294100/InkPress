# InkPress 📝

一个基于 Next.js 构建的现代化 Markdown 博客平台。

[English](README.md) | **中文** | [日本語](README.ja.md)

---

## 简介

InkPress 是一个基于 Next.js 构建的现代化 Markdown 博客平台。它支持从本地 Markdown 文件自动生成静态博客，具有强大的搜索功能、响应式设计和优秀的性能表现。

## ✨ 特性

- 🚀 **基于 Next.js 14** - 使用最新的 App Router 架构
- 📝 **Markdown 支持** - 完整的 Markdown 渲染，支持 Frontmatter
- 🔍 **全文搜索** - 基于 FlexSearch 的中英文分词搜索
- 🎨 **现代化 UI** - 使用 Tailwind CSS 构建的响应式界面
- 📱 **移动端适配** - 完美的移动端体验
- ⚡ **高性能** - 静态生成 + 搜索索引优化
- 🏷️ **分类标签** - 支持文章分类和标签系统
- 📖 **目录生成** - 自动生成文章目录
- 🎯 **代码高亮** - 支持多种编程语言语法高亮
- 🔗 **SEO 友好** - 优化的 SEO 和社交媒体分享

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/inkpress.git
cd inkpress

# 安装依赖
npm install

# 生成搜索索引
npm run build:search

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看你的博客。

### 添加文章

1. 在 `docs/` 目录下创建 Markdown 文件
2. 使用 Frontmatter 添加元数据：

```markdown
---
title: "文章标题"
date: "2024-01-15"
author: "作者名称"
tags: ["标签1", "标签2"]
description: "文章描述"
---

# 文章内容

这里是你的 Markdown 内容...
```

3. 重新生成搜索索引：

```bash
npm run build:search
```

## 📁 项目结构

```
inkpress/
├── app/                    # Next.js App Router 页面
│   ├── category/          # 分类页面
│   ├── posts/             # 文章页面
│   ├── search/            # 搜索页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── Header.tsx         # 头部导航
│   ├── Footer.tsx         # 页脚
│   ├── SearchBox.tsx      # 搜索框
│   └── TableOfContents.tsx # 目录组件
├── docs/                  # Markdown 文章目录
│   ├── dev/              # 开发相关文章
│   ├── life/             # 生活相关文章
│   └── tech/             # 技术相关文章
├── lib/                   # 工具函数
│   ├── posts.ts          # 文章处理逻辑
│   ├── search.ts         # 搜索功能
│   └── utils.ts          # 通用工具
├── public/               # 静态资源
│   └── search-index.json # 搜索索引文件
├── scripts/              # 构建脚本
│   └── build-search-index.js # 搜索索引生成脚本
└── styles/               # 样式文件
```

## 🛠️ 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查

# 搜索索引
npm run build:search # 生成搜索索引
npm run prebuild     # 构建前自动生成搜索索引
```

## 🚀 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 上导入项目
3. Vercel 会自动检测 Next.js 项目并进行部署
4. 每次推送代码时，Vercel 会自动重新部署

## 🔧 配置

### 自定义配置

编辑 `next.config.js` 来自定义 Next.js 配置：

```javascript
module.exports = {
  // 你的自定义配置
}
```

### 样式定制

编辑 `tailwind.config.js` 来自定义主题：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // 你的主色调
        }
      }
    }
  }
}
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📞 支持

如果您有任何问题或需要帮助，请在 GitHub 上创建 issue。

---

**Made with ❤️ by the InkPress Team**