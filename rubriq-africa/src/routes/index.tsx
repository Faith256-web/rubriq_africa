// Home / Landing page — hero with construction workers image, stats, featured products, CTA.
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import hero from "@/assets/pavers_applied.png";
import bgPavers from "@/assets/pavers_applied.png";
import { Button } from "@/components/ui/button";
import { products, formatUGX } from "@/lib/products";
import { useCart } from "@/lib/cart";

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
  const featured = products.slice(0, 3);

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
      <section className="bg-accent py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          {[
            { n: "3,400+", l: "Pavers laid" },
            { n: "18,000+", l: "Bricks supplied" },
            { n: "1 yr", l: "Of experience" },
            { n: "100%", l: "Made in Uganda" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-4xl font-bold text-brand-gradient">{s.n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
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
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl bg-card shadow-card transition-smooth hover:-translate-y-1"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-56 w-full object-cover transition-smooth group-hover:scale-105"
                />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {p.category}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{p.name}</h3>
                  <p className="mt-3 font-display text-2xl font-bold text-brand-gradient">
                    {formatUGX(p.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.unit}</p>
                  <Button
                    onClick={() => add(p)}
                    className="mt-4 w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
                  >
                    Add to cart
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
    </>
  );
}
