import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useCart, cartStore, cartTotals } from "@/lib/cart-store";
import { formatINR } from "@/lib/products";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Kamadhenu Silks" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { subtotal, shipping, total } = cartTotals(cart);

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl text-royal">Your Cart</h1>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />

        {cart.length === 0 ? (
          <div className="mt-20 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
            <ul className="space-y-4 overflow-hidden">
              <AnimatePresence initial={false}>
                {cart.map(({ product, qty }) => (
                  <motion.li
                    key={product.id}
                    layout
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, padding: 0, margin: 0, border: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-[100px_1fr_auto] gap-5 rounded-lg border border-border bg-card p-4 md:grid-cols-[120px_1fr_auto] overflow-hidden"
                  >
                    <Link to="/product/$id" params={{ id: product.id }}>
                      <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-md object-cover" />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.category}</p>
                      <Link to="/product/$id" params={{ id: product.id }} className="block font-display text-lg leading-tight hover:text-royal">{product.name}</Link>
                      <p className="mt-1 font-sans font-semibold tracking-tight text-sm text-royal">{formatINR(product.price)}</p>
                      <div className="mt-3 inline-flex items-center rounded-full border border-border">
                        <button onClick={() => cartStore.setQty(product.id, qty - 1)} className="p-2 hover:text-royal"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm font-medium">{qty}</span>
                        <button onClick={() => cartStore.setQty(product.id, qty + 1)} className="p-2 hover:text-royal"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => { cartStore.remove(product.id); toast.info("Removed from cart", { description: product.name }); }} className="text-muted-foreground hover:text-maroon" aria-label="Remove"><X className="h-5 w-5" /></button>
                      <p className="font-sans font-semibold tracking-tight">{formatINR(product.price * qty)}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-32">
              <h2 className="font-display text-xl">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
                <div className="my-3 h-px bg-border" />
                <div className="flex justify-between font-sans font-semibold tracking-tight text-lg">
                  <span>Total</span><span className="text-royal">{formatINR(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="mt-6 block rounded-full bg-gold py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover">
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="mt-3 block text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-royal">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="font-sans font-semibold tracking-tight text-foreground">{value}</span></div>;
}
