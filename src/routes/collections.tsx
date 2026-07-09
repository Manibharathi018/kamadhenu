import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

// Image Imports matching Homepage
import newArrivalsImg from "@/assets/collections/newarrivals.webp";
import weddingImg from "@/assets/collections/weddingcollection.webp";
import traditionalImg from "@/assets/collections/traditionalcollection.webp";
import festiveImg from "@/assets/collections/festivecollection.webp";

import bodyButtaImg from "@/assets/categories/body-butta.webp";
import borderButtaImg from "@/assets/categories/border-butta.webp";
import buttaSareesImg from "@/assets/categories/butta-sarees.webp";
import korvaiSareesImg from "@/assets/categories/korvai-sarees.webp";
import pureBrocadeImg from "@/assets/categories/pure-brocade.webp";
import pureCheckedButtaImg from "@/assets/categories/pure-checked-butta.webp";
import pureJakkadImg from "@/assets/categories/pure-jakkad.webp";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Our Collections & Weaves — Kamadhenu Silks" },
      { name: "description", content: "Explore our handwoven Kanchipuram silk saree collections and categories." },
    ],
  }),
  component: CollectionsPage,
});

const collections = [
  { title: "New Arrivals", tag: "Just in", img: newArrivalsImg, search: { sort: "new" } },
  { title: "Wedding Collection", tag: "Bridal heirloom", img: weddingImg, search: { category: "Wedding" } },
  { title: "Traditional Weaves", tag: "Timeless weaves", img: traditionalImg, search: { category: "Traditional" } },
  { title: "Festive Collection", tag: "Celebrations", img: festiveImg, search: { category: "Festive" } },
];

const categories = [
  { name: "Butta Sarees", img: buttaSareesImg },
  { name: "Pure Brocade", img: pureBrocadeImg },
  { name: "Pure Jakkad", img: pureJakkadImg },
  { name: "Korvai Sarees", img: korvaiSareesImg },
  { name: "Pure Checked Butta", img: pureCheckedButtaImg },
  { name: "Border Butta", img: borderButtaImg },
  { name: "Body Butta", img: bodyButtaImg }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

function CollectionsPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="temple-pattern text-royal-foreground">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gradient-gold">
              <Sparkles className="h-3 w-3 text-gold" /> Masterful Artistry
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl">Our Collections</h1>
            <p className="mx-auto mt-6 max-w-2xl text-royal-foreground/75 leading-relaxed">
              Explore our curation of genuine Kanchipuram mulberry silk sarees, hand-woven with real gold zari and certified by the Silk Mark of India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-6 py-16 space-y-24">

        {/* 1. Collections Section */}
        <section>
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Curated Themes</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl text-royal">Featured Collections</h2>
            <div className="mt-4 h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 grid-cols-2 lg:grid-cols-4"
          >
            {collections.map((col) => (
              <Link
                key={col.title}
                to="/shop"
                search={col.search}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl border border-gold/15 shadow-luxe bg-royal/5 cursor-pointer"
              >
                <motion.div variants={itemVariants} className="h-full w-full relative">
                  <OptimizedImage
                    src={col.img}
                    alt={col.title}
                    containerClassName="h-full w-full absolute inset-0"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal via-royal/40 to-transparent transition-opacity duration-350 group-hover:opacity-90" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-5 text-royal-foreground flex flex-col justify-end h-1/2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gold-soft font-semibold">{col.tag}</p>
                    <h3 className="mt-1 font-display text-xl md:text-2xl text-ivory group-hover:text-gold transition-colors duration-300">
                      {col.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold font-medium transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350">
                      Shop Now <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </section>

        {/* Divider */}
        <div className="gold-divider" />

        {/* 2. Categories Weaves Section */}
        <section>
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Traditional Weaves</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl text-royal">Shop by Category</h2>
            <div className="mt-4 h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {categories.map((c) => (
              <Link
                key={c.name}
                to="/shop"
                search={{ category: c.name }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl border border-gold/15 shadow-luxe bg-royal/5 cursor-pointer"
              >
                <motion.div variants={itemVariants} className="h-full w-full relative">
                  <OptimizedImage
                    src={c.img}
                    alt={c.name}
                    containerClassName="h-full w-full absolute inset-0"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white flex flex-col justify-end h-1/2">
                    <h3 className="font-display text-lg md:text-xl text-ivory group-hover:text-gold transition-colors duration-300">
                      {c.name}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold font-medium transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350">
                      Explore Weave <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </section>

      </div>

      <SiteFooter />
    </div>
  );
}
