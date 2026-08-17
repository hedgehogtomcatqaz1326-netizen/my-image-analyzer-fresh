"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // 起動時に履歴を読み込む
  useEffect(() => {
    const saved = localStorage.getItem("analyzeHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const executeAnalysis = async (base64Image: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      const newEntry = { ...data, image: base64Image, timestamp: new Date().toLocaleString() };
      setResult(data);
      const newHistory = [newEntry, ...history];
      setHistory(newHistory);
      localStorage.setItem("analyzeHistory", JSON.stringify(newHistory));
    } catch (err) {
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImage(base64);
      executeAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearHistory = () => {
    if (confirm("すべての履歴を消去しますか？")) {
      setHistory([]);
      localStorage.removeItem("analyzeHistory");
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold text-center">AIカメラ即時解析</h1>
      
      <label className="block w-full py-6 bg-blue-600 text-white font-bold text-center rounded-xl cursor-pointer">
        📷 撮影して解析する
        <input type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
      </label>

      {loading && <p className="text-center font-bold text-blue-600">AIが詳細解析中...</p>}

      {/* 最新の結果 */}
      {result && (
        <div className="p-4 bg-green-50 border rounded-xl">
          <h2 className="font-bold text-lg">{result.name}</h2>
          <p className="text-sm mt-2">{result.summary}</p>
        </div>
      )}

      {/* 履歴セクション */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">検索履歴 ({history.length})</h2>
          <button onClick={clearHistory} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded">履歴全消去</button>
        </div>
        <div className="space-y-4">
          {history.map((item, i) => (
            <div key={i} className="p-3 border rounded-lg flex gap-3 text-sm">
              <img src={item.image} className="w-16 h-16 object-cover rounded" />
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-gray-500">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}