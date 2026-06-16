import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingCart, Menu, X, Facebook, Instagram, Twitter, Linkedin, Phone } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "All Products" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Navbar() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchVal.trim())}`;
    } else {
      window.location.href = `/products`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-gradient shadow-md border-none">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BRAND LOGO - Text Logo per User Request 6 & 7 */}
        <Link to="/" className="flex flex-col items-start leading-none select-none no-underline">
          <span className="font-sans text-xl font-extrabold tracking-tight text-white">
            RUBRIQ<span className="text-yellow-300 font-light">Africa</span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-white/70 font-semibold mt-0.5">
            Enterprises Ltd.
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative inline-block font-semibold transition-all duration-300 ease-in-out text-white/90 hover:text-yellow-300 hover:scale-110 origin-center ${
                    active ? "text-yellow-300 font-bold" : ""
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-yellow-300" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/cart"
            className="relative text-white/90 transition-all duration-300 ease-in-out hover:text-yellow-300 hover:scale-110 origin-center inline-block"
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black shadow-md">
                {count}
              </span>
            )}
          </Link>

          <Link
            to="/login"
            className="inline-block font-semibold text-white/90 transition-all duration-300 ease-in-out hover:text-yellow-300 hover:scale-110 origin-center"
          >
            Log In
          </Link>

          <Button
            asChild
            className="rounded-full bg-white text-secondary hover:bg-white/95 hover:text-secondary-foreground hover:scale-105 px-5 h-10 text-sm font-semibold transition-all duration-300 ease-in-out shadow-sm"
          >
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-white md:hidden hover:text-yellow-300 transition-smooth"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-brand-gradient px-4 pb-4 md:hidden animate-fade-in">
          <ul className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-1 font-semibold text-white/95 hover:text-yellow-300 transition-smooth"
                >
                  {l.label}
                </Link>
              </li>
            ))}

            <li className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="font-semibold text-white/95 hover:text-yellow-300 transition-smooth"
              >
                Cart ({count})
              </Link>
              <div className="flex gap-6 pt-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-white/90 hover:text-yellow-300 transition-smooth"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-yellow-300 hover:underline transition-smooth"
                >
                  Sign Up
                </Link>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* SECOND ROW: SUB-NAVBAR WITH SCREENSHOT STYLE */}
      <div className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 py-3 border-t border-b border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left / Middle components */}
          <div className="flex flex-wrap items-center gap-10">
            {/* Categories dropdown / button */}
            <div className="relative group">
              <button 
                type="button"
                className="rounded-xl bg-[#F15A24] text-white hover:bg-[#F15A24]/90 border-none font-bold text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                Categories
              </button>
              <div className="absolute left-0 mt-1.5 hidden group-hover:block w-40 bg-white text-slate-800 rounded-xl shadow-lg border p-1.5 z-50 animate-fade-in">
                <Link to="/products" className="block px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted">All Categories</Link>
                <Link to="/products?category=Bricks" className="block px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted">Bricks</Link>
                <Link to="/products?category=Pavers" className="block px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted">Pavers</Link>
                <Link to="/products?category=Blocks" className="block px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted">Blocks</Link>
              </div>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:opacity-80 transition-smooth" title="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#E1306C] hover:opacity-80 transition-smooth" title="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:opacity-80 transition-smooth" title="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:opacity-80 transition-smooth" title="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://wa.me/256704363651" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:opacity-80 transition-smooth flex items-center" title="WhatsApp">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.588 1.45 5.62 1.451 5.61.002 10.174-4.515 10.177-10.066.002-2.69-1.04-5.217-2.93-7.11C17.525 1.545 15.02 1.5 12.01 1.5c-5.611 0-10.174 4.515-10.177 10.067-.001 2.056.54 4.061 1.567 5.84l-1.023 3.733 3.84-1.006zm12.39-6.07c-.33-.165-1.951-.963-2.251-1.072-.3-.11-.518-.165-.736.165-.218.33-.846 1.072-1.037 1.29-.19.218-.382.245-.712.08-.33-.165-1.392-.513-2.653-1.64-1-.89-1.674-1.99-1.87-2.32-.19-.33-.02-.508.145-.672.15-.147.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.054-.412-.028-.577-.08-.165-.736-1.775-1.01-2.433-.267-.643-.538-.556-.736-.566-.19-.01-.408-.01-.626-.01-.218 0-.573.082-.873.411-.3.33-1.145 1.118-1.145 2.724 0 1.607 1.172 3.16 1.336 3.38 1.66 2.185 3.84 3.395 6.02 4.298 2.18 1.022 2.18.682 2.97.6 1.375-.125 2.25-.863 2.502-1.64.254-.776.254-1.44.178-1.577-.077-.137-.282-.218-.612-.383z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right text */}
          <div className="text-sm font-semibold tracking-wide flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Phone className="h-4 w-4 text-[#25D366]" />
            <span>Call Directly:</span>
            <a href="tel:+256704363651" className="underline hover:text-[#F15A24] dark:hover:text-[#F15A24] text-slate-900 dark:text-white font-extrabold tracking-wider">
              +256 704 363 651
            </a>
          </div>
        </div>
        
        {/* Search Bar Row */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2.5 pb-1 flex justify-center">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-2xl">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search products by name........."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl pr-10 border border-slate-200 dark:border-slate-800 h-10 placeholder:text-slate-400 font-semibold focus-visible:ring-brand-green shadow-sm"
              />
            </div>
            <Button type="submit" className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-10 px-5 shadow-sm">
              🔍
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
