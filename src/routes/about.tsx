import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heritage from "@/assets/brand/heritage.webp";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Heritage — Kamadhenu Silks" },
      { name: "description", content: "A legacy of Kanchipuram silk woven since 1992, founded by Mr. Ekambaram." }
    ]
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <section className="temple-pattern text-royal-foreground">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Our Heritage</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">A Legacy Woven Since 1992</h1>
          <p className="mx-auto mt-6 max-w-2xl text-royal-foreground/75">
            Established by Mr. Ekambaram as Lakshmi Sarees in 1992, our journey is built on trust, authenticity, and timeless craftsmanship. Reimagined as Kamadhenu Silks in 2018, we continue to celebrate the rich heritage of Kanchipuram silk with every saree we create.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-20 grid gap-10 md:grid-cols-2 items-stretch">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.7 }}
          className="relative min-h-[350px] md:min-h-full rounded-2xl overflow-hidden shadow-luxe"
        >
          <OptimizedImage
            src={heritage}
            alt="Kamadhenu Silks Heritage"
            containerClassName="absolute inset-0 h-full w-full"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.7 }}
          className="flex flex-col justify-center"
        >
          <h2 className="font-display text-3xl text-royal">The Art of Three Threads</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            What began as a small saree store in 1992 has grown into a trusted destination for premium Kanchipuram silk sarees. Through decades of dedication, we have remained committed to offering authentic craftsmanship, superior quality, and personalized customer service.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Today, Kamadhenu Silks continues this legacy by blending traditional artistry with modern elegance, ensuring every customer experiences the timeless beauty and richness of genuine Kanchipuram silk.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Whether it's a wedding, festival, or a cherished family celebration, every saree at Kamadhenu Silks is carefully selected to reflect elegance, tradition, and unmatched craftsmanship. Our mission is to preserve the heritage of Kanchipuram silk while creating memorable experiences for every customer.
          </p>
        </motion.div>
      </section>
      <SiteFooter />
    </div>
  );
}
