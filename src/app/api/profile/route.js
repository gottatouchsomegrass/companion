import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { progressToNext, levelFromXp } from "@/lib/affection";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("chatbot");

    const profile = await db.collection("profiles").findOne({ userId: email });

    if (!profile) {
      return NextResponse.json({
        affection: {
          level: 1,
          currentXp: 0,
          levelStartXp: 0,
          nextLevelXp: 15,
          pct: 0,
        },
      });
    }

    const progress = progressToNext(profile.totalXp);

    return NextResponse.json({ affection: progress });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
