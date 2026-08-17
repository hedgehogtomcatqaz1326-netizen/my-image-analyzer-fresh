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
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("履歴の読み込みに失敗しました", e);
      }
    }
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
      
      // 確実に必要なデータをまとめる
      const newEntry = {
        name: data.name || "名称不明",
        summary: data.summary || "",
        trivia: data.trivia || "",
        searchQuery: data.searchQuery || data.name || "",
        image: base64Image,
        timestamp: new Date().toLocaleString()
      };

      setResult(newEntry);
      const newHistory = [newEntry, ...history];
      setHistory(newHistory);
      localStorage.setItem("analyzeHistory", JSON.stringify(newHistory));
    } catch (err) {
      alert("通信エラーが発生しました");
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

  // 履歴を1つずつ削除する
  const deleteHistoryItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem("analyzeHistory", JSON.stringify(newHistory));
  };

  // すべての履歴を消去する
  const clearHistory = () => {
    if (confirm("すべての履歴を消去しますか？")) {
      setHistory([]);
      localStorage.removeItem("analyzeHistory");
      setResult(null);
      setImage("");
    }
  };

  // 履歴をタップして詳細を再表示する
  const selectHistoryItem = (item: any) => {
    setImage(item.image);
    setResult(item);
    // 画面上部にスムーズスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold text-center">AIカメラ即時解析</h1>
      
      <label className="block w-full py-6 bg-blue-600 text-white font-bold text-center rounded-xl cursor-pointer hover:bg-blue-700 transition shadow">
        📷 撮影して解析する
        <input type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
      </label>

      {loading && <p className="text-center font-bold text-blue-600">AIが詳細解析中...</p>}

      {/* 現在選択中・解析中の結果表示 */}
      {result && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-xl space-y-4 shadow-sm">
          {image && (
            <div className="flex justify-center">
              <img src={image} alt="Selected" className="max-h-40 rounded-lg shadow border object-contain" />
            </div>
          )}
          <h2 className="text-xl font-bold text-green-900 border-b pb-2">{result.name}</h2>
          <div className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">{result.summary}</div>
          {result.trivia && (
            <p className="text-xs text-gray-600 italic bg-white p-3 rounded border">💡 {result.trivia}</p>
          )}

          {/* 類似画像検索ボタン */}
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

      {/* 履歴セクション */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">検索履歴 ({history.length})</h2>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition">
              履歴全消去
            </button>
          )}
        </div>
        <div className="space-y-3">
          {history.map((item, i) => (
            <div 
              key={i} 
              onClick={() => selectHistoryItem(item)}
              className="p-3 border rounded-lg flex items-center justify-between gap-3 text-sm bg-white hover:bg-gray-50 cursor-pointer shadow-sm transition"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={item.image} className="w-14 h-14 object-cover rounded shrink-0 bg-gray-100" />
                <div className="truncate">
                  <p className="font-bold truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
              </div>
              <button 
                onClick={(e) => deleteHistoryItem(i, e)}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded hover:bg-red-100 hover:text-red-600 shrink-0 transition"
                title="この履歴を削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}