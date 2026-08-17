import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `この画像を専門家の視点で詳しく解析せよ。日本語で、以下のJSON形式のみで回答すること。
1. 名称 (キー名: name)
2. 詳細な解説と特徴（5行程度で詳しく） (キー名: summary)
3. 豆知識や注意点 (キー名: trivia)
4. 検索用キーワード (キー名: searchQuery)` 
            },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (error) {
    return NextResponse.json({ error: "解析に失敗しました。" }, { status: 500 });
  }
}