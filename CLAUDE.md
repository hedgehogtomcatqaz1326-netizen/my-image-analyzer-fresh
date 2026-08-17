# AI Image Analyzer Project Rules

## 開発ガイドライン
- **Plan Modeの徹底**: 機能追加や変更時は、必ず「設計 (Plan) → ユーザー確認 → 実装」の順で進行すること。
- **技術スタック**: Next.js (App Router), TypeScript, Tailwind CSS, OpenAI API
- **Git ワークフロー**: 適切なコミットメッセージをつけ、main ブランチ経由で Vercel へ自動デプロイする。

## プロジェクト構造
- pp/page.tsx: フロントエンドUI（カメラ起動・解析結果表示・類似検索）
- pp/api/analyze/route.ts: OpenAI APIを使用した画像解析バックエンド
