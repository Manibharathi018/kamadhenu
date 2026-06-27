import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { formatINR } from "@/lib/products";
import { fetchProduct, fetchProducts } from "@/lib/supabase";
import { cartStore } from "@/lib/cart-store";
import { Minus, Plus, ShieldCheck, Truck, RefreshCcw, Star } from "lucide-react";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.id);
    if (!product) throw notFound();
    
    // Fetch related products
    const allProducts = await fetchProducts();
    const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);
    
    return { product, related, allProducts };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.product ? [
      { title: `${loaderData.product.name} — Kamadhenu Silks` },
      { name: "description", content: loaderData.product.description },
      { property: "og:title", content: loaderData.product.name },
      { property: "og:image", content: loaderData.product.image },
    ] : [],
  }),
  notFoundComponent: () => <div className="p-20 text-center">Saree not found.</div>,
  errorComponent: ({ error }) => <div className="p-20 text-center">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product, related, allProducts } = Route.useLoaderData();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-royal">Home</Link> / <Link to="/shop" className="hover:text-royal">Sarees</Link> / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-card shadow-luxe">
              <img src={activeImage} alt={product.name} className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
            
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((src, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImage(src)}
                    className={`aspect-square overflow-hidden rounded-md border cursor-pointer hover:border-gold transition-colors ${activeImage === src ? 'border-gold ring-2 ring-gold/20' : 'border-border'}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                <div className="aspect-square overflow-hidden rounded-md border border-gold ring-2 ring-gold/20 cursor-pointer">
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">{product.category}</p>
              <span className="text-xs font-mono text-muted-foreground bg-white/50 px-2 py-0.5 rounded border border-border/50">ID: {product.id}</span>
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl text-royal">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="flex text-gold">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <span className="text-muted-foreground">120 reviews</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl text-royal">{formatINR(product.price)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatINR(product.mrp)}</span>
              <span className="rounded-full bg-maroon/10 px-2 py-0.5 text-xs font-semibold text-maroon">Save {Math.round((1 - product.price / product.mrp) * 100)}%</span>
            </div>

            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-y-3 border-y border-border py-5 text-sm">
              <dt className="text-muted-foreground">Product ID</dt><dd className="font-medium font-mono">{product.id}</dd>
              <dt className="text-muted-foreground">Fabric</dt><dd className="font-medium">{product.fabric}</dd>
              <dt className="text-muted-foreground">Occasion</dt><dd className="font-medium">{product.occasion}</dd>
              <dt className="text-muted-foreground">Colour</dt><dd className="font-medium">{product.color}</dd>
              <dt className="text-muted-foreground">Weave</dt><dd className="font-medium">Handloom</dd>
            </dl>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-border">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 hover:text-royal" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-3 hover:text-royal" aria-label="Increase"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={() => cartStore.add(product, qty)}
                className="flex-1 rounded-full border-2 border-royal py-3.5 text-sm font-semibold uppercase tracking-widest text-royal hover:bg-royal hover:text-royal-foreground transition-colors">
                Add to Cart
              </button>
              <button onClick={() => { cartStore.add(product, qty); navigate({ to: "/checkout" }); }}
                className="flex-1 rounded-full bg-gold py-3.5 text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover">
                Buy Now
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
              {[{ i: ShieldCheck, t: "Silk Mark" }, { i: Truck, t: "Free Shipping" }, { i: RefreshCcw, t: "7-Day Returns" }].map(({ i: Icon, t }) => (
                <div key={t} className="flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center">
                  <Icon className="h-5 w-5 text-gold" /> <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="font-display text-2xl text-royal">You may also love</h2>
          <div className="mt-8 grid gap-x-6 gap-y-10 grid-cols-2 lg:grid-cols-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
