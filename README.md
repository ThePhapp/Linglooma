# 🌸 Linglooma - AI-Powered English Learning Platform

<details>
<summary><strong>🇯🇵 日本語</strong></summary>

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.16-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?logo=supabase)](https://supabase.com/)

*AI を活用した IELTS 4 技能（Speaking / Writing / Reading / Listening）評価を提供する総合学習プラットフォーム*

---

## 📖 目次

- [概要](#-概要)
- [主な特徴](#-主な特徴)
- [技術スタック](#-技術スタック)
- [セットアップ](#-セットアップ)
- [AI 機能](#-ai-機能)
- [デプロイ](#-デプロイ)

---

## 🎯 概要

**Linglooma IELTS** は、IELTS 受験者向けに設計された高度な Web 学習プラットフォームです。AI による即時フィードバックを活用し、Speaking / Writing / Reading / Listening の 4 技能を総合的に学習できます。

### 🌟 Linglooma の特長

- **AI 自動採点**：Azure Speech Services と Gemini AI による即時評価  
- **4 技能を網羅**：Speaking / Writing / Reading / Listening  
- **高度な学習分析**：弱点分析、スコア推移、ダッシュボード  
- **多言語対応**：英語・ベトナム語・日本語  
- **モダンな UI/UX**  
- **PostgreSQL または Supabase に対応した柔軟なデプロイ**

---

## 🚀 主な特徴

### 🗣️ スピーキングモジュール
- Azure Speech-to-Text による音声評価  
- IELTS バンドスコア換算  
- 発音・流暢さ・内容網羅性・イントネーション解析  
- 音素レベルの誤発音検出  
- 過去のスピーキング履歴の分析

### ✍️ ライティングモジュール
- Task 1 / Task 2 に対応  
- Gemini による採点：Task Achievement / Coherence / Vocabulary / Grammar  
- 文法誤り検出・修正  
- 語彙改善提案  
- ワードカウンター & タイマー

### 📖 リーディングモジュール
- 多様な問題形式：MCQ, T/F/NG, マッチング, 穴埋め  
- 即時採点  
- 豊富なパッセージと難易度設定  
- 学習履歴・成績推移の追跡

### 🎧 リスニングモジュール
- 音声再生（速度調整あり）  
- IELTS 構成（Part 1–4）に準拠  
- 英・米・豪アクセント  
- テスト後にスクリプト表示

### 💬 AI ボイスチャット
- Gemini による会話 AI  
- 音声認識 / 音声合成  
- IELTS トピックを使った模擬面接  
- AI フィードバック付き

### 📊 学習者ダッシュボード
- パフォーマンスの可視化  
- バンドスコア推移  
- 弱点分析  
- 学習目標・連続学習日数  
- 最新アクティビティ

---

## ⚙️ 技術スタック

### フロントエンド
- React 19  
- Vite 6  
- Tailwind CSS 3  
- React Router 7  
- Axios  
- Lucide React  

### バックエンド
- Node.js 22.16  
- Express.js 5.1  
- PostgreSQL 16+  
- Supabase  
- JWT 認証  
- Bcrypt ハッシュ化  

### AI サービス
- Azure Speech Services  
- Google Gemini  

---

## 🛠 セットアップ

### 必要要件
- Node.js 22.16+  
- PostgreSQL 16+ または Supabase  
- Azure Speech API Key  
- Google Gemini API Key  

### クイックスタート

## 🤖 AI 機能

### スピーキング評価（Azure）
```
Accuracy（発音精度）
Fluency（流暢さ）
Completeness（網羅性）
Prosody（イントネーション）
音素レベル誤り分析
IELTS バンドスコア換算
```

### ライティング評価 (Gemini AI)
```
Task Achievement（1〜9）
Coherence & Cohesion（1〜9）
Vocabulary（1〜9）
Grammar（1〜9）
総合バンドスコア
文法誤り・修正提案
語彙強化提案
```

---

## 🚀 Deployment

### バックエンド（Render.com）
1. GitHub と接続
2. 環境変数設定
3. Build: `npm install`
4. Start: `node server.js`

### Frontend (Vercel/Netlify)
1. プロジェクトをインポート
2. `VITE_BACKEND_URL`を設定
3. Build: `npm run build`
4. Output: `dist`

---

## 📄 License

MIT License（詳細は LICENSE を参照）

---

<div align="center">

**Made with ❤️ by UET - VNU Hanoi students**

</div>
</details>
<details>
<summary><strong>🇺🇸 English</strong></summary>

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.16-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?logo=supabase)](https://supabase.com/)

*A comprehensive IELTS preparation platform with AI-powered evaluation for Speaking, Writing, Reading, and Listening skills*

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [AI Features](#-ai-features)
- [Deployment](#-deployment)

---

## 🎯 Overview

**Linglooma IELTS** is an advanced web-based learning platform designed to help students prepare for the IELTS exam through AI-powered practice and real-time feedback. The platform covers all four IELTS skills (Speaking, Writing, Reading, Listening) and provides personalized learning paths based on student performance.

### 🌟 Why Linglooma?

- **AI-Powered Evaluation**: Instant feedback using Azure Speech Services and Gemini AI
- **Comprehensive Practice**: All 4 IELTS skills in one platform
- **Smart Analytics**: Visual dashboards tracking progress and weak points
- **Multilingual Interface**: Supports English, Vietnamese, and Japanese
- **Modern UX**: Beautiful, responsive design with smooth animations
- **Flexible Deployment**: Works with local PostgreSQL or Supabase

---

## 🚀 Key Features

### 🗣️ Speaking Module
- Real-time audio recording and Azure Speech-to-Text evaluation
- IELTS Band Scoring (1-9) with pronunciation, fluency, completeness analysis
- Phoneme-level feedback identifying mispronounced sounds
- Topic categories: Technology, Environment, Education, Health, Travel
- Complete speaking history with detailed analytics

### ✍️ Writing Module
- Task 1 & Task 2 support with AI essay evaluation
- Gemini AI analyzes: Task Achievement, Coherence, Lexical Resource, Grammar
- Grammar error detection with corrections and explanations
- Vocabulary enhancement suggestions
- Real-time word counter and timer

### 📖 Reading Module
- Multiple question types: Multiple Choice, True/False/Not Given, Matching, Fill-in-blanks
- Instant scoring with correct/incorrect feedback
- Diverse passage library (Climate Change, AI, Education, etc.)
- Difficulty levels: Easy, Medium, Hard, Academic
- Progress tracking and performance trends

### 🎧 Listening Module
- Audio playback with controls (play, pause, speed adjustment)
- Section-based tests matching IELTS structure (Parts 1-4)
- Multiple accents: British, American, Australian
- Transcript review after submission

### 💬 AI Voice Chat
- Conversational AI powered by Gemini
- Real-time Speech-to-Text and Text-to-Speech
- IELTS practice topics with structured conversations
- Chat history and AI feedback

### 📊 Student Dashboard
- Performance overview with visual charts
- Band score trends and improvement tracking
- Weak points analysis
- Study streak and goal setting
- Recent activity quick access
---

## ⚙️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 7** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js 22.16** - Runtime
- **Express.js 5.1** - Web framework
- **PostgreSQL 16+** - Database
- **Supabase** - Database hosting
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### AI Services
- **Azure Speech Services** - Speech-to-Text, pronunciation assessment
- **Google Gemini AI** - Essay evaluation, chat AI, feedback generation

---

## 🛠 Getting Started

### Prerequisites
- Node.js 22.16+
- PostgreSQL 16+ or Supabase account
- Azure Speech API Key
- Google Gemini API Key

## 🤖 AI Features

### Speaking Evaluation (Azure)
```javascript
✅ Accuracy Score (0-100): Overall pronunciation
✅ Fluency Score (0-100): Speech smoothness
✅ Completeness Score (0-100): Coverage of reference text
✅ Prosody Score (0-100): Intonation patterns
✅ Phoneme Analysis: Specific mispronounced sounds
✅ IELTS Band Conversion (1-9)
```

### Writing Evaluation (Gemini AI)
```javascript
✅ Task Achievement (1-9)
✅ Coherence & Cohesion (1-9)
✅ Lexical Resource (1-9)
✅ Grammatical Range & Accuracy (1-9)
✅ Overall Band Score
✅ Grammar Errors with corrections
✅ Vocabulary Suggestions
```

---

## 🚀 Deployment

### Backend (Render.com)
1. Connect GitHub repository
2. Set environment variables
3. Build: `npm install`
4. Start: `node server.js`

### Frontend (Vercel/Netlify)
1. Import project
2. Set `VITE_BACKEND_URL`
3. Build: `npm run build`
4. Output: `dist`

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**Made with ❤️ by UET - VNU Hanoi students**

</div>


</details>

---

## 🌐 Preview

**Deploy:** [https://linglooma.vercel.app/](https://linglooma.vercel.app/)
