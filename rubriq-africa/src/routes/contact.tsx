// Contact page — inquiry form (saved to localStorage; swap for /api/inquiries later).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us" },
      {
        name: "description",
        content: "Send us an inquiry  we will respond within 24 hours.",
      },
    ],
  }),
  component: Contact,
});

// Same Zod schema you'd send server-side. Catches malicious payloads early.
const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    // Mock store. Swap for: await fetch("/api/inquiries", { method: "POST", body: JSON.stringify(parsed.data) })
    const list = JSON.parse(localStorage.getItem("rubriq.inquiries.v1") || "[]");
    list.push({ ...parsed.data, at: new Date().toISOString() });
    localStorage.setItem("rubriq.inquiries.v1", JSON.stringify(list));
    setTimeout(() => {
      setBusy(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Thank you We'll be in touch within 24 hours.");
    }, 600);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold text-brand-gradient">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Tell us about your project needs bricks, pavers, blocks or anything in between.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {/* Contact details */}
        <div className="space-y-5">
          {[
            { Icon: MapPin, t: "Visit us", d: "Plot 6 Nsoba Lane, Mbale, Uganda" },
            { Icon: Phone, t: "Call us", d: "+256 704363651" },
            { Icon: Mail, t: "Email us", d: "info@rubriq.africa" },
          ].map(({ Icon, t, d }) => (
            <div
              key={t}
              className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
          >
            {busy ? "Sending…" : "Send inquiry"}
          </Button>
        </form>
      </div>
    </section>
  );
}
