import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { cartStore, type CartItem } from "@/store/cart-store";
import { wishlistStore } from "@/store/wishlist-store";
import { fetchUserCart, fetchUserWishlist } from "@/services/supabase";
import type { Product } from "@/services/products";

const UserDataContext = createContext({});

/**
 * Wraps the app inside AuthProvider.
 * On login  → sets userId in both stores, then fetches cart & wishlist from
 *             Supabase and loads them into the in-memory stores.
 * On logout → clears userId in both stores and wipes local state.
 */
export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Wait until auth has finished loading
    if (loading) return;

    const userId = user?.id ?? null;

    // Skip if userId hasn't changed (prevents double-run on strict-mode)
    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (userId) {
      // ── User just logged in ──────────────────────────────────────────────
      cartStore.setUserId(userId);
      wishlistStore.setUserId(userId);

      // Fetch cart rows and populate store
      fetchUserCart(userId)
        .then((rows) => {
          const items: CartItem[] = rows.map((row) => ({
            product: row.product_data as Product,
            qty: row.quantity,
          }));
          cartStore.loadFromDb(items);
        })
        .catch((e) => console.error("Failed to load cart from DB:", e));

      // Fetch wishlist rows and populate store
      fetchUserWishlist(userId)
        .then((rows) => {
          const products: Product[] = rows.map((row) => row.product_data as Product);
          wishlistStore.loadFromDb(products);
        })
        .catch((e) => console.error("Failed to load wishlist from DB:", e));
    } else {
      // ── User just logged out ─────────────────────────────────────────────
      cartStore.setUserId(null);
      wishlistStore.setUserId(null);
      // Clear local state (DB is preserved for next login)
      cartStore.loadFromDb([]);
      wishlistStore.clearAll();
    }
  }, [user, loading]);

  return (
    <UserDataContext.Provider value={{}}>
      {children}
    </UserDataContext.Provider>
  );
}

export const useUserData = () => useContext(UserDataContext);
