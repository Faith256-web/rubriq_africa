import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "./products";
import { BACKEND_URL } from "./api";

export type CartItem = { product: Product; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string | number) => void;
  setQty: (id: string | number, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "rubriq.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  // Load existing cart from localStorage on first render.
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Sync with backend cart if logged in, fallback to local storage on logout
  useEffect(() => {
    let active = true;

    const fetchCart = () => {
      const token = localStorage.getItem("rubriq.token.v1");
      if (!token) {
        try {
          const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
          setItems((prev) => {
            const hasChanged = JSON.stringify(local) !== JSON.stringify(prev);
            return hasChanged ? local : prev;
          });
        } catch {
          setItems([]);
        }
        return;
      }

      fetch(`${BACKEND_URL}/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (!active) return;
        const mapped: CartItem[] = (data.items || []).map((item: any) => ({
          product: {
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: "Bricks",
            unit: "per unit",
            description: "",
            stock: 99999,
          },
          qty: item.qty,
        }));
        setItems((prev) => {
          const hasChanged = JSON.stringify(mapped) !== JSON.stringify(prev);
          return hasChanged ? mapped : prev;
        });
      })
      .catch(() => {});
    };

    fetchCart();

    const interval = setInterval(fetchCart, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Persist cart whenever it changes.
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (p, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      if (found) return prev.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { product: p, qty }];
    });
    toast.success(`${p.name} added to cart`);
  };
  const remove: CartCtx["remove"] = (id) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    );
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * i.product.price, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
