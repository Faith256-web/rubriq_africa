// Cart page — review items, update quantities, mock checkout (no payment per scope).
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatUGX } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Rubriq Africa" }] }),
  component: Cart,
});

function Cart() {
  const { items, remove, setQty, total, clear } = useCart();

  if (items.length === 0)
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Browse our catalogue and add items to your cart.
        </p>
        <Button asChild className="mt-6 rounded-full bg-brand-gradient text-primary-foreground">
          <Link to="/products">Shop products</Link>
        </Button>
      </section>
    );

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card">
              <img
                src={product.image}
                alt={product.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-display text-lg font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatUGX(product.price)} · {product.unit}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(product.id, Number(e.target.value))}
                    className="w-20 rounded-md border bg-background px-2 py-1"
                  />
                  <button
                    onClick={() => remove(product.id)}
                    className="text-destructive transition-smooth hover:opacity-80"
                    aria-label="remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="font-display text-lg font-bold text-brand-gradient">
                {formatUGX(product.price * qty)}
              </p>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold">Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatUGX(total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-muted-foreground">
            <span>Delivery</span>
            <span>Calculated at delivery</span>
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-brand-gradient">{formatUGX(total)}</span>
          </div>
          <Button
            onClick={() => {
              toast.success("Order request sent we'll confirm shortly.");
              clear();
            }}
            className="mt-5 w-full rounded-full bg-brand-gradient text-primary-foreground hover:opacity-90"
          >
            Place order
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Online payments are not yet supported. We'll arrange invoicing.
          </p>
        </aside>
      </div>
    </section>
  );
}
