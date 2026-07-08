import { useSyncExternalStore } from "react";
import type { Product } from "@/services/products";
import { upsertCartItem, removeCartItem, clearUserCart } from "@/services/supabase";

export type CartItem = { product: Product; qty: number };

const KEY = "saree_cart_v1";
let cart: CartItem[] = [];
let currentUserId: string | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) cart = JSON.parse(raw);
  } catch {}
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  getSnapshot() { return cart; },
  getServerSnapshot() { return [] as CartItem[]; },

  /** Called by UserDataProvider when auth state changes */
  setUserId(id: string | null) {
    currentUserId = id;
  },

  /** Bulk-load from DB rows (login sync) — does NOT write back to DB */
  loadFromDb(items: CartItem[]) {
    cart = items;
    persist();
  },

  add(product: Product, qty = 1) {
    const idx = cart.findIndex((i) => i.product.id === product.id);
    if (idx >= 0) {
      cart = cart.map((i, n) => (n === idx ? { ...i, qty: i.qty + qty } : i));
    } else {
      cart = [...cart, { product, qty }];
    }
    persist();
    if (currentUserId) {
      const updated = cart.find((i) => i.product.id === product.id);
      upsertCartItem(currentUserId, String(product.id), updated?.qty ?? qty, product);
    }
  },

  setQty(id: string, qty: number) {
    cart = cart.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    persist();
    if (currentUserId) {
      const item = cart.find((i) => i.product.id === id);
      if (item) upsertCartItem(currentUserId, String(id), item.qty, item.product);
    }
  },

  remove(id: string) {
    cart = cart.filter((i) => i.product.id !== id);
    persist();
    if (currentUserId) removeCartItem(currentUserId, String(id));
  },

  clear() {
    const uid = currentUserId;
    cart = [];
    persist();
    if (uid) clearUserCart(uid);
  },
};

export function useCart() {
  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 25000 ? 250 : 0;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    count: items.reduce((s, i) => s + i.qty, 0),
  };
}
