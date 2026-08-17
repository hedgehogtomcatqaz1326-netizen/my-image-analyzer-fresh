"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setImage(base64Image);
      await executeAnalysis(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const executeAnalysis = async (base64Image: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "通信エラーが発生しました。" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 font-sans min-h-screen flex flex-col justify-between">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">AIカメラ即時解析</h1>
        
        {/* いきなりカメラが起動するボタン（スマホ対応：capture="environment"） */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl space-y-3">
          <p className="text-sm font-bold text-blue-900 text-center">
            下のボタンをタップして撮影、または画像を選んでください
          </p>
          <label className="w-full py-4 bg-blue-600 text-white font-bold text-center rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 active:scale-95 transition">
            📷 カメラで撮影 / 画像を選ぶ
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleCapture} 
              className="hidden" 
            />
          </label>
        </div>

        {/* 撮影・選択されたプレビュー */}
        {image && (
          <div className="w-full flex justify-center">
            <img src={image} alt="Captured" className="max-h-48 rounded-lg shadow border" />
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="text-center space-y-2 py-6">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-blue-600 font-bold">画像をAIが解析中...</p>
          </div>
        )}

        {/* 解析結果表示 */}
        {result && !result.error && (
          <div className="p-5 bg-green-50 border border-green-200 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-green-900 border-b pb-2">{result.name}</h2>
            <div className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">{result.summary}</div>
            <p className="text-xs text-gray-600 italic bg-white p-3 rounded border">💡 {result.trivia}</p>

            {/* 類似画像・関連情報を探すボタン */}
            {result.searchQuery && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(result.searchQuery)}&tbm=isch`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-indigo-600 text-white text-center font-bold rounded-lg shadow hover:bg-indigo-700 transition"
              >
                🔍 この画像に類似したものを検索する
              </a>
            )}
          </div>
        )}

        {result?.error && <p className="text-red-600 text-center font-bold">{result.error}</p>}
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
        AI Image Analyzer System
      </footer>
    </main>
  );
}