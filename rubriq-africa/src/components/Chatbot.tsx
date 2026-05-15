// Floating AI chatbot widget — uses canned rule-based replies for now (no backend).
// Swap `reply()` with a real API call once Lovable Cloud + Lovable AI Gateway is enabled.
import React, { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "bot" | "user"; text: string };

// Very small keyword-based assistant standing in for a real LLM.
function reply(input: string): string {
  const q = input.toLowerCase();
  if (/price|cost|ugx/.test(q)) {
    return "Our products start from 1,200 UGX (clay brick). Visit Products for the full price list.";
  }
  if (/deliver|shipping/.test(q)) {
    return "We deliver across Uganda. Contact us with your location for a quote.";
  }
  if (/about|company/.test(q)) {
    return "Rubriq Africa is a 1-year-old Ugandan firm making sustainable bricks and pavers from local and recycled materials.";
  }
  if (/contact|phone|email/.test(q)) {
    return "You can reach us at hello@rubriq.africa or +256 700 000 000.";
  }
  if (/paver|brick|block|stock/.test(q)) {
    return "We stock clay bricks, grey & cobble pavers, recycled-rubber pavers, hollow blocks and kerbs. See the Products page.";
  }
  if (/hello|hi|hey/.test(q)) {
    return "Hello! 👋 I'm Rubi, the Rubriq assistant. Ask me about products, prices or delivery.";
  }
  return "Thanks! A teammate will follow up. In the meantime, browse our Products page or send an inquiry on Contact.";
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi, I'm Rubi 👋 — how can I help you today?" },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "bot", text: reply(t) }]);
    setText("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-primary-foreground shadow-brand transition-smooth hover:scale-105"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-115 w-85 flex-col overflow-hidden rounded-2xl border bg-card shadow-brand">
          <div className="bg-brand-gradient px-4 py-3 text-primary-foreground">
            <p className="font-display text-lg font-semibold">Rubi · Live Chat</p>
            <p className="text-xs opacity-90">We typically reply in a minute</p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-muted/40 p-3 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground shadow-card"}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t bg-card p-2"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
            />
            <Button type="submit" size="icon" className="bg-brand-gradient text-primary-foreground">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
