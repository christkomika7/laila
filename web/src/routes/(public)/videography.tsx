import Footer from "#/components/footer";
import Header from "#/components/header";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PlayCircle, Video } from "lucide-react";

export const Route = createFileRoute("/(public)/videography")({
  head: () => ({
    title: "Videographie - Laila",
    meta: [
      {
        name: "description",
        content:
          "Explorez la videographie complète, les clips musicaux de Laila.",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display tracking-tight text-white drop-shadow-md">
              Vidéographie
            </h1>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-red-100/60 max-w-2xl mx-auto text-balance">
              Explorez la collection complète des clips musicaux officiels.
            </p>
          </motion.div>

          {/* Clips Musicaux */}
          <section>
            <div className="flex items-center gap-3 mb-10 border-b border-red-950/30 pb-4">
              <Video className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-display font-bold text-white">
                Clips Musicaux
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {LAILA_VIDEOS.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                >
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block relative rounded-lg overflow-hidden bg-[#111] border border-red-950/30 transition-all duration-500 hover:border-red-500/50 hover:shadow-[0_10px_40px_rgba(220,38,38,0.15)] hover:-translate-y-1"
                  >
                    <div className="relative aspect-video overflow-hidden bg-[#0a0a0a]">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-60"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-red-600 text-white rounded-full p-4 transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-75 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                          <PlayCircle className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white font-display leading-tight group-hover:text-red-400 transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const LAILA_VIDEOS = [
  {
    title: "X One Humanity",
    id: "tF6dHjDYvZo",
    url: "https://youtu.be/tF6dHjDYvZo",
  },
  {
    title: "À tous les êtres chers",
    id: "_CXezIZYXoE",
    url: "https://youtu.be/_CXezIZYXoE",
  },
  { title: "La Folle", id: "HiQKI-3PbLU", url: "https://youtu.be/HiQKI-3PbLU" },
  {
    title: "Laïla ft Zao – La poupée de Mossaka",
    id: "MKP1UnsM6fM",
    url: "https://youtu.be/MKP1UnsM6fM",
  },
  {
    title: "Laïla feat Chris Mundele",
    id: "H62ivKqpdt0",
    url: "https://youtu.be/H62ivKqpdt0",
  },
  {
    title: "Laïla – Papillon",
    id: "ZejGbgaIzo0",
    url: "https://youtu.be/ZejGbgaIzo0",
  },
  {
    title: "Laïla ft Diesel Woman",
    id: "ytN__ow_lE8",
    url: "https://youtu.be/ytN__ow_lE8",
  },
  {
    title: "Laïla – Vibe",
    id: "MFbTz8FqGG8",
    url: "https://youtu.be/MFbTz8FqGG8",
  },
  {
    title: "Laïla ft Moza",
    id: "GOFMeYdMtt8",
    url: "https://youtu.be/GOFMeYdMtt8",
  },
  {
    title: "Laïla ft Makhalba MBM",
    id: "CXvorpEpjcQ",
    url: "https://youtu.be/CXvorpEpjcQ",
  },
  {
    title: "Laïla – Round 1",
    id: "cHDBKw8vUrQ",
    url: "https://youtu.be/cHDBKw8vUrQ",
  },
  {
    title: "Laïla – Round 2",
    id: "5m7mOdqb5WY",
    url: "https://youtu.be/5m7mOdqb5WY",
  },
  {
    title: "Laïla – Eyinda",
    id: "iNwSJifIHBs",
    url: "https://youtu.be/iNwSJifIHBs",
  },
  {
    title: "Laïla – En 2/2",
    id: "kG2WLujvYyc",
    url: "https://youtu.be/kG2WLujvYyc",
  },
  {
    title: "Laïla – Wapi",
    id: "rQYaEKm09jw",
    url: "https://youtu.be/rQYaEKm09jw",
  },
  {
    title: "Laïla ft Tidiane Faux Masta",
    id: "fcAlB576W4Q",
    url: "https://youtu.be/fcAlB576W4Q",
  },
  {
    title: "Laïla – CPNC",
    id: "DYjuRyHy-lo",
    url: "https://youtu.be/DYjuRyHy-lo",
  },
  {
    title: "Laïla – Assiette Romaine",
    id: "ksBAiuiXcCM",
    url: "https://youtu.be/ksBAiuiXcCM",
  },
  {
    title: "Laïla – Entre Nous",
    id: "ZO8mXIQ8Ixg",
    url: "https://youtu.be/ZO8mXIQ8Ixg",
  },
  {
    title: "Laïla – Lire l'heure",
    id: "FvhennlCrs4",
    url: "https://youtu.be/FvhennlCrs4",
  },
  {
    title: "Laïla ft Suintement – 2 x 2",
    id: "b9hG1gbKsAw",
    url: "https://youtu.be/b9hG1gbKsAw",
  },
  {
    title: "Laïla ft Rahlph – Avec le peu qu'on a",
    id: "10WIHfMLbfs",
    url: "https://youtu.be/10WIHfMLbfs",
  },
];
