"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import AffectionMeter from "@/components/AffectionMeter";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("demo@example.com");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
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
      

      <AffectionMeter email={email} refreshKey={messages.length} />
      {/* Chat Window */}
      {/* Chat Window */}
      {messages.length !== 0 ? (
        <div className="w-full max-w-md bg-gray-800/60 backdrop-blur-lg p-4 rounded-2xl shadow-xl flex flex-col space-y-3 overflow-y-auto h-[28rem] border border-gray-700 no-scrollbar transition-transform transform-all">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              {msg.role === "bot" && (
                <Image
                  src="/ani-avatar.png"
                  alt="Ani"
                  width={36}
                  height={36}
                  className="rounded-full mr-2 border border-pink-400"
                />
              )}

              {/* Bubble */}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
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

          {/* 🔽 Invisible marker at bottom */}
          <div ref={endRef} />
        </div>
      ) : (
        <div></div>
      )}

      {/* Input Box */}
      <div className="flex mt-4 w-full max-w-md ">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-l-2xl bg-gray-700/70 text-white placeholder-gray-400 outline-none focus:border-2 focus:border-pink-500"
        />
        <button
          onClick={sendMessage}
          className="bg-pink-500 px-5 font-medium rounded-r-2xl hover:bg-pink-600 transition "
        >
          Send
        </button>
      </div>
    </div>
  );
}
