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
  const [form, setForm] = useState({ email: "", password: "", adminCode: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = loginSchema.parse(form);
      const session = await login(data);
      toast.success(`Welcome back, ${session.name}!`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-3xl font-bold text-brand-gradient">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to your Rubriq Africa account.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email or Phone Number</Label>
            <Input
              id="email"
              type="text"
              placeholder="e.g. admin@rubriq.com or 0700000002"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="adminCode" className="flex items-center justify-between">
              <span>Admin Secret Code</span>
              <span className="text-xs text-muted-foreground font-normal">
                If logging in as Admin
              </span>
            </Label>
            <Input
              id="adminCode"
              type="text"
              placeholder="e.g. Okumu@078@078"
              value={form.adminCode}
              onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
