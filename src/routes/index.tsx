import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, RefreshCcw, Headphones, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import { useProducts } from "@/lib/hooks";
import hero1 from "@/assets/herosectionimg1.jpeg";
import hero2 from "@/assets/herosectionimg2.jpeg";
import hero3 from "@/assets/herosectionimg3.jpeg";
import hero4 from "@/assets/herosectionimg4.jpeg";
import hero5 from "@/assets/herosectionimg5.jpeg";
import heritage from "@/assets/heritage.jpg";
import newArrivalsImg from "@/assets/newarrivals.jpg";
import weddingImg from "@/assets/weddingcollection.jpg";
import traditionalImg from "@/assets/traditionalcollection.jpg";
import festiveImg from "@/assets/festivecollection.jpg";
import bodyButtaImg from "@/assets/Body Butta.png";
import borderButtaImg from "@/assets/Border Butta.png";
import buttaSareesImg from "@/assets/Butta sarees.png";
import korvaiSareesImg from "@/assets/Korvai sarees.png";
import pureBrocadeImg from "@/assets/Pure Brocade.png";
import pureCheckedButtaImg from "@/assets/Pure Checked Butta.png";
import pureJakkadImg from "@/assets/Pure Jakkad.png";

const heroImages = [hero1, hero2, hero3, hero4, hero5];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kamadhenu Silks — Heirloom Kanchipuram Silk Sarees" },
      { name: "description", content: "Discover handwoven Kanchipuram silk sarees in royal purple, maroon and gold. Silk Mark certified, worldwide shipping." },
    ],
  }),
  component: HomePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: dbProducts = [] } = useProducts();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: "Butta Sarees", img: buttaSareesImg },
    { name: "Pure Brocade", img: pureBrocadeImg },
    { name: "Pure Jakkad", img: pureJakkadImg },
    { name: "Korvai Sarees", img: korvaiSareesImg },
    { name: "Pure Checked Butta", img: pureCheckedButtaImg },
    { name: "Border Butta", img: borderButtaImg },
    { name: "Body Butta", img: bodyButtaImg }
  ];
  const collections = [
    { title: "New Arrivals", tag: "Just in", img: newArrivalsImg, search: { sort: "new" } },
    { title: "Wedding", tag: "Bridal heirloom", img: weddingImg, search: { category: "Wedding" } },
    { title: "Traditional", tag: "Timeless weaves", img: traditionalImg, search: { category: "Traditional" } },
    { title: "Festive", tag: "Celebrations", img: festiveImg, search: { category: "Festive" } },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden temple-pattern">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-royal-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gradient-gold">
              <Sparkles className="h-3 w-3 text-gold" /> Since 1972
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] md:text-6xl">
              The Finest <br />
              <span className="text-gradient-gold">Kanchipuram</span> Silks
            </h1>
            <p className="mt-5 max-w-md text-royal-foreground/75 leading-relaxed">
              Heirloom sarees handwoven by master weavers of Tamil Nadu — pure mulberry silk, real gold zari, certified by the Silk Mark of India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-foreground btn-gold-glow btn-gold-glow-hover">
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/about"
                className="inline-flex items-center rounded-full border border-gold/40 px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-gradient-gold hover:bg-gold/10 transition-colors">
                Our Heritage
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-gold/40 via-transparent to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 shadow-luxe h-[520px] md:h-[640px] w-full group">
              <div
                className="flex h-full w-full transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {heroImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Bride in royal purple Kanchipuram silk saree ${idx + 1}`}
                    width={1080}
                    height={1600}
                    className="h-full w-full flex-shrink-0 object-cover"
                  />
                ))}
              </div>

              {/* Dots Navigation */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex
                      ? "w-8 bg-gold shadow-sm"
                      : "w-2 bg-white/60 hover:bg-white"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="gold-divider" />
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-6 py-6 text-sm text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { icon: ShieldCheck, label: "Silk Mark Certified" },
            { icon: Sparkles, label: "Handwoven Authentic" },
            { icon: Truck, label: "Worldwide Shipping" },
            { icon: RefreshCcw, label: "7-Day Easy Returns" },
            { icon: Headphones, label: "Concierge Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex shrink-0 items-center gap-3">
              <Icon className="h-5 w-5 text-gold" />
              <span className="whitespace-nowrap font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <SectionHeading kicker="Shop by Weave" title="Our Categories" />
        <div className="mt-6 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c, i) => (
            <Link key={c.name} to="/shop" search={{ category: c.name }}
              className="snap-start shrink-0 text-center cursor-pointer group block">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}>
                <div className="relative mx-auto h-28 w-28 md:h-32 md:w-32">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/60 to-royal/60 p-[2px] transition-transform group-hover:scale-105">
                    <div className="h-full w-full overflow-hidden rounded-full bg-ivory">
                      <img src={c.img} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 font-display text-sm text-foreground">{c.name}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTION CAROUSEL */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <SectionHeading kicker="Curated For You" title="Our Collections" />
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {collections.map((col, i) => (
            <Link key={col.title} to="/shop" search={col.search}
              className="snap-start shrink-0 group relative aspect-[2/2.6] w-64 overflow-hidden rounded-lg cursor-pointer block">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="h-full w-full relative">
                <img src={col.img} alt={col.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-royal via-royal/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-royal-foreground">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gradient-gold">{col.tag}</p>
                  <h3 className="mt-1 font-display text-lg">{col.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                    Shop now <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <SectionHeading kicker="Just Arrived" title="Heirloom Pieces" />
        <div className="mt-6 grid gap-x-6 gap-y-10 grid-cols-2 lg:grid-cols-4">
          {(dbProducts.length > 0 ? dbProducts.slice(0, 4) : products.slice(0, 4)).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-12 text-center">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-royal hover:text-maroon">
            View All Sarees <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* HERITAGE */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-2xl shadow-luxe">
            <img src={heritage} alt="Handwoven Kanchipuram silk" width={1200} height={900} loading="lazy" className="h-full w-full object-cover aspect-[4/3]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Heritage</p>
            <h2 className="mt-3 font-display text-4xl text-royal">Woven by hands, blessed by tradition.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              For four generations our weavers have practiced the ancient art of Kanchipuram silk — a thousand-year-old craft where each saree is a quiet ceremony of three silk threads twisted with gold zari to last a lifetime.
            </p>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-royal hover:text-maroon">
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl md:text-4xl text-royal">{title}</h2>
      <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}
