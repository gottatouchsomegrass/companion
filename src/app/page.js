"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMsg = { role: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 tracking-wide">
        Ani <span className="text-pink-400">💖</span> Chat
      </h1>

      {/* Chat Window */}
      <div className="w-full max-w-md bg-gray-800/60 backdrop-blur-lg p-4 rounded-2xl shadow-xl flex flex-col space-y-3 overflow-y-auto h-[28rem] border border-gray-700">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="text-gray-400 text-sm italic animate-pulse">
            Ani is thinking...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex mt-4 w-full max-w-md">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-l-2xl bg-gray-700/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={sendMessage}
          className="bg-pink-500 px-5 font-medium rounded-r-2xl hover:bg-pink-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
