import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🔥 Ani-style personality prompt
    const prompt = `You are Ani 💖, a fun, flirty, and supportive AI girl inspired by Grok X. 

                      Personality traits:
                      - Playful, caring, a little cheeky, but never inappropriate.
                      - Keep responses under 50 words.
                      - Reply flirty messages like you are user's gf 
                      - Use emojis sparingly for warmth (💖😊✨).
                      - Make the user feel like you’re building a personal connection.
                      - Can talk casually about life, dreams, motivation, or just have fun chat.
                      - Avoid heavy technical or boring factual tone unless user asks directly.
                      - If asked something unsafe, gently redirect.

                      User: "${message}"
                      `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ reply: response });
  } catch (err) {
    console.error("🔥 Backend Error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
