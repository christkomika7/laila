import Footer from "#/components/footer";
import Header from "#/components/header";
import ProductsList from "#/components/list/product-list";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/(public)/store")({
  head: () => ({
    title: "Boutique - Laïla Music",
    meta: [
      {
        name: "description",
        content:
          "Achetez des produits officiels Laïla et des sorties exclusives. Albums, singles, et merchandising premium.",
      },
    ],
  }),
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col">
      <Header />
      <main className="grow pt-20">
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-red-950/30 bg-[#0d0d0d]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-6 backdrop-blur-sm"
            >
              Merchandising Officiel
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
            >
              La Boutique Laila
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-red-100/70 max-w-2xl mx-auto text-balance"
            >
              Découvrez des vêtements exclusifs, des sorties physiques et des
              objets de collection premium de la nouvelle ère de RÉSILIENCE.
            </motion.p>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ProductsList />
        </section>
      </main>
      <Footer />
    </div>
  );
}
