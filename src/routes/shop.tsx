import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/lib/hooks";
import { SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { q?: string; category?: string; sort?: string } => {
    return {
      q: (search.q as string) || undefined,
      category: (search.category as string) || undefined,
      sort: (search.sort as string) || undefined,
    }
  },
  head: () => ({ meta: [{ title: "Shop Sarees — Kamadhenu Silks" }, { name: "description", content: "Browse our handwoven Kanchipuram silk saree collection." }] }),
  component: ShopPage,
});

function ShopPage() {
  const { q, category, sort = "new" } = Route.useSearch();
  const navigate = useNavigate();
  const { data: products = [], isLoading, error } = useProducts();

  const handleCategoryClick = (cVal: string) => {
    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        category: cVal === "all" ? undefined : cVal,
      }),
    });
  };

  const handleSortChange = (sortVal: string) => {
    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        sort: sortVal === "new" ? undefined : sortVal,
      }),
    });
  };

  const list = useMemo(() => {
    let l = [...products];
    if (q) {
      const lowerQ = q.toLowerCase();
      l = l.filter(p => p.name.toLowerCase().includes(lowerQ) || p.description.toLowerCase().includes(lowerQ) || (p.category && p.category.toLowerCase().includes(lowerQ)));
    }
    
    if (category && category !== "all") {
      const lowerCat = category.toLowerCase();
      l = l.filter(p => 
        (p.category && p.category.toLowerCase() === lowerCat) || 
        (p.occasion && p.occasion.toLowerCase() === lowerCat)
      );
    }
    
    if (sort === "low") {
      l.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      l.sort((a, b) => b.price - a.price);
    } else if (sort === "new") {
      l.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateA && dateB) return dateB - dateA;
        return String(b.id).localeCompare(String(a.id));
      });
    }
    
    return l;
  }, [sort, category, products, q]);

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
          <div className="flex flex-wrap gap-2 items-center">
            {["all", "Wedding", "Festive", "Traditional"].map(o => {
              const isActive = (category || "all").toLowerCase() === o.toLowerCase();
              return (
                <button key={o} onClick={() => handleCategoryClick(o)}
                  className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${isActive ? "border-royal bg-royal text-royal-foreground" : "border-border hover:border-gold"}`}>
                  {o === "all" ? "All" : o}
                </button>
              );
            })}
            
            {category && !["all", "wedding", "festive", "traditional", "reception"].includes(category.toLowerCase()) && (
              <button onClick={() => handleCategoryClick("all")}
                className="rounded-full border border-gold bg-gold/15 px-4 py-1.5 text-xs uppercase tracking-wider text-royal hover:bg-gold/25 transition-colors flex items-center gap-1.5">
                Category: {category} <span className="font-bold text-xs">×</span>
              </button>
            )}

            <select value={sort} onChange={e => handleSortChange(e.target.value)}
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
