# InkPress
# InkPress 📝

A modern, fast, and local-first markdown-powered blog system built with Next.js App Router.

**English** | [中文](README.zh.md) | [日本語](README.ja.md)

---

## Introduction

InkPress is a modern Markdown-based blog platform built with Next.js. It automatically generates static blogs from local Markdown files, featuring powerful search capabilities, responsive design, and excellent performance.

## ✨ Features

- 🚀 **Built with Next.js 14** - Using the latest App Router architecture
- 📝 **Markdown Support** - Full Markdown rendering with Frontmatter support
- 🔍 **Full-text Search** - Chinese and English word segmentation search based on FlexSearch
- 🎨 **Modern UI** - Responsive interface built with Tailwind CSS
- 📱 **Mobile Optimized** - Perfect mobile experience
- ⚡ **High Performance** - Static generation + search index optimization
- 🏷️ **Categories & Tags** - Support for article categorization and tagging
- 📖 **Table of Contents** - Automatic TOC generation
- 🎯 **Syntax Highlighting** - Support for multiple programming languages
- 🔗 **SEO Friendly** - Optimized SEO and social media sharing

## 🚀 Quick Start

### Requirements

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the project
git clone https://github.com/your-username/inkpress.git
cd inkpress

# Install dependencies
npm install

# Generate search index
npm run build:search

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your blog.

### Adding Articles

1. Create Markdown files in the `docs/` directory
2. Add metadata using Frontmatter:

```markdown
---
title: "Article Title"
date: "2024-01-15"
author: "Author Name"
tags: ["tag1", "tag2"]
description: "Article description"
---

# Article Content

Your Markdown content goes here...
```

3. Regenerate the search index:

```bash
npm run build:search
```

## 📁 Project Structure

```
inkpress/
├── app/                    # Next.js App Router pages
│   ├── category/          # Category pages
│   ├── posts/             # Article pages
│   ├── search/            # Search page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Header navigation
│   ├── Footer.tsx         # Footer
│   ├── SearchBox.tsx      # Search box
│   └── TableOfContents.tsx # TOC component
├── docs/                  # Markdown articles directory
│   ├── dev/              # Development articles
│   ├── life/             # Lifestyle articles
│   └── tech/             # Technology articles
├── lib/                   # Utility functions
│   ├── posts.ts          # Post processing logic
│   ├── search.ts         # Search functionality
│   └── utils.ts          # Common utilities
├── public/               # Static assets
│   └── search-index.json # Search index file
├── scripts/              # Build scripts
│   └── build-search-index.js # Search index generation script
└── styles/               # Style files
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Search Index
npm run build:search # Generate search index
npm run prebuild     # Auto-generate search index before build
```

## 🚀 Deploy to Vercel

1. Push your code to a GitHub repository
2. Import the project on [Vercel](https://vercel.com)
3. Vercel will automatically detect the Next.js project and deploy it
4. Every code push will trigger an automatic redeployment

## 🔧 Configuration

### Custom Configuration

Edit `next.config.js` to customize Next.js configuration:

```javascript
module.exports = {
  // Your custom configuration
}
```

### Style Customization

Edit `tailwind.config.js` to customize the theme:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Your primary colors
        }
      }
    }
  }
}
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ by the InkPress Team**
