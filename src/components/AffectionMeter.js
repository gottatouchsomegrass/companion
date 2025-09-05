"use client";
import { useEffect, useState } from "react";

export default function AffectionMeter({ email, refreshKey }) {
  const [affection, setAffection] = useState(null);

  useEffect(() => {
    const fetchAffection = async () => {
      try {
        const res = await fetch(`/api/profile?email=${email}`);
        const data = await res.json();
        setAffection(data.affection);
      } catch (err) {
        console.error("Error fetching affection:", err);
      }
    };
    fetchAffection();
  }, [email, refreshKey]);

  if (!affection) return null;

  return (
    <div className="w-full max-w-md bg-gray-700 rounded-lg p-3 shadow mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Level {affection.level}</span>
        <span>
          {affection.currentXp}/{affection.nextLevelXp} XP
        </span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-3">
        <div
          className="bg-pink-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${affection.pct * 100}%` }}
        />
      </div>
    </div>
  );
}
