import { useSyncExternalStore } from "react";
import type { Product } from "./products";

const KEY = "saree_wishlist_v1";
let wishlist: Product[] = [];
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) wishlist = JSON.parse(raw);
  } catch {}
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(wishlist));
  }
  listeners.forEach((l) => l());
}

export const wishlistStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  getSnapshot() { return wishlist; },
  getServerSnapshot() { return [] as Product[]; },
  toggle(product: Product) {
    const exists = wishlist.some((p) => p.id === product.id);
    wishlist = exists
      ? wishlist.filter((p) => p.id !== product.id)
      : [...wishlist, product];
    persist();
  },
  has(id: string) {
    return wishlist.some((p) => p.id === id);
  },
  remove(id: string) {
    wishlist = wishlist.filter((p) => p.id !== id);
    persist();
  },
};

export function useWishlist() {
  return useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );
}
