// Login page — uses local mock auth (replace with /api/auth/login + JWT cookies later).
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, loginSchema } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Rubriq Africa" }] }),
  component: Login,
});

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = loginSchema.parse(form);
      login(data);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-3xl font-bold text-brand-gradient">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to your Rubriq Africa account.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button type="submit" className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90">Log in</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
