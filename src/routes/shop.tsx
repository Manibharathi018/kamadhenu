import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/lib/hooks";
import { SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || undefined,
    }
  },
  head: () => ({ meta: [{ title: "Shop Sarees — Kamadhenu Silks" }, { name: "description", content: "Browse our handwoven Kanchipuram silk saree collection." }] }),
  component: ShopPage,
});

function ShopPage() {
  const { q } = Route.useSearch();
  const [sort, setSort] = useState("new");
  const [occ, setOcc] = useState<string>("all");
  const { data: products = [], isLoading, error } = useProducts();

  const list = useMemo(() => {
    let l = [...products];
    if (q) {
      const lowerQ = q.toLowerCase();
      l = l.filter(p => p.name.toLowerCase().includes(lowerQ) || p.description.toLowerCase().includes(lowerQ) || p.category.toLowerCase().includes(lowerQ));
    }
    if (occ !== "all") l = l.filter(p => p.occasion === occ);
    if (sort === "low") l.sort((a, b) => a.price - b.price);
    if (sort === "high") l.sort((a, b) => b.price - a.price);
    return l;
  }, [sort, occ, products, q]);

  if (error) {
    return (
      <div className="min-h-screen bg-ivory">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <p className="text-red-600">Error loading products. Please try again later.</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="bg-royal-gradient text-royal-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">All Sarees</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">The Silk Atelier</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" /> {isLoading ? "Loading..." : `${list.length} pieces`}
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "Wedding", "Festive", "Reception"].map(o => (
              <button key={o} onClick={() => setOcc(o)}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${occ === o ? "border-royal bg-royal text-royal-foreground" : "border-border hover:border-gold"}`}>
                {o === "all" ? "All occasions" : o}
              </button>
            ))}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-xs uppercase tracking-wider focus:border-gold outline-none">
              <option value="new">New arrivals</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-12 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
          ) : list.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">No products found.</div>
          ) : (
            list.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
