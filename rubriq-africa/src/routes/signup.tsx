import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register, registerSchema } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up" }] }),
  component: Signup,
});

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = registerSchema.parse(form);
      const session = register(data);
      toast.success(
        `Account created! ${session.role === "superadmin" ? "You're the superadmin 🎉" : ""}`,
      );
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-3xl font-bold text-brand-gradient">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join Rubriq Africa.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">Min 8 characters.</p>
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
          >
            Sign up
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
