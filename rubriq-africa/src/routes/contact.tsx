import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BACKEND_URL } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us" },
      {
        name: "description",
        content: "Send us an inquiry and we will respond within 24 hours.",
      },
    ],
  }),
  component: Contact,
});

const API_URL = `${BACKEND_URL}/api/inquiries`;

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = inquirySchema.safeParse(form);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send inquiry");
      }

      setForm({ name: "", email: "", message: "" });
      toast.success("Thank you! We'll be in touch within 24 hours.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold text-brand-gradient">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Tell us about your project needs, bricks, pavers, blocks or anything in between.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-5">
          {[
            {
              Icon: MapPin,
              title: "Visit us",
              desc: "Plot 6 Nsoba Lane, Mbale, Uganda",
            },
            {
              Icon: Phone,
              title: "Call us",
              desc: "+256 704 363 651",
            },
            {
              Icon: Mail,
              title: "Email us",
              desc: "info@rubriq.africa",
            },
          ].map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Write your message..."
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
          >
            {busy ? "Sending..." : "Send inquiry"}
          </Button>
        </form>
      </div>
    </section>
  );
}
