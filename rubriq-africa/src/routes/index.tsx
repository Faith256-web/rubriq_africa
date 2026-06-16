// Home / Landing page — hero with construction workers image, stats, featured products, CTA.
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import hero from "@/assets/pavers_applied.png";
import bgPavers from "@/assets/pavers_applied.png";
import { Button } from "@/components/ui/button";
import { products, formatUGX, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { getImageUrl, BACKEND_URL } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rubriq Africa for Sustainable Bricks & Pavers in Uganda" },
      {
        name: "description",
        content:
          "Eco-friendly bricks, pavers, blocks proudly built in Uganda. One year of trusted craftsmanship.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { add } = useCart();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeatured(data.slice(0, 3));
        } else {
          setFeatured(products.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error("Failed to load featured products:", err);
        setFeatured(products.slice(0, 3));
      });
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Construction workers laying pavers"
          width={1600}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-gradient-soft mix-blend-multiply" />

        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center text-white sm:py-36">
          <span className="inline-block rounded-full bg-secondary px-4 py-1 text-sm font-semibold shadow-brand"></span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-white sm:text-7xl">
            Building{" "}
            <span className="text-secondary underline decoration-secondary decoration-4 underline-offset-4">
              Sustainable
            </span>{" "}
            Uganda
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white opacity-95">
            From recycled rubber pavers to kiln-fired clay bricks Rubriq Africa crafts durable,
            eco-friendly construction materials for a greener tomorrow.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Link to="/products">
                Explore Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link to="/about">Our Mission</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#115e3b] py-16 px-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-black/35 backdrop-blur-md py-10 px-8 shadow-2xl">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {/* COLUMN 1: TIRES */}
            <div className="flex flex-col items-center text-white">
              {/* Recycling icon */}
              <svg className="h-8 w-8 text-white/90 mb-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17" />
              </svg>
              <p className="font-display text-4xl font-extrabold">2,400+</p>
              <p className="mt-1.5 text-xs text-white/80 tracking-wide font-medium uppercase">Vehicle Tires Recycled</p>
            </div>

            {/* COLUMN 2: BRICKS */}
            <div className="flex flex-col items-center text-white">
              {/* Brick Wall icon */}
              <svg className="h-8 w-8 text-white/90 mb-3 fill-current" viewBox="0 0 24 24">
                <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 14H5v-2h5v2zm0-4H5v-2h5v2zm0-4H5V6h5v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V6h7v2z"/>
              </svg>
              <p className="font-display text-4xl font-extrabold">18,000+</p>
              <p className="mt-1.5 text-xs text-white/80 tracking-wide font-medium uppercase">Bricks & Pavers Produced</p>
            </div>

            {/* COLUMN 3: ESTABLISHED */}
            <div className="flex flex-col items-center text-white">
              {/* Map pin icon */}
              <svg className="h-8 w-8 text-white/90 mb-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-display text-4xl font-extrabold">2025</p>
              <p className="mt-1.5 text-xs text-white/80 tracking-wide font-medium uppercase">Established in Mbale</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-display text-4xl font-bold">Why Rubriq Africa</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Leaf,
              t: "Eco-conscious",
              d: "We turn recycled tires into durable pavers keeping waste out of landfills.",
            },
            {
              Icon: ShieldCheck,
              t: "Built to last",
              d: "Materials are tested for compressive strength and finished with care.",
            },
            {
              Icon: Truck,
              t: "Nationwide delivery",
              d: "We supply to all parts of Uganda from Mbale to your project site.",
            },
          ].map(({ Icon, t, d }) => (
            <div
              key={t}
              className="rounded-2xl border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${bgPavers})`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl font-bold">Featured products</h2>
            <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {featured.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl bg-card shadow-card transition-smooth hover:-translate-y-1"
              >
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-56 w-full object-cover transition-smooth group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400";
                  }}
                />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {p.category}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-display text-2xl font-bold text-brand-gradient">
                        {formatUGX(p.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.unit}</p>
                    </div>
                    <div>
                      {p.stock > 0 ? (
                        <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          {p.stock.toLocaleString()} in stock
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => add(p)}
                    disabled={p.stock <= 0}
                    className="mt-4 w-full rounded-full bg-brand-gradient text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:brightness-110 hover:shadow-brand"
                  >
                    {p.stock > 0 ? "Add to cart" : "Out of stock"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto my-20 max-w-5xl rounded-3xl bg-brand-gradient px-8 py-14 text-center text-primary-foreground shadow-brand">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Have a project in mind?</h2>
        <p className="mx-auto mt-3 max-w-xl opacity-95">
          Tell us what you're building and we'll make it come to life.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 rounded-full bg-background text-primary hover:bg-background/90"
        >
          <Link to="/contact">Send an inquiry</Link>
        </Button>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-20 border-t border-b border-slate-100/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold">What our clients say</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Read reviews from homeowners, developers, and engineers who trust Rubriq Africa materials.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "David Okello",
                role: "Real Estate Developer, Kampala",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                review: "The eco-rubber pavers from Rubriq Africa are outstanding. Not only do they look beautiful on our driveways, but the slip-resistant texture provides great safety. Our clients love the green sustainability aspect too!"
              },
              {
                name: "Sarah Namubiru",
                role: "Homeowner, Jinja",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                review: "We used their rubber bricks for our walkway and couldn't be happier. The colors are vibrant, and they are incredibly soft and durable underfoot. The delivery to Jinja was prompt and hassle-free."
              },
              {
                name: "John Mulema",
                role: "Civil Engineer, Mbale",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
                review: "As an engineer, material durability is my top priority. Rubriq Africa's clay bricks and blocks have excellent compressive strength and precise consistency. It's refreshing to have high-quality local materials."
              }
            ].map((rev) => (
              <div key={rev.name} className="flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1">
                <div>
                  {/* Stars */}
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    "{rev.review}"
                  </p>
                </div>
                
                <div className="mt-6 flex items-center gap-4 border-t pt-4 border-slate-100">
                  <img 
                    src={rev.image} 
                    alt={rev.name} 
                    className="h-12 w-12 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                  />
                  <div>
                    <h4 className="font-semibold text-base leading-tight">{rev.name}</h4>
                    <p className="text-xs text-secondary mt-0.5 font-medium">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
