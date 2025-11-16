# Social Media Subscription Survey

ソーシャルメディア利用状況アンケートアプリケーション

A full-stack web application for conducting surveys about social media platform usage. Users can select which social media platforms they use, and administrators can manage surveys and view aggregated results.

## 概要 / Overview

このアプリケーションは、ソーシャルメディアの利用状況に関するアンケート調査を実施するためのWebアプリケーションです。回答者は利用しているソーシャルメディアプラットフォームを選択でき、管理者はアンケートの作成・管理と結果の閲覧が可能です。

### Features / 機能

- **ユーザー向け機能**
  - 利用可能なアンケート一覧の閲覧
  - 複数のソーシャルメディアプラットフォームを選択して回答
  - 回答後の集計結果の確認（棒グラフ表示）

- **管理者向け機能**
  - アンケートの作成・編集・削除
  - アンケートの公開/非公開設定
  - 詳細な統計情報の閲覧
  - 回答データの一括削除

### Technology Stack / 技術スタック

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **UI Icons**: Lucide React

## Installation / インストール方法

### Prerequisites / 必要な環境

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup / セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd kklab-social-media-subscription-survey
   ```

2. **依存関係のインストール**
   ```bash
   # フロントエンドの依存関係をインストール
   npm install

   # バックエンドのセットアップ（依存関係のインストールとDB初期化）
   npm run setup
   ```

3. **開発サーバーの起動**
   ```bash
   # フロントエンドとバックエンドを同時に起動
   npm run dev:all
   ```

   または、別々に起動する場合：
   ```bash
   # ターミナル1: フロントエンド（ポート5173）
   npm run dev

   # ターミナル2: バックエンド（ポート3001）
   npm run dev:server
   ```

4. **アプリケーションへのアクセス**
   - フロントエンド: http://localhost:5173
   - バックエンドAPI: http://localhost:3001/api

## Usage / 使い方

### 一般ユーザー

1. アンケート一覧画面から回答したいアンケートを選択
2. 利用しているソーシャルメディアプラットフォームをチェック
3. 「送信」ボタンをクリックして回答を送信
4. 送信完了画面から集計結果を確認可能

### 管理者

1. アンケート一覧画面の「管理者ログイン」をクリック
2. パスワードを入力してログイン（デフォルト: `admin123`）
3. 管理画面でアンケートの作成・編集・削除や統計情報の閲覧が可能

> **注意**: 現在の管理者認証はクライアントサイドのみで行われており、本番環境での使用には適していません。

## Project Structure / プロジェクト構造

```
kklab-social-media-subscription-survey/
├── src/                      # フロントエンドソースコード
│   ├── components/          # Reactコンポーネント
│   ├── lib/                 # APIクライアントとユーティリティ
│   ├── types/               # TypeScript型定義
│   └── main.tsx             # エントリポイント
├── server/                   # バックエンドソースコード
│   ├── index.js             # Expressサーバー
│   ├── init-db.js           # データベース初期化スクリプト
│   └── survey.db            # SQLiteデータベース（自動生成）
└── public/                   # 静的ファイル
```

## Available Commands / 利用可能なコマンド

### 開発用
- `npm run dev` - フロントエンド開発サーバーを起動
- `npm run dev:server` - バックエンドサーバーを起動（自動リロード）
- `npm run dev:all` - フロントエンドとバックエンドを同時に起動
- `npm run typecheck` - TypeScriptの型チェックを実行

### ビルド・デプロイ用
- `npm run build` - 本番用ビルドを作成
- `npm run preview` - ビルドしたアプリケーションをプレビュー
- `npm run lint` - ESLintを実行

### データベース管理
- `npm run setup` - サーバー依存関係のインストールとDB初期化
- `cd server && npm run init-db` - データベースの再初期化

## Database Schema / データベーススキーマ

### surveys
アンケートのメタデータを管理
- `id`: UUID (主キー)
- `title`: アンケートタイトル
- `description`: アンケート説明
- `is_active`: アクティブ状態（回答受付中かどうか）
- `is_visible`: 公開状態（一覧に表示するかどうか）

### survey_responses
アンケート回答レコード
- `id`: UUID (主キー)
- `survey_id`: 外部キー (surveys.id)
- `session_id`: セッション識別子
- `created_at`: 回答日時

### social_media_selections
プラットフォーム選択データ
- `id`: UUID (主キー)
- `response_id`: 外部キー (survey_responses.id)
- `platform_name`: プラットフォーム名
- `created_at`: 選択日時

## Changelog / 更新履歴

### v1.0.0 (2025-11-17)
- 初回リリース
- ソーシャルメディアアンケート機能の実装
- ユーザー向け機能
  - アンケート一覧表示
  - マルチセレクトフォームによる回答送信
  - 集計結果の可視化（棒グラフ）
- 管理者向け機能
  - アンケートCRUD操作
  - 統計情報の閲覧
  - 回答データの一括削除
- データベース
  - SQLiteによる永続化
  - 外部キー制約とカスケード削除
  - パフォーマンス最適化用インデックス
- 技術スタック
  - React 18 + TypeScript
  - Vite開発環境
  - Express.js REST API
  - Tailwind CSS

## License / ライセンス

This project is private and proprietary.

## Support / サポート

For questions or issues, please contact the development team.

---

© 2025 KKLab
