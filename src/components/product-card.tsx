import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { wishlistStore, useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/auth-context";

export function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    wishlistStore.toggle(product);
  };

  return (
    <Link to="/product/$id" params={{ id: product.id }}
      className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary">
        <img src={product.image} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-royal/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <button
          onClick={handleWishlistToggle}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ivory/90 backdrop-blur transition-colors ${
            isWishlisted
              ? "text-red-500"
              : "text-foreground/70 hover:text-red-400"
          }`}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`h-4 w-4 transition-all ${isWishlisted ? "fill-red-500" : ""}`} />
        </button>
        <div className="absolute bottom-3 left-3 rounded-full bg-gold/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          Silk Mark
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-lg leading-snug text-foreground line-clamp-2 group-hover:text-royal transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-semibold text-royal">{formatINR(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
        </div>
      </div>
    </Link>
  );
}
