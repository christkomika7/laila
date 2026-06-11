import BookGallery from "#/components/card/book-gallery";
import Footer from "#/components/footer";
import Header from "#/components/header";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/(public)/gallery")({
  head: () => ({
    title: "Galerie - Laila",
    description:
      "Explorez le voyage visuel et les moments exclusifs en coulisses.",
    meta: [
      { property: "og:title", content: "Galerie - Laila" },
      {
        property: "og:description",
        content:
          "Explorez le voyage visuel et les moments exclusifs en coulisses.",
      },
      {
        property: "og:image",
        content:
          "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/3000-J7o3B.png",
      },
      { property: "og:url", content: "https://laila-music.com/gallery" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="min-h-screen bg-[hsl(var(--book-bg))] text-foreground flex flex-col">
        <Header />

        <main className="grow">
          <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src="https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/3000-J7o3B.png"
                alt="Gallery Hero"
                className="w-full h-full object-cover object-center opacity-40"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-[hsl(var(--book-bg))] mix-blend-multiply" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full border border-[hsl(var(--book-gold))]/30 bg-[hsl(var(--book-gold))]/10 text-[hsl(var(--book-gold))] font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-6 backdrop-blur-sm">
                  Les Archives
                </span>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display text-white drop-shadow-xl">
                  Voyage Visuel
                </h1>
                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                  Entrez dans le récit visuel. Une collection soignée de
                  moments, d'art et de l'essence derrière la musique.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-12 md:py-24 relative z-20 -mt-12 px-4">
            <BookGallery />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
