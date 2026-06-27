import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heritage from "@/assets/heritage.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Our Heritage — Kamadhenu Silks" }, { name: "description", content: "Four generations of Kanchipuram silk weaving heritage." }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <section className="temple-pattern text-royal-foreground">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Our Heritage</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Four Generations of Silk.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-royal-foreground/75">Born in the temple town of Kanchipuram in 1972, Kamadhenu Silks has remained a family of weavers who treat every saree as scripture.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-20 grid gap-10 md:grid-cols-2">
        <img src={heritage} alt="" className="rounded-2xl shadow-luxe object-cover aspect-[4/3]" loading="lazy" />
        <div>
          <h2 className="font-display text-3xl text-royal">The art of three threads.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">Each Kanchipuram saree is born from three silk threads twisted with gold zari — a technique unchanged since the Chola dynasty. Our 60 weavers spend up to twenty days at a pit-loom for a single piece.</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">We are members of the Silk Mark Organisation of India and every piece carries its hologram, your assurance of pure mulberry silk and real zari.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
