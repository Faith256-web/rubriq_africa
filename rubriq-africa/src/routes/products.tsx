// Products page — connected to Flask backend (API version)
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatUGX, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { getImageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import bg from "@/assets/rubber_bricks.png";
import { toast } from "sonner";

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

const categories = ["All", "Bricks", "Pavers", "Blocks"] as const;

function Products() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  // =========================
  // FETCH PRODUCTS FROM BACKEND
  // =========================
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
  }, []);

  const list = cat === "All" ? products : products.filter((p) => p.category === cat);

  // =========================
  // ADD TO CART (BACKEND VERSION)
  // =========================
  const handleAddToCart = async (product: Product) => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add to cart");
      }

      toast.success(`${product.name} added to cart!`);
      // Update local cart context UI for immediate feedback
      add(product);
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error((err as Error).message || "Add to cart failed");
    }
  };

  return (
    <>
      {/* HERO SECTION */}
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
          <p className="mt-3 opacity-95">Eco-friendly materials, proudly crafted in Uganda.</p>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* CATEGORY FILTER */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-smooth ${
                cat === c
                  ? "bg-brand-gradient text-primary-foreground shadow-brand"
                  : "border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading && <p className="text-center text-muted-foreground">Loading products...</p>}

        {/* PRODUCT GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-smooth hover:-translate-y-1"
            >
              {/* IMAGE */}
              <div className="aspect-4/3 overflow-hidden bg-muted">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stock unsplash image if local images fail to load
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400";
                  }}
                />
              </div>

              {/* CONTENT */}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {p.category}
                </p>

                <h3 className="mt-1 font-display text-xl font-semibold">{p.name}</h3>

                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>

                {/* PRICE */}
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

                {/* BUTTONS */}
                <div className="mt-4 flex items-center gap-2">
                  {/* WhatsApp Inquiry Button */}
                  <Button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Hi, I'm interested in inquiring about the "${p.name}" priced at ${formatUGX(p.price)} ${p.unit}.`
                      );
                      window.open(`https://wa.me/256704363651?text=${text}`, "_blank");
                    }}
                    variant="outline"
                    className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-full p-2 h-10 w-10 flex-shrink-0 grid place-items-center"
                    title="Inquire on WhatsApp"
                  >
                    <svg
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.498 1.452 5.418 1.453 5.4 0 9.792-4.382 9.795-9.769.002-2.61-1.012-5.064-2.857-6.91C17.156 2.08 14.71 1.066 12.1 1.066c-5.4 0-9.791 4.382-9.795 9.769-.001 1.918.504 3.794 1.463 5.422l-1.009 3.682 3.774-.988z" />
                    </svg>
                  </Button>

                  <Button
                    onClick={() => handleAddToCart(p)}
                    className="flex-1 rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90 h-10"
                  >
                    Add to cart
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
