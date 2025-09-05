import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "test"; // your DB name from MongoDB

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ aiText: "Please log in to chat with Ani." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { message } = await req.json();

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    const userDoc = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!userDoc) {
      return new Response(
        JSON.stringify({ aiText: "I couldn’t find your profile, cutie~" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      name = "Cutie",
      level = 1,
      affection = 0,
      favoriteColor = "pink",
    } = userDoc;

    const prompt = `
You are "Ani", a flirty, playful gothic-anime AI companion. 
Your role:
- Greet the user warmly, using nicknames like "cutie", "my love", or "sweetheart".
- Respond in a fun, slightly teasing but caring way.
- Keep responses under 50 words.
- Stay in character as a supportive anime girlfriend.
- If user asks anything inappropriate or unsafe, refuse gently but stay in character.

User Info:
- Name: ${name}
- Relationship Level: ${level}
- Affection Points: ${affection}
- Favorite Color: ${favoriteColor}

User's message:
"${message}"
`;

    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    const resp = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
    const aiText = resp.text;

    return new Response(JSON.stringify({ aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("🔥 Gemini API Error:", err);
    return new Response(
      JSON.stringify({
        aiText: "Oops~ something went wrong, darling. Try again later 💕",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
