import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProducts } from "@/lib/hooks";
import logoUrl from "@/assets/logo.png";

export function SiteHeader() {
  const cart = useCart();
  const { count } = cartTotals(cart);
  const wishlist = useWishlist();
  const wishlistCount = wishlist.length;
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const { user } = useAuth();

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length <= 1) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      String(p.id).toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, products]);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Sarees" },
    { to: "/shop", label: "Collections" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-royal-gradient text-royal-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-center">
          <span className="hidden sm:inline text-gradient-gold font-medium tracking-wider">FREE SHIPPING ABOVE ₹25,000</span>
          <span className="text-gradient-gold font-medium tracking-wider">100% AUTHENTIC SILK MARK</span>
          <span className="hidden md:inline text-gradient-gold font-medium tracking-wider">WORLDWIDE DELIVERY</span>
        </div>
      </div>

      <div className="border-b border-border bg-ivory/95 backdrop-blur relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoUrl} alt="Kamadhenu Silks Logo" fetchPriority="high" decoding="async" className="h-8 md:h-9 w-auto object-contain rounded-full border border-gold/25" />
            <span className="font-display text-xl md:text-2xl tracking-tight text-royal">
              Kamadhenu<span className="text-gradient-gold">·</span>Silks
            </span>
          </Link>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 text-sm font-medium">
            {nav.map(n => (
              <Link key={n.label} to={n.to}
                className="relative text-foreground/80 hover:text-royal transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-gold after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100 will-change-transform">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 justify-end flex-shrink-0">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:text-royal transition-colors" aria-label="Search">
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            {user ? (
              <Link to="/dashboard" className="p-2 hover:text-royal transition-colors flex items-center justify-center" aria-label="Account">
                <div className="h-5 w-5 rounded-full bg-gold text-royal font-bold flex items-center justify-center text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link to="/login" className="p-2 hover:text-royal transition-colors" aria-label="Account"><User className="h-5 w-5" /></Link>
            )}
            <Link to="/dashboard" search={{ tab: "wishlist" }} className="relative p-2 hover:text-royal transition-colors hidden sm:block" aria-label="Wishlist">
              <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "text-red-500 fill-red-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">{wishlistCount}</span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 hover:text-royal transition-colors" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-foreground">{count}</span>
              )}
            </Link>
            <button className="lg:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 border-b border-border bg-ivory p-4 shadow-md z-40">
            <div className="mx-auto max-w-2xl relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or ID..." 
                autoFocus 
                className="w-full rounded-md border border-gold/40 bg-white py-2 pl-10 pr-4 outline-none focus:border-royal focus:ring-1 focus:ring-royal transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) {
                    navigate({ to: '/shop', search: { q: searchQuery } });
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
              />
              
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-xl border border-border overflow-hidden z-50">
                  {suggestions.map(p => (
                    <Link key={p.id} to="/product/$id" params={{ id: String(p.id) }}
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0 border-border">
                      <img src={p.image} className="w-10 h-12 object-cover rounded shadow-sm" alt={p.name} />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm text-royal line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">ID: {p.id}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery.trim().length > 1 && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-xl border border-border p-4 text-center text-sm text-muted-foreground z-50">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}


        {open && (
          <div className="lg:hidden border-t border-border bg-ivory">
            <nav className="mx-auto max-w-7xl flex flex-col px-4 py-3">
              {nav.map(n => (
                <Link key={n.label} to={n.to} onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-foreground/80 hover:text-royal">{n.label}</Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 temple-pattern text-royal-foreground">
      <div className="gold-divider" />
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logoUrl} alt="Kamadhenu Silks Logo" className="h-8 w-auto object-contain rounded-full border border-gold/25 bg-white/10" />
            <h3 className="font-display text-2xl">Kamadhenu Silks</h3>
          </div>
          <p className="mt-3 text-sm text-royal-foreground/70">Heirloom Kanchipuram silks, handwoven by master weavers of Tamil Nadu since 1972.</p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-royal-foreground/80">
            <p>📍 <a href="https://www.google.com/maps/place/Kamadhenu+Silks/@12.8289625,79.7067486,17z/data=!3m1!4b1!4m6!3m5!1s0x3a52c3057ae8d85f:0x645a05aa482389bf!8m2!3d12.8289625!4d79.7067486!16s%2Fg%2F11fm4sb0zj!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">#501 Gandhi road, Kanchipuram</a></p>
            <p>📷 <a href="https://instagram.com/kamadhenusilks_kanchipuram" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">@kamadhenusilks_kanchipuram</a></p>
          </div>
        </div>
        {[
          {
            title: "Shop",
            links: [
              { label: "Wedding", to: "/shop", search: { category: "Wedding" } },
              { label: "Festive", to: "/shop", search: { category: "Festive" } },
              { label: "New Arrivals", to: "/shop", search: { sort: "new" } },
              { label: "Bestsellers", to: "/shop" },
            ]
          },
          {
            title: "Care",
            links: [
              { label: "Contact", to: "/contact" },
            ]
          },
          {
            title: "About",
            links: [
              { label: "Our Heritage", to: "/about" },
            ]
          },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-gradient-gold text-sm font-semibold tracking-widest uppercase">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-royal-foreground/80">
              {col.links.map(link => (
                <li key={link.label}>
                  {link.to === "#" ? (
                    <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition-colors opacity-60">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} search={link.search as any} className="hover:text-gold transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="gold-divider" />
      <div className="mx-auto max-w-7xl px-6 py-5 text-center text-xs text-royal-foreground/60">
        © {new Date().getFullYear()} Kamadhenu Silks. Crafted with reverence in Kanchipuram.
      </div>
    </footer>
  );
}
