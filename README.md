# 訪問マップ

hoshitokimi製の訪問先管理マップアプリです。

## 機能

- 地図上にピンを立てて訪問先を記録
- 施設名・訪問日・担当者・電話番号・売上・出店料金・メモを管理
- 売上規模でピンの色分け表示
- 純利益（売上 − 出店料金）を自動計算
- 施設名・担当者・メモで検索
- データはブラウザに自動保存（localStorage）

## セットアップ

```bash
npm install
npm start
```

ブラウザで http://localhost:3000 を開いてください。

## デプロイ（Vercel）

1. このリポジトリをGitHubにプッシュ
2. [vercel.com](https://vercel.com) でGitHubと連携
3. リポジトリを選択して「Deploy」

## 技術

- React 18
- Leaflet（地図）
- OpenStreetMap（地図タイル）
- localStorage（データ保存）

© hoshitokimi
