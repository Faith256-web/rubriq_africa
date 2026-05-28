import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, registerRequest, registerVerify } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Rubriq Africa" }] }),
  component: Signup,
});

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    method: "email" as "email" | "sms",
  });
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [returnedOtp, setReturnedOtp] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = registerSchema.parse(form);
      const res = await registerRequest(parsed);
      toast.success(res.message);
      
      // If backend returned the OTP code directly for dev/testing, save it to show in UI
      if (res.otp_code) {
        setReturnedOtp(res.otp_code);
      }
      
      setStep("otp");
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the verification code");
      return;
    }
    setLoading(true);
    try {
      const session = await registerVerify(form.email, otpCode);
      toast.success(`Account verified! Welcome to Rubriq Africa, ${session.name}!`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <section className="mx-auto max-w-md px-6 py-20">
        <div className="rounded-3xl border bg-card p-8 shadow-card text-center">
          <h1 className="font-display text-3xl font-bold text-brand-gradient">Verification</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a 6-digit verification code to <span className="font-semibold text-foreground">{form.method === "email" ? form.email : form.phone}</span>.
          </p>

          {returnedOtp && (
            <div className="mt-4 rounded-xl bg-primary/10 p-3 text-xs border border-primary/20 text-primary">
              <span className="font-bold">🧑‍💻 Developer Notice:</span> Since email/SMS may not be configured, here is the OTP: <span className="font-bold text-base select-all">{returnedOtp}</span>
            </div>
          )}

          <form onSubmit={handleRegisterVerify} className="mt-6 space-y-4 text-left">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength={6}
                className="text-center font-mono text-2xl tracking-widest"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <button
            onClick={() => setStep("form")}
            className="mt-6 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Back to sign up
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-3xl font-bold text-brand-gradient">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join Rubriq Africa today.</p>

        <form onSubmit={handleRegisterRequest} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0700000000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
            <p className="mt-1 text-xs text-muted-foreground">Min 8 characters.</p>
          </div>

          <div>
            <Label className="block mb-2">Verification Method</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, method: "email" })}
                className={`py-2 px-4 rounded-xl border text-sm font-semibold transition ${
                  form.method === "email"
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                Send via Email
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, method: "sms" })}
                className={`py-2 px-4 rounded-xl border text-sm font-semibold transition ${
                  form.method === "sms"
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                Send via SMS
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Requesting code..." : "Sign up"}
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
