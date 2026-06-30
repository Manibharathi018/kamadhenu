import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Package, MapPin, Heart, Settings, LogOut } from "lucide-react";
import { formatINR } from "@/lib/products";

import { useSignOut, useUpdateUserMetadata, useUserOrders } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { useWishlist, wishlistStore } from "@/lib/wishlist-store";
import { X as XIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Account — Kamadhenu Silks" }] }),
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: (search.tab as string) || "orders",
  }),
  component: Dashboard,
});

const tabs = [
  { id: "orders", label: "My Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

function Dashboard() {
  const search = useSearch({ from: "/dashboard" });
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(
    (search.tab as (typeof tabs)[number]["id"]) || "orders"
  );
  const { mutate: signOut } = useSignOut();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    signOut(undefined, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userPhone = user?.user_metadata?.phone || "";
  const userAddress = user?.user_metadata?.address || "";

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="bg-royal-gradient text-royal-foreground">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Welcome</p>
          <h1 className="mt-1 font-display text-3xl">Namaste, {userName}</h1>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="bg-gold/10 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Profile Information</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Name</p>
              <p className="mt-2 font-semibold text-foreground">{userName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Phone</p>
              <p className="mt-2 font-semibold text-foreground">{userPhone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Address</p>
              <p className="mt-2 font-semibold text-foreground text-sm">{userAddress || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-border bg-card p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${tab === t.id ? "bg-royal text-royal-foreground" : "hover:bg-secondary"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <main className="rounded-lg border border-border bg-card p-6 md:p-8">
          {tab === "orders" && <Orders />}
          {tab === "addresses" && <Addresses userAddress={userAddress} userName={userName} userPhone={userPhone} />}
          {tab === "wishlist" && <Wishlist />}
          {tab === "settings" && <ProfileSettings user={user} userName={userName} userPhone={userPhone} userAddress={userAddress} />}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

function Orders() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useUserOrders(user?.id);

  if (isLoading) {
    return (
      <div>
        <h2 className="font-display text-2xl text-royal">My Orders</h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm">Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="font-display text-2xl text-royal">My Orders</h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
            <span className="text-4xl">🛍️</span>
          </div>
          <p className="font-display text-xl text-royal">No orders yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">Once you place an order, it will appear here.</p>
          <a href="/shop" className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow">
            Shop Now
          </a>
        </div>
      </div>
    );
  }

  const statusStyle = (status: string) => {
    if (status === 'delivered') return 'bg-green-100 text-green-700';
    if (status === 'shipped') return 'bg-blue-100 text-blue-700';
    if (status === 'processing') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gold/15 text-foreground';
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-royal">My Orders</h2>
      <div className="mt-6 space-y-4">
        {orders.map(o => (
          <div key={o.id} className="rounded-lg border border-border p-5">
            <div className="flex flex-wrap justify-between gap-3 border-b border-border pb-3 text-sm">
              <div><span className="text-muted-foreground">Order</span> <span className="font-semibold font-mono text-xs">{o.id.split('-')[0].toUpperCase()}-{o.id.slice(-6).toUpperCase()}</span></div>
              <div className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusStyle(o.status)}`}>{o.status}</span>
            </div>
            <div className="mt-4 space-y-2">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <p className="line-clamp-1 flex-1">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                  <span className="font-medium text-royal">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <span className="font-display text-lg text-royal">{formatINR(o.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Addresses({ userAddress, userName, userPhone }: { userAddress: string; userName: string; userPhone: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-royal">Saved Addresses</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {userAddress && (
          <div className="rounded-lg border border-border p-5">
            <p className="font-semibold">{userName}</p>
            <p className="mt-2 text-sm text-muted-foreground">{userAddress}</p>
            <p className="mt-1 text-sm text-muted-foreground">{userPhone}</p>
          </div>
        )}
        <button className="rounded-lg border-2 border-dashed border-border p-5 text-sm text-muted-foreground hover:border-gold hover:text-royal">+ Add new address</button>
      </div>
    </div>
  );
}

function Wishlist() {
  const wishlist = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div>
        <h2 className="font-display text-2xl text-royal">Wishlist</h2>
        <div className="mt-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="rounded-full bg-muted p-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="font-display text-xl text-foreground">No products added</p>
          <p className="text-sm text-muted-foreground max-w-xs">Browse our collection and tap the heart icon on any saree to save it here.</p>
          <Link
            to="/shop"
            className="mt-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-foreground hover:opacity-90 transition-opacity"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-royal">Wishlist</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((p) => (
          <div key={p.id} className="group relative block">
            <button
              onClick={() => wishlistStore.remove(p.id)}
              className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-muted-foreground hover:text-red-500 transition-colors shadow"
              aria-label="Remove from wishlist"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
            <Link to="/product/$id" params={{ id: p.id }} className="block">
              <div className="aspect-[4/5] overflow-hidden rounded-md">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <p className="mt-2 font-display">{p.name}</p>
              <p className="text-sm text-royal">{formatINR(p.price)}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSettings({ user, userName, userPhone, userAddress }: { user: any; userName: string; userPhone: string; userAddress: string }) {
  const [fullName, setFullName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);
  const [address, setAddress] = useState(userAddress);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { mutate: updateMetadata, isPending } = useUpdateUserMetadata();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !phone || !address) {
      setError("Please fill in all fields");
      return;
    }

    updateMetadata(
      {
        full_name: fullName,
        phone,
        address,
      },
      {
        onSuccess: () => {
          setSuccess("Profile updated successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to update profile");
        },
      }
    );
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-royal">Profile Settings</h2>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form className="mt-6 grid gap-4 max-w-xl" onSubmit={handleSubmit}>
        <Field
          label="Full name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Field
          label="Email"
          type="email"
          value={user?.email || ""}
          disabled
        />
        <Field
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Field
          label="Address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, City, State, Zip"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-fit rounded-full bg-royal px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-royal-foreground hover:bg-maroon transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold" />
    </label>
  );
}
