// Products page — grid with filter, Add to Cart, UGX pricing.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { products, formatUGX, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import bg from "@/assets/rubber_bricks.png";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Bricks, Pavers & Blocks | Rubriq Africa" },
      {
        name: "description",
        content:
          "Browse Rubriq Africa's catalogue of bricks, pavers, blocks and we offer nationwide delivery.",
      },
    ],
  }),
  component: Products,
});

const categories = ["All", "Bricks", "Pavers", "Blocks", "Kerbs"] as const;

function Products() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const { add } = useCart();
  const list: Product[] = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-brand-gradient-soft mix-blend-multiply" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center text-white">
          <h1 className="font-display text-5xl font-bold">Our Products</h1>
          <p className="mt-3 opacity-95">Crafted in Uganda.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Category filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-smooth ${cat === c ? "bg-brand-gradient text-primary-foreground shadow-brand" : "border bg-card text-foreground hover:bg-muted"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-smooth hover:-translate-y-1"
            >
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {p.category}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-display text-2xl font-bold text-brand-gradient">
                      {formatUGX(p.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.unit} · {p.stock.toLocaleString()} in stock
                    </p>
                  </div>
                </div>
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
      </section>
    </>
  );
}
