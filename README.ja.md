# Linglooma IELTS

[English](README.en.md) · [メイン README](README.md) · [フロントエンド](00-frontend-react/README.md)

Linglooma は IELTS の Speaking、Writing、Reading とブラウザー上の Listening 練習を提供します。構成は React 19、Vite 6、Tailwind CSS 3、Node.js 22、Express 5、Docker Compose 上の PostgreSQL 15 です。Speaking の評価には Azure Speech、Writing の評価とテキストチャットには Gemini を使用します。Speaking、Writing、Reading の提出結果はアカウントごとに保存されます。Listening の進捗は保存されません。分析画面は保存済みの Speaking 結果を表示します。

## ローカル開発（PowerShell）

Node.js 22、npm、Docker Compose を用意し、リポジトリのルートで実行します。

```powershell
$env:DB_PASSWORD = "<ローカル用のパスワード>"
docker compose up -d db
Copy-Item 01-backend-nodejs/.env.local.example 01-backend-nodejs/.env
```

コピーした `01-backend-nodejs/.env` の `DB_PASSWORD` を同じ値にし、非公開の `JWT_SECRET` を設定してください。AI 機能には自身の `GEMINI_API_KEY` と `AZURE_SPEECH_KEY` が必要です。`.env` をコミットしないでください。外部の PostgreSQL を使う場合は `DATABASE_URL` を設定します。

API とフロントエンドを別々のターミナルで起動します。

```powershell
cd 01-backend-nodejs
npm ci
npm run dev
```

```powershell
cd 00-frontend-react
Copy-Item .env.example .env
npm ci
npm run dev
```

フロントエンド: <http://localhost:4028>、API: <http://localhost:3000>。Compose の PostgreSQL 15 はホストの **5433** 番ポート（コンテナー内では 5432）を使います。Vite は `/api` をローカル API に転送します。チャット、提出、非公開の履歴・詳細 API にはログインで取得した JWT が必要です。

## データベースと Docker

新しい Compose データボリュームは `02-database-postgresql/linglooma_update.sql` で初期化されます。この SQL はテーブルを削除する**開発用の破壊的リセット**です。既存データの更新には使わず、[前進マイグレーション手順](02-database-postgresql/RUN_MIGRATION.md) の `run-migration.bat` または `run-migration.ps1` を使ってください。

全サービスを Docker で起動する場合は `01-backend-nodejs/.env.docker.example` を `01-backend-nodejs/.env` にコピーして秘密情報を設定し、ルートのシェルでも同じ `DB_PASSWORD` を設定して `docker compose up --build` を実行します。フロントエンドは <http://localhost/> で公開されます。

## 確認

バックエンドの `01-backend-nodejs` で `npm test`、フロントエンドの `00-frontend-react` で `npm run build` を実行します。ブラウザーテストはアプリ起動後に `npx cypress run` を実行します（対応ブラウザーが必要です）。
