"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [lang, setLang] = useState("日本語");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const execute = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, language: lang }),
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
    <main className="max-w-md mx-auto p-6 space-y-6 font-sans">
      <h1 className="text-2xl font-bold text-center">AI画像解析システム</h1>
      
      <div className="space-y-2">
        <label className="block font-medium">1. 画像を選ぶ（カメラ撮影可）</label>
        <input type="file" accept="image/*" onChange={handleUpload} className="w-full border p-2 rounded" />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">2. 言語を選ぶ</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full p-2 border rounded">
          {["日本語", "English", "中文", "한국어", "Português"].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {image && !loading && (
        <button onClick={execute} className="w-full p-4 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700">
          解析を実行する
        </button>
      )}

      {loading && <p className="text-center text-blue-600 font-bold">解析中...少々お待ちください</p>}

      {result && !result.error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <h2 className="text-lg font-bold text-green-900">{result.name}</h2>
          <div className="text-gray-800 whitespace-pre-line">{result.summary}</div>
          <p className="text-sm text-gray-600 italic">💡 {result.trivia}</p>
        </div>
      )}

      {result?.error && <p className="text-red-600 text-center font-bold">{result.error}</p>}
    </main>
  );
}