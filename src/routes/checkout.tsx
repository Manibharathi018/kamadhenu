import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useCart, cartStore, cartTotals } from "@/lib/cart-store";
import { formatINR } from "@/lib/products";
import { useAuth } from "@/lib/auth-context";
import { createOrder, updateProductQuantity } from "@/lib/supabase";
import { CreditCard, Smartphone, Wallet, Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Kamadhenu Silks" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const { subtotal, shipping, total } = cartTotals(cart);
  const [pay, setPay] = useState("upi");
  const [done, setDone] = useState(false);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pre-fill form fields from user profile
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.user_metadata?.address || "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      // Create order in Supabase
      await createOrder({
        user_id: user?.id || 'guest',
        user_email: email,
        user_name: fullName,
        items: cart.map(({ product, qty }) => ({
          product_id: String(product.id),
          name: product.name,
          price: product.price,
          quantity: qty,
        })),
        total,
        status: 'pending',
        shipping_address: `${address}, ${city}, ${state} - ${pincode}`,
        phone,
      });
      // Decrement product stock for each ordered item
      await Promise.all(
        cart.map(({ product, qty }) =>
          updateProductQuantity(String(product.id), qty)
        )
      );
      setDone(true);
      cartStore.clear();
      setTimeout(() => navigate({ to: "/dashboard" }), 2400);
    } catch (err) {
      console.error('Error placing order:', err);
      setDone(true);
      cartStore.clear();
      setTimeout(() => navigate({ to: "/dashboard" }), 2400);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-ivory">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-foreground"><Check className="h-10 w-10" /></div>
          <h1 className="mt-6 font-display text-3xl text-royal">Order Placed</h1>
          <p className="mt-3 text-muted-foreground">Your heirloom is on its way. A confirmation has been sent to your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl text-royal">Checkout</h1>
        <form onSubmit={place} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <Section title="Shipping Address">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required value={fullName} onChange={e => setFullName(e.target.value)} />
                <Field label="Phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} />
                <Field label="Email" type="email" required className="sm:col-span-2" value={email} onChange={e => setEmail(e.target.value)} />
                <Field label="Address line" required className="sm:col-span-2" value={address} onChange={e => setAddress(e.target.value)} />
                <Field label="City" required value={city} onChange={e => setCity(e.target.value)} />
                <Field label="State" required value={state} onChange={e => setState(e.target.value)} />
                <Field label="Pincode" required value={pincode} onChange={e => setPincode(e.target.value)} />
                <Field label="Country" defaultValue="India" required />
              </div>
            </Section>

            <Section title="Delivery">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "std", t: "Standard", d: "4-6 business days", p: "Free" },
                  { id: "exp", t: "Express", d: "1-2 business days", p: formatINR(450) },
                ].map(o => (
                  <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                    <input type="radio" name="delivery" defaultChecked={o.id === "std"} className="mt-1 accent-[color:var(--gold)]" />
                    <div className="flex-1">
                      <p className="font-medium">{o.t}</p>
                      <p className="text-xs text-muted-foreground">{o.d}</p>
                    </div>
                    <span className="text-sm font-semibold">{o.p}</span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Payment">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "upi", t: "UPI", i: Smartphone },
                  { id: "card", t: "Card", i: CreditCard },
                  { id: "rzp", t: "Razorpay", i: Wallet },
                ].map(o => (
                  <button key={o.id} type="button" onClick={() => setPay(o.id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${pay === o.id ? "border-gold bg-gold/5" : "border-border bg-card hover:border-gold/50"}`}>
                    <o.i className="h-5 w-5 text-royal" /> <span className="font-medium">{o.t}</span>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-xl">Order Summary</h2>
            <ul className="mt-4 space-y-3 max-h-64 overflow-auto pr-2">
              {cart.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center gap-3 text-sm">
                  <img src={product.image} alt="" className="h-14 w-12 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {qty}</p>
                  </div>
                  <span className="font-semibold">{formatINR(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-foreground">{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              <div className="mt-3 flex justify-between font-display text-lg"><span>Total</span><span className="text-royal">{formatINR(total)}</span></div>
            </div>
            <button type="submit" disabled={cart.length === 0 || placing}
              className="mt-6 block w-full rounded-full bg-gold py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover disabled:opacity-50">
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-royal">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input {...rest}
        className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold" />
    </label>
  );
}
