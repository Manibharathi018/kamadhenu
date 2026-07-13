import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useCart, cartStore, cartTotals } from "@/lib/cart-store";
import { formatINR } from "@/lib/products";
import { useAuth } from "@/lib/auth-context";
import { createOrder, updateProductQuantity } from "@/lib/supabase";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay-server";
import { CreditCard, Smartphone, Wallet, Check, AlertCircle, ShieldCheck } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const Route = createLazyFileRoute("/checkout")({
  component: CheckoutPage,
});

// Dynamically loads the Razorpay Checkout script (Step 2 - Frontend)
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(false); return; }
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function CheckoutPage() {
  const cart = useCart();
  const { subtotal, shipping, total } = cartTotals(cart);
  const [pay, setPay] = useState("upi");
  const [done, setDone] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placingLabel, setPlacingLabel] = useState("Placing Order...");
  const [orderError, setOrderError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.user_metadata?.address || "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Shared: save to Supabase + decrement stock + success
  const finalizeOrder = async (opts: {
    status: "pending" | "processing";
    paymentRef?: string;
    cartSnapshot: typeof cart;
    skipNavigation?: boolean;
  }) => {
    const shippingAddress = `${address}, ${city}, ${state} - ${pincode}`;
    await createOrder({
      user_id: user?.id || "guest",
      user_email: email,
      user_name: fullName,
      items: opts.cartSnapshot.map(({ product, qty }) => ({
        product_id: String(product.id),
        name: product.name,
        price: product.price,
        quantity: qty,
      })),
      total,
      status: opts.status,
      shipping_address: opts.paymentRef
        ? `${shippingAddress} | Razorpay: ${opts.paymentRef}`
        : shippingAddress,
      phone,
    });

    await Promise.all(
      opts.cartSnapshot.map(({ product, qty }) =>
        updateProductQuantity(String(product.id), qty)
      )
    );

    cartStore.clear();
    setDone(true);
    
    if (!opts.skipNavigation) {
      setTimeout(() => navigate({ to: "/dashboard" }), 2400);
    }
  };

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setPlacing(true);

    const cartSnapshot = [...cart];

    try {
      if (pay === "rzp") {
        // Step 1: Create Razorpay order on the server (KEY_SECRET stays server-side)
        setPlacingLabel("Creating order...");
        const rzpOrder = await createRazorpayOrder({
          data: { amount: total, receipt: `rcpt_${Date.now()}` },
        });

        // Step 2: Load Razorpay script + open payment modal
        setPlacingLabel("Opening payment...");
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
        }

        await new Promise<void>((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            order_id: rzpOrder.order_id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "Kamadhenu Silks",
            description: "Heirloom Kanchipuram Silk Sarees",
            prefill: { name: fullName, email, contact: phone },
            notes: { address: `${address}, ${city}, ${state} - ${pincode}` },
            theme: { color: "#B39255" },

            // Step 2 success callback - receives all 3 IDs
            handler: async function (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) {
              try {
                // Step 3: Verify signature on the server before saving order
                setPlacingLabel("Verifying payment...");
                await verifyRazorpayPayment({ data: response });

                setPlacingLabel("Saving order...");
                await finalizeOrder({
                  status: "processing",
                  paymentRef: response.razorpay_payment_id,
                  cartSnapshot,
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            modal: {
              ondismiss: () =>
                reject(new Error("Payment was cancelled. Your order has not been placed.")),
            },
          });

          rzp.on("payment.failed", (resp: any) =>
            reject(new Error(`Payment failed: ${resp.error?.description || "Unknown error"}`))
          );

          rzp.open();
        });
      } else {
        // Non-Razorpay flow: WhatsApp Redirect + Save Order
        setPlacingLabel("Redirecting to WhatsApp...");
        
        const shippingAddressStr = `${fullName}\n${phone}\n${email}\n${address}, ${city}, ${state} - ${pincode}`;
        
        const orderSummaryStr = cartSnapshot.map(item => 
          `- ${item.product.name} (Qty: ${item.qty}) - ${formatINR(item.product.price * item.qty)}\n  Image: ${item.product.image}`
        ).join("\n\n");
        
        const whatsappText = `*New Order Placed*\n\n*Order Summary:*\n${orderSummaryStr}\n\n*Subtotal:* ${formatINR(subtotal)}\n*Shipping:* ${shipping === 0 ? "Free" : formatINR(shipping)}\n*Total:* ${formatINR(total)}\n\n*Shipping Address:*\n${shippingAddressStr}`;
        
        const encodedText = encodeURIComponent(whatsappText);
        const whatsappUrl = `https://wa.me/917810065250?text=${encodedText}`;
        
        await finalizeOrder({ status: "pending", cartSnapshot, skipNavigation: true });
        
        // Use location.href instead of window.open to prevent popup blocker issues
        window.location.href = whatsappUrl;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setOrderError(
        err?.message ||
          (typeof err === "string" ? err : "Failed to place order. Please try again.")
      );
      setPlacing(false);
      setPlacingLabel("Placing Order...");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-ivory">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-foreground">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-display text-3xl text-royal">Order Placed!</h1>
          <p className="mt-3 text-muted-foreground">
            Your heirloom is on its way. Redirecting to your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl text-royal">Checkout</h1>

        {orderError && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Order failed</p>
              <p className="mt-0.5 text-xs text-red-600">{orderError}</p>
            </div>
          </div>
        )}

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
                    <span className="font-sans font-semibold tracking-tight text-sm">{o.p}</span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Payment">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "upi", t: "WhatsApp / UPI", i: Smartphone, disabled: false },
                  { id: "card", t: "Card", i: CreditCard, disabled: true },
                  { id: "rzp", t: "Razorpay", i: Wallet, disabled: true },
                ].map(o => (
                  <button key={o.id} type="button" id={`pay-${o.id}`} onClick={() => !o.disabled && setPay(o.id)}
                    disabled={o.disabled}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${pay === o.id ? "border-gold bg-gold/5" : "border-border bg-card hover:border-gold/50"} ${o.disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <div className="flex items-center gap-3">
                      <o.i className="h-5 w-5 text-royal" />
                      <span className="font-medium">{o.t}</span>
                    </div>
                    {o.disabled && <span className="text-[10px] text-muted-foreground">Currently unavailable</span>}
                  </button>
                ))}
              </div>
              {pay === "rzp" && (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>Secured & verified by Razorpay. A payment modal will open after clicking Place Order.</span>
                </div>
              )}
            </Section>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-xl">Order Summary</h2>
            <ul className="mt-4 space-y-3 max-h-64 overflow-auto pr-2">
              {cart.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center gap-3 text-sm">
                  <OptimizedImage
                    src={product.image}
                    alt=""
                    loading="lazy"
                    width={48}
                    height={56}
                    containerClassName="h-14 w-12 rounded flex-shrink-0"
                    className="h-full w-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {qty}</p>
                  </div>
                  <span className="font-sans font-semibold tracking-tight">{formatINR(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-sans font-semibold tracking-tight text-foreground">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-sans font-semibold tracking-tight text-foreground">{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <div className="mt-3 flex justify-between font-sans font-semibold tracking-tight text-lg">
                <span>Total</span>
                <span className="text-royal">{formatINR(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              id="place-order-btn"
              disabled={cart.length === 0 || placing}
              className="mt-6 block w-full rounded-full bg-gold py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover disabled:opacity-50"
            >
              {placing ? placingLabel : "Place Order"}
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

function Field({
  label,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
    </label>
  );
}
