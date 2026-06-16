/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Floating AI chatbot & real-time chat widget
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api";

type Msg = { role: "bot" | "user"; text: string; sender_name?: string };

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  let sessionId = localStorage.getItem("sessionId");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }

  return sessionId;
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"bot" | "human">("bot");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi, I'm Rubi 👋 — how can I help you today?" },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = getOrCreateSessionId();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Read chatMode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("rubriq.chat_mode.v1") as "bot" | "human";
    if (savedMode) {
      setChatMode(savedMode);
    }
  }, []);

  // Fetch previous messages
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/messages?session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((m: any) => ({
          role: m.sender_id === "admin" ? "bot" : "user",
          text: m.message,
          sender_name: m.sender_name,
        }));
        if (mapped.length > 0) {
          setMsgs(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [sessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Poll for admin agent answers
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, [open, sessionId]);

  const requestHuman = async () => {
    setChatMode("human");
    localStorage.setItem("rubriq.chat_mode.v1", "human");
    setMsgs((m) => [...m, { role: "user", text: "[System: Connecting to operator...]" }]);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: sessionId,
          recipient_id: "admin",
          sender_name: "Guest",
          message: "🙋 I would like to speak to a human operator.",
          chat_mode: "human", // tell backend not to trigger AI bot auto-reply
        }),
      });
      if (res.ok) {
        toast.success("Handoff requested. A human operator will assist you soon!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const send = async () => {
    const t = text.trim();
    if (!t || loading) return;

    // Add user message locally immediately
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setText("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: sessionId,
          recipient_id: "admin",
          sender_name: "Guest",
          message: t,
          chat_mode: chatMode,
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      if (data.bot_reply) {
        setMsgs((m) => [
          ...m,
          { role: "bot", text: data.bot_reply.message, sender_name: data.bot_reply.sender_name },
        ]);
      }
    } catch (err) {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "⚠️ Sorry, I couldn't send your message. Please check your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-primary-foreground shadow-brand transition-smooth hover:scale-105"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-115 w-87.5 flex-col overflow-hidden rounded-2xl border bg-card shadow-brand transition-smooth">
          {/* Header */}
          <div className="bg-brand-gradient px-4 py-3 text-primary-foreground flex justify-between items-center">
            <div>
              <p className="font-display text-lg font-semibold">Rubi · Live Chat</p>
              <p className="text-[10px] opacity-90">
                {chatMode === "bot" ? "🤖 AI Assistant Active" : "🙋 Human Handoff Active"}
              </p>
            </div>
            {chatMode === "bot" && (
              <button
                onClick={requestHuman}
                className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold rounded-full px-2.5 py-1 transition"
              >
                Talk to Human
              </button>
            )}
            {chatMode === "human" && (
              <button
                onClick={() => {
                  setChatMode("bot");
                  localStorage.setItem("rubriq.chat_mode.v1", "bot");
                  toast.success("Switched back to AI Assistant.");
                }}
                className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold rounded-full px-2.5 py-1 transition"
              >
                Use AI Bot
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {m.sender_name && m.role === "bot" && (
                  <span className="mb-0.5 text-[10px] text-muted-foreground ml-1">
                    {m.sender_name}
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card text-card-foreground border rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-card border rounded-tl-none px-3.5 py-2.5 text-muted-foreground shadow-sm">
                  <span className="flex items-center gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t bg-card p-3"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              disabled={loading}
              className="rounded-full bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />

            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-brand-gradient text-primary-foreground h-9 w-9 shrink-0 shadow-brand hover:opacity-90"
              disabled={loading || !text.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
