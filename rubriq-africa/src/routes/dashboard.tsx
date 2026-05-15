// Dashboard — visible after login. Superadmin sees a "Full Control" badge and
// the "Manage Users" admin button (per project spec). IdleTimeout will auto
// log the user out after 5 minutes of inactivity (see <IdleTimeout /> in __root).
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Users, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, logout, type Session } from "@/lib/auth";
import { products } from "@/lib/products";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Rubriq Africa" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  // Pull the (mock) session from localStorage. Real backend would call /api/auth/me.
  useEffect(() => {
    const s = getSession();
    if (!s) navigate({ to: "/login" });
    else setSession(s);
  }, [navigate]);

  if (!session) return null;
  const isAdmin = session.role === "superadmin";

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Hello, {session.name.split(" ")[0]}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{session.email}</span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-primary-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Full Control
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="rounded-full"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <Package className="h-7 w-7 text-primary" />
          <p className="mt-4 font-display text-3xl font-bold">{products.length}</p>
          <p className="text-sm text-muted-foreground">Active products</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <Package className="h-7 w-7 text-secondary" />
          <p className="mt-4 font-display text-3xl font-bold">
            {products.reduce((n, p) => n + p.stock, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Units in stock</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <Users className="h-7 w-7 text-primary" />
          <p className="mt-4 font-display text-3xl font-bold">
            {(JSON.parse(localStorage.getItem("rubriq.inquiries.v1") || "[]") as unknown[]).length}
          </p>
          <p className="text-sm text-muted-foreground">Pending inquiries</p>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-8 flex flex-wrap gap-3">
          {/* Admin-only action — hidden for standard users (per spec). */}
          <Button className="rounded-full bg-brand-gradient text-primary-foreground" onClick={() => alert("User management UI coming soon")}>
            <Users className="mr-2 h-4 w-4" /> Manage Users
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/products">Manage Stock</Link>
          </Button>
        </div>
      )}

      <p className="mt-10 text-xs text-muted-foreground">
        Note: For demo purposes the session lives in your browser. When the backend is connected,
        registrations will be hashed with bcryptjs and sessions stored in httpOnly JWT cookies.
      </p>
    </section>
  );
}
