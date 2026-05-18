import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

import logo from "@/assets/Logo.jpg"; // change path if needed

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-gradient shadow-brand">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Rubriq Africa Logo" className="h-10 w-auto object-contain sm:h-12" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative font-medium text-primary-foreground/90 transition-smooth hover:text-primary-foreground ${
                    active ? "text-primary-foreground" : ""
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary-foreground" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/cart"
            className="relative text-primary-foreground transition-smooth hover:opacity-80"
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-xs font-bold text-primary">
                {count}
              </span>
            )}
          </Link>

          <Link to="/login" className="font-medium text-primary-foreground hover:opacity-80">
            Log In
          </Link>

          <Button
            asChild
            variant="secondary"
            className="rounded-full bg-background text-primary hover:bg-background/90"
          >
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-primary-foreground md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-primary-foreground/20 bg-brand-gradient px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-1 font-medium text-primary-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}

            <li className="flex gap-3 pt-2">
              <Link to="/cart" onClick={() => setOpen(false)} className="text-primary-foreground">
                Cart ({count})
              </Link>

              <Link to="/login" onClick={() => setOpen(false)} className="text-primary-foreground">
                Log In
              </Link>

              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="font-semibold text-primary-foreground underline"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
