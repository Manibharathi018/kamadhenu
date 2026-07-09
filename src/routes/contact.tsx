import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Phone, Mail, MapPin } from "lucide-react";

function Instagram({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Kamadhenu Silks" }] }),
  component: ContactPage,
});

import { useState } from "react";

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const whatsappNumber = "918144698366";
    const text = `Name: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Get in touch</p>
        <h1 className="mt-2 font-display text-4xl text-royal">We are here for you.</h1>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_320px]">
          <form className="space-y-4" onSubmit={handleWhatsAppSubmit}>
            <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Field label="Phone No" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Message</span>
              <textarea 
                rows={6} 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold" 
              />
            </label>
            <button type="submit" className="rounded-full bg-gold px-7 py-3 text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover">Send Message</button>
          </form>
          <aside className="space-y-5 rounded-lg border border-border bg-card p-6">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Boutique</p>
                <a 
                  href="https://www.google.com/maps/place/Kamadhenu+Silks/@12.8289625,79.7067486,17z/data=!3m1!4b1!4m6!3m5!1s0x3a52c3057ae8d85f:0x645a05aa482389bf!8m2!3d12.8289625!4d79.7067486!16s%2Fg%2F11fm4sb0zj!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-medium hover:text-royal transition-colors block"
                >
                  Kamadhenu Silks, #501 Gandhi road, Kanchipuram, Tamil Nadu 631501
                  <span className="block text-xs text-gold mt-1 hover:underline">View on Google Maps →</span>
                </a>
              </div>
            </div>
            <Item icon={Phone} title="Call / WhatsApp" body="+91 81446 98366" />
            <Item icon={Mail} title="Email" body="care@kamadhenusilks.com" />
            <div className="flex gap-3">
              <Instagram className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Instagram</p>
                <a 
                  href="https://instagram.com/kamadhenusilks_kanchipuram" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-medium hover:text-royal transition-colors block"
                >
                  @kamadhenusilks_kanchipuram
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Item({ icon: Icon, title, body }: { icon: typeof Phone; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="text-sm">{body}</p>
      </div>
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
