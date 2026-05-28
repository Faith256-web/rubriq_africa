// Background component that watches for user activity. After 5 minutes
// of inactivity it clears the (mock) session and redirects to /login.
// Swap the logout effect with a real /api/auth/logout call when the
// backend is wired up.
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { logout } from "@/lib/auth";

const FIVE_MIN = 5 * 60 * 1000;

export function IdleTimeout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only enforce idle-logout when the user is on a protected area (/dashboard).
    if (!pathname.startsWith("/dashboard")) return;

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        logout();
        navigate({ to: "/login", search: { reason: "idle" } as never });
      }, FIVE_MIN);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [pathname, navigate]);

  return null;
}
