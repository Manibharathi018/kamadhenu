import { useSyncExternalStore } from "react";
import type { Product } from "@/services/products";
import { upsertWishlistItem, removeWishlistItem } from "@/services/supabase";

const KEY = "saree_wishlist_v1";
let wishlist: Product[] = [];
let currentUserId: string | null = null;
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

  /** Called by UserDataProvider when auth state changes */
  setUserId(id: string | null) {
    currentUserId = id;
  },

  /** Bulk-load from DB rows (login sync) — does NOT write back to DB */
  loadFromDb(products: Product[]) {
    wishlist = products;
    persist();
  },

  toggle(product: Product) {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      wishlist = wishlist.filter((p) => p.id !== product.id);
      persist();
      if (currentUserId) removeWishlistItem(currentUserId, String(product.id));
    } else {
      wishlist = [...wishlist, product];
      persist();
      if (currentUserId) upsertWishlistItem(currentUserId, String(product.id), product);
    }
  },

  has(id: string) {
    return wishlist.some((p) => p.id === id);
  },

  remove(id: string) {
    wishlist = wishlist.filter((p) => p.id !== id);
    persist();
    if (currentUserId) removeWishlistItem(currentUserId, String(id));
  },

  /** Clear local state only (used on logout) */
  clearAll() {
    wishlist = [];
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
    listeners.forEach((l) => l());
  },
};

export function useWishlist() {
  return useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );
}
