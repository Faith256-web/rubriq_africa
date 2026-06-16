/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatUGX } from "@/lib/products";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { getImageUrl, BACKEND_URL } from "@/lib/api";

export const Route = createFileRoute("/cart")({
  component: Cart,
  head: () => ({ meta: [{ title: "Your Cart — Rubriq Africa" }] }),
});

const API = `${BACKEND_URL}/api/cart`;

function Cart() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = getToken(); // Get central authenticated JWT token

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!token) {
        setItems([]);
        setTotal(0);
        return;
      }

      const res = await fetch(API + "/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve cart items");
      }

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ---------------- UPDATE QTY ----------------
  const updateQty = async (product_id: number, quantity: number) => {
    if (!token) return;
    try {
      const res = await fetch(API + "/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id, quantity }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update quantity");
      }
      fetchCart();
    } catch (err) {
      toast.error((err as Error).message || "Failed to update quantity");
    }
  };

  // ---------------- REMOVE ITEM ----------------
  const removeItem = async (product_id: number) => {
    if (!token) return;
    try {
      await fetch(`${API}/remove/${product_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Item removed");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // ---------------- CLEAR CART ----------------
  const clearCart = async () => {
    if (!token) return;
    try {
      await fetch(API + "/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems([]);
      setTotal(0);
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  // ---------------- CHECKOUT ----------------
  const checkout = async () => {
    if (!token) return;
    try {
      await fetch(API + "/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Order placed successfully");
      clearCart();
    } catch (err) {
      toast.error("Failed to checkout");
    }
  };

  // ---------------- EMPTY STATE ----------------
  if (!loading && items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Browse our catalogue and add items to your cart.
        </p>
        <Button asChild className="mt-6 rounded-full bg-brand-gradient">
          <Link to="/products">Shop products</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Your cart</h1>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading cart...</p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* ITEMS */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card"
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400";
                  }}
                />

                <div className="flex-1">
                  <p className="font-display text-lg font-semibold">{item.name}</p>

                  <p className="text-sm text-muted-foreground">{formatUGX(item.price)}</p>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateQty(item.product_id, Number(e.target.value))}
                      className="w-20 rounded-md border px-2 py-1"
                    />

                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-destructive hover:opacity-80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="font-bold text-brand-gradient">{formatUGX(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold">Summary</h2>

            <div className="mt-4 flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatUGX(total)}</span>
            </div>

            <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-brand-gradient">{formatUGX(total)}</span>
            </div>

            <Button onClick={checkout} className="mt-5 w-full rounded-full bg-brand-gradient">
              Place order
            </Button>

            <Button variant="outline" onClick={clearCart} className="mt-3 w-full">
              Clear cart
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Mock checkout — invoice will be arranged manually.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
