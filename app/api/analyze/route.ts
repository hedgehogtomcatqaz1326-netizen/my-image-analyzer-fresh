import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { image, language } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `この画像を解析し、${language}で以下のように簡潔にまとめて。
1. 商品・対象物名 (キー名: name)
2. 特徴や用途を3行の箇条書き (キー名: summary)
3. 注意点や豆知識を1行 (キー名: trivia)
出力は必ずJSON形式のみで回答し、余計な説明は含めないこと。` 
            },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (error) {
    return NextResponse.json({ error: "解析に失敗しました。画像を確認して再試行してください。" }, { status: 500 });
  }
}