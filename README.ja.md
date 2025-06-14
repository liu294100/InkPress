# InkPress 📝

Next.js で構築されたモダンな Markdown ベースのブログプラットフォーム。

[English](README.md) | [中文](README.zh.md) | **日本語**

---

## 概要

InkPress は Next.js で構築されたモダンな Markdown ベースのブログプラットフォームです。ローカルの Markdown ファイルから自動的に静的ブログを生成し、強力な検索機能、レスポンシブデザイン、優れたパフォーマンスを特徴としています。

## ✨ 機能

- 🚀 **Next.js 14 ベース** - 最新の App Router アーキテクチャを使用
- 📝 **Markdown サポート** - Frontmatter サポート付きの完全な Markdown レンダリング
- 🔍 **全文検索** - FlexSearch ベースの日中英単語分割検索
- 🎨 **モダン UI** - Tailwind CSS で構築されたレスポンシブインターフェース
- 📱 **モバイル最適化** - 完璧なモバイル体験
- ⚡ **高パフォーマンス** - 静的生成 + 検索インデックス最適化
- 🏷️ **カテゴリ＆タグ** - 記事のカテゴリ分けとタグ付けをサポート
- 📖 **目次生成** - 自動目次生成
- 🎯 **シンタックスハイライト** - 複数のプログラミング言語をサポート
- 🔗 **SEO フレンドリー** - 最適化された SEO とソーシャルメディア共有

## 🚀 クイックスタート

### 要件

- Node.js 18.0 以上
- npm または yarn パッケージマネージャー

### インストール

```bash
# プロジェクトをクローン
git clone https://github.com/your-username/inkpress.git
cd inkpress

# 依存関係をインストール
npm install

# 検索インデックスを生成
npm run build:search

# 開発サーバーを起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスしてブログを確認してください。

### 記事の追加

1. `docs/` ディレクトリに Markdown ファイルを作成
2. Frontmatter を使用してメタデータを追加：

```markdown
---
title: "記事タイトル"
date: "2024-01-15"
author: "著者名"
tags: ["タグ1", "タグ2"]
description: "記事の説明"
---

# 記事内容

Markdown コンテンツをここに記述...
```

3. 検索インデックスを再生成：

```bash
npm run build:search
```

## 📁 プロジェクト構造

```
inkpress/
├── app/                    # Next.js App Router ページ
│   ├── category/          # カテゴリページ
│   ├── posts/             # 記事ページ
│   ├── search/            # 検索ページ
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # React コンポーネント
│   ├── Header.tsx         # ヘッダーナビゲーション
│   ├── Footer.tsx         # フッター
│   ├── SearchBox.tsx      # 検索ボックス
│   └── TableOfContents.tsx # 目次コンポーネント
├── docs/                  # Markdown 記事ディレクトリ
│   ├── dev/              # 開発関連記事
│   ├── life/             # ライフスタイル記事
│   └── tech/             # 技術記事
├── lib/                   # ユーティリティ関数
│   ├── posts.ts          # 投稿処理ロジック
│   ├── search.ts         # 検索機能
│   └── utils.ts          # 共通ユーティリティ
├── public/               # 静的アセット
│   └── search-index.json # 検索インデックスファイル
├── scripts/              # ビルドスクリプト
│   └── build-search-index.js # 検索インデックス生成スクリプト
└── styles/               # スタイルファイル
```

## 🛠️ 利用可能なスクリプト

```bash
# 開発
npm run dev          # 開発サーバーを起動
npm run build        # 本番用ビルド
npm run start        # 本番サーバーを起動
npm run lint         # コードリント

# 検索インデックス
npm run build:search # 検索インデックスを生成
npm run prebuild     # ビルド前に検索インデックスを自動生成
```

## 🚀 Vercel へのデプロイ

1. コードを GitHub リポジトリにプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. Vercel が自動的に Next.js プロジェクトを検出してデプロイ
4. コードをプッシュするたびに自動的に再デプロイ

## 🔧 設定

### カスタム設定

`next.config.js` を編集して Next.js の設定をカスタマイズ：

```javascript
module.exports = {
  // カスタム設定
}
```

### スタイルのカスタマイズ

`tailwind.config.js` を編集してテーマをカスタマイズ：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // プライマリカラー
        }
      }
    }
  }
}
```

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🤝 コントリビューション

コントリビューションを歓迎します！お気軽に Pull Request を送信してください。

## 📞 サポート

ご質問やサポートが必要な場合は、GitHub で issue を作成してください。

---

**Made with ❤️ by the InkPress Team**