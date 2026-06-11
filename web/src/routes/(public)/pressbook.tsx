import { FadeIn } from "#/components/animation/fade-in";
import Footer from "#/components/footer";
import Header from "#/components/header";
import PremiumButton from "#/components/ui/premiem.button";
import { PressImage } from "#/components/ui/press-image";
import { Skeleton } from "#/components/ui/skeleton";
import { apiServerClient } from "#/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Globe,
  ImageIcon,
  LinkIcon,
  Music,
  PlayCircle,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Groove from "#/assets/img_6446_iwg86hvwr2.webp";
import Identity from "#/assets/IMG_7889.png";
import Song from "#/assets/song.jpeg";
import Image from "#/assets/image.jpeg";
import Voice from "#/assets/voice.jpeg";
import Univers from "#/assets/univers.jpeg";
import Discography from "#/assets/discography.jpeg";
import Performance1 from "#/assets/performance1.jpeg";
import Performance2 from "#/assets/performance2.jpeg";
import Strategy from "#/assets/strategie.jpeg";

export const Route = createFileRoute("/(public)/pressbook")({
  head: () => ({
    title: "Pressbook - Laila and the Groove",
    meta: [
      {
        name: "description",
        content:
          "Pressbook officiel de Laila and the Groove. Identité, biographie, discographie, et opportunités.",
      },
    ],
  }),
  component: RouteComponent,
});

type GalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  mediaType: string;
};

function RouteComponent() {
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState<boolean>(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setIsGalleryLoading(true);
    setGalleryError(null);
    try {
      const res = await apiServerClient.fetch("/gallery");
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      const images = (Array.isArray(data) ? data : []).filter(
        (item: GalleryItem) => item.mediaType === "IMAGE",
      );
      setGalleryImages(images);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setGalleryError(
        "Impossible de charger les images de la galerie officielle pour le moment.",
      );
    } finally {
      setIsGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleDownloadPressKit = () => {
    window.open("#", "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Header />

      <main className="pt-24 pb-32">
        {/* HERO SECTION */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden border-b border-border pt-12">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background z-10" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
          </div>

          <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="mb-12"
            >
              <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6">
                Pressbook Officiel
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-display tracking-tight mb-8">
                Laila
                <br />
                <span className="text-3xl md:text-5xl lg:text-6xl italic text-muted-foreground font-light">
                  & the Groove
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                "Le Groove n'est pas juste de la musique. C'est un mouvement."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-full max-w-5xl"
            >
              <PressImage
                src={Groove}
                alt="Laila and the Groove Performance Hero"
                className="aspect-21/9 w-full shadow-2xl ring-1 ring-white/10"
                caption="Laila and the Groove - La Nouvelle Ère"
              />
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 space-y-32">
          {/* 1. IDENTITÉ ARTISTIQUE */}
          <FadeIn>
            <h2 className="pressbook-section-title">01. Identité Artistique</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="text-3xl md:text-4xl font-display leading-tight text-balance">
                  Une voix qui traverse les frontières, un style ancré dans
                  l'authenticité.
                </div>
                <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                  <p>
                    <strong className="text-foreground">Artiste :</strong> Laila
                    and the Groove
                  </p>
                  <p>
                    <strong className="text-foreground">Origine :</strong>{" "}
                    Brazzaville, Congo / Scène Internationale
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Positionnement :
                    </strong>{" "}
                    Artiste Afro-fusion, mêlant l'âme des rythmes traditionnels
                    africains aux sonorités urbaines et globales (Afrobeat, R&B,
                    Soul).
                  </p>
                  <p>
                    <strong className="text-foreground">Signature :</strong> Une
                    voix suave, des textes poignants, et une énergie scénique
                    captivante.
                  </p>
                  <p>
                    <strong className="text-foreground">Vision :</strong>{" "}
                    Exporter la musique congolaise et africaine sur la scène
                    mondiale tout en restant profondément connectée à ses
                    racines.
                  </p>
                </div>
              </div>
              <PressImage
                src={Identity}
                alt="Laila Portrait Identité"
                className="aspect-4/5 w-full"
                caption="Identité visuelle forte et authentique"
              />
            </div>
          </FadeIn>

          {/* 2. DIRECTION ARTISTIQUE & UNIVERS */}
          <FadeIn>
            <h2 className="pressbook-section-title">
              02. Direction Artistique & Univers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
              <div className="flex flex-col gap-6">
                <PressImage
                  src={Song}
                  alt="Laila Direction Artistique 1"
                  className="aspect-square"
                  caption=""
                />
                <div>
                  <div className="w-10 h-10 mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Music className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3">
                    Le Son
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Un pont entre l'Afrique et le monde. Les productions de
                    Laila allient des percussions organiques, des mélodies de
                    guitare entraînantes, et des basses profondes qui invitent à
                    la danse et à la réflexion.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 md:mt-16">
                <PressImage
                  src={Image}
                  alt="Laila Direction Artistique 2"
                  className="aspect-square"
                  caption=""
                />
                <div>
                  <div className="w-10 h-10 mb-4 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3">
                    L'Image
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Une esthétique soignée, moderne, mais résolument africaine.
                    Des visuels vibrants, des tenues qui célèbrent le patrimoine
                    culturel tout en adoptant des codes urbains contemporains.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 3. BIOGRAPHIE COMPLÈTE */}
          <FadeIn>
            <h2 className="pressbook-section-title">03. Biographie Complète</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8 items-start">
              <div className="lg:col-span-7 prose prose-lg prose-invert max-w-none text-muted-foreground">
                <p className="first-letter:text-7xl first-letter:font-display first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                  Originaire de Brazzaville, Laila a toujours été bercée par la
                  richesse musicale de son environnement. Très tôt, elle
                  développe une passion pour le chant et l'écriture, puisant son
                  inspiration dans les réalités de son quotidien et les
                  histoires de ceux qui l'entourent.
                </p>
                <p>
                  Son développement artistique s'est forgé au fil d'expériences
                  scéniques locales avant de s'étendre à des collaborations
                  audacieuses. Elle n'est pas seulement une chanteuse, elle est
                  une conteuse. Son parcours est marqué par une résilience
                  exceptionnelle, transformant les obstacles en carburant pour
                  son art.
                </p>
                <p>
                  Aujourd'hui, Laila and the Groove s'impose comme une figure
                  incontournable de la nouvelle génération musicale, portant
                  fièrement les couleurs de son pays tout en s'ouvrant à une
                  audience globale.
                </p>
              </div>
              <div className="lg:col-span-5">
                <PressImage
                  src={Voice}
                  alt="Laila Portrait Biographie"
                  className="aspect-3/4"
                  caption="Laila, la voix de la résilience"
                />
              </div>
            </div>
          </FadeIn>

          {/* 4. UNIVERS MUSICAL */}
          <FadeIn>
            <h2 className="pressbook-section-title">04. Univers Musical</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Approche Hybride",
                    desc: "Fusion d'Afrobeat, R&B, et Soul.",
                  },
                  {
                    title: "Écriture Émotionnelle",
                    desc: "Des textes qui parlent d'amour, de résilience, d'espoir, et des réalités sociales.",
                  },
                  {
                    title: "Thématiques Fortes",
                    desc: "L'empowerment, l'identité africaine, les relations humaines, et la célébration de la vie.",
                  },
                  {
                    title: "Multilinguisme",
                    desc: "Chante en français, lingala, et anglais, touchant ainsi un public diversifié.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors flex flex-col justify-center"
                  >
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <PressImage
                src={Univers}
                alt="Laila Univers Musical"
                className="aspect-4/3 lg:aspect-square w-full"
                caption="Un univers sonore riche et hybride"
              />
            </div>
          </FadeIn>

          {/* 5. DISCOGRAPHIE */}
          <FadeIn>
            <h2 className="pressbook-section-title">
              05. Discographie & Titres Phares
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
              <div className="lg:col-span-5">
                <PressImage
                  src={Discography}
                  alt="Album Cover Art"
                  className="aspect-square"
                  caption="Pochette officielle"
                />
              </div>
              <div className="lg:col-span-7 space-y-6">
                <p className="text-2xl font-display mb-8">
                  Une discographie riche, marquée par des succès organiques et
                  des collaborations stratégiques.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Vibe", stats: "+100K streams/vues", focus: true },
                    {
                      title: "MBM (feat. Makhalba)",
                      stats: "+50K streams/vues",
                      focus: true,
                    },
                    {
                      title: "Avec le peu qu'on a",
                      stats: "+50K streams/vues",
                      focus: true,
                    },
                    { title: "2 x 2", stats: "+30K streams/vues", focus: true },
                    {
                      title: "La poupée de Mossaka",
                      stats: "+20K streams/vues",
                      focus: true,
                    },
                    { title: "One Humanity", stats: "Single", focus: false },
                    {
                      title: "À tous les êtres chers",
                      stats: "Single",
                      focus: false,
                    },
                    { title: "La Folle", stats: "Single", focus: false },
                    { title: "Papillon", stats: "Single", focus: false },
                    {
                      title: "Round 1 & Round 2",
                      stats: "Single",
                      focus: false,
                    },
                  ].map((track, i) => (
                    <div
                      key={i}
                      className={`flex flex-col p-4 rounded-xl border transition-all hover:scale-[1.02] ${track.focus ? "bg-primary/5 border-primary/20 hover:border-primary/40" : "bg-muted/30 border-transparent hover:bg-muted/50"}`}
                    >
                      <span className="font-medium flex items-center gap-2 mb-1">
                        <PlayCircle
                          className={`w-4 h-4 shrink-0 ${track.focus ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span className="truncate">{track.title}</span>
                      </span>
                      <span className="text-xs font-mono text-muted-foreground ml-6">
                        {track.stats}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 6. PERFORMANCE & DATA */}
          <FadeIn>
            <h2 className="pressbook-section-title">06. Performance & Data</h2>
            <div className="pb-grid-2 mt-8 mb-12">
              <PressImage
                src={Performance1}
                alt="Laila Live Concert 1"
                className="aspect-video"
                caption="Une énergie scénique inégalée"
              />
              <PressImage
                src={Performance2}
                alt="Laila Live Concert 2"
                className="aspect-video"
                caption="Connexion directe avec le public"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  value: "500K+",
                  label: "Vues YouTube",
                  sub: "Plus de 10K Abonnés",
                  color: "text-primary",
                },
                {
                  value: "18K+",
                  label: "Instagram",
                  sub: "Communauté très engagée",
                  color: "text-foreground",
                },
                {
                  value: "60K+",
                  label: "Facebook",
                  sub: "Croissance constante",
                  color: "text-foreground",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-10 rounded-3xl bg-card border border-border text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div
                    className={`text-5xl font-bold font-mono mb-2 tabular-nums ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <p className="text-lg font-medium">{stat.label}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* 7 & 8. PUBLIC & COLLABORATIONS */}
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
              <div>
                <h2 className="pressbook-section-title mb-6!">
                  07. Public & Audience
                </h2>
                <div className="space-y-8 mt-8">
                  {[
                    {
                      title: "Cœur de Cible",
                      desc: "18 – 35 ans (Jeunes adultes, urbains, connectés).",
                    },
                    {
                      title: "Démographie",
                      desc: "Majoritairement panafricaine (Congo, RDC, Afrique de l'Ouest) et diaspora (France, Belgique, Canada).",
                    },
                    {
                      title: "Marchés Clés",
                      desc: "Afrique Centrale, Francophonie, et au-delà.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                      <div>
                        <h4 className="text-xl font-semibold mb-2">
                          {item.title}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="pressbook-section-title mb-6!">
                  08. Collaborations
                </h2>
                <PressImage
                  src={Performance2}
                  alt="Laila Studio Collaborations"
                  className="aspect-video mb-8"
                  caption=""
                />
                <p className="text-muted-foreground mb-6">
                  Laila s'est illustrée aux côtés d'artistes majeurs de la scène
                  urbaine et traditionnelle :
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Makhalba Malecheck",
                    "Rhalph 96",
                    "Suintement",
                    "Zao",
                    "Chris Mundele",
                    "Diesel Woman",
                    "Moza",
                    "Tidiane Faux Masta",
                  ].map((artist, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full bg-muted/30 border border-border/50 text-foreground text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 9-11. STRATÉGIE & BUSINESS */}
          <FadeIn>
            <h2 className="pressbook-section-title">
              09-11. Stratégie & Opportunités
            </h2>
            <PressImage
              src={Strategy}
              alt="Laila Stratégie de Croissance"
              className="aspect-21/9 mb-12"
              caption="Déploiement numérique et vision internationale"
            />
            <div className="pb-grid-3">
              <div className="bg-card p-8 rounded-2xl border border-border shadow-md hover:shadow-xl transition-all">
                <TrendingUp className="w-8 h-8 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-4">Positionnement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Une artiste africaine moderne, exportable, capable de
                  s'adapter aux tendances globales tout en conservant une
                  authenticité locale forte.
                </p>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border shadow-md hover:shadow-xl transition-all">
                <Globe className="w-8 h-8 text-secondary mb-6" />
                <h3 className="text-xl font-semibold mb-4">Croissance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Déploiement numérique massif, production de visuels de haute
                  qualité (clips, live sessions), collaborations internationales
                  et développement scénique.
                </p>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border shadow-md hover:shadow-xl transition-all">
                <Users className="w-8 h-8 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-4">Opportunités</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {[
                    "Signature Label / Distribution",
                    "Partenariats marques",
                    "Synchronisation (Films, Séries)",
                    "Tournées internationales",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          {/* GALERIE OFFICIELLE */}
          <FadeIn>
            <h2 className="pressbook-section-title">
              Galerie Officielle (Presse)
            </h2>
            {isGalleryLoading ? (
              <div className="pb-grid-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    className="w-full aspect-square rounded-2xl bg-muted/20"
                  />
                ))}
              </div>
            ) : galleryError ? (
              <div className="p-8 text-center bg-muted/10 border border-border rounded-2xl text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p className="mb-6">{galleryError}</p>
                <PremiumButton
                  onClick={fetchGallery}
                  variant="outline"
                  className="bg-background text-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </PremiumButton>
              </div>
            ) : galleryImages.length > 0 ? (
              <div className="pb-masonry">
                {galleryImages.map((img) => (
                  <PressImage
                    key={img.id}
                    src={img.imageUrl}
                    alt={img.title || "Laila Official Press Image"}
                    className="h-auto"
                    caption={img.title}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-center p-8 bg-muted/10 rounded-2xl border border-border">
                Aucune image additionnelle disponible pour le moment.
              </p>
            )}
          </FadeIn>

          {/* 12. RÉSEAUX */}
          <FadeIn>
            <h2 className="pressbook-section-title">12. Réseaux Officiels</h2>
            <div className="pb-grid-3 mt-8">
              {[
                {
                  label: "YouTube",
                  href: "https://www.youtube.com/@Lailaandthegroove",
                },
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/lailaandthegroove/",
                },
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/lailaandthegroove",
                },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-6 rounded-xl bg-card border border-border hover:border-primary transition-all hover:shadow-lg group"
                >
                  <span className="text-lg font-medium">{link.label}</span>
                  <LinkIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </FadeIn>

          {/* 13 & 14. CONTACT & BIO COURTE */}
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 p-10 md:p-16 rounded-3xl bg-muted/10 border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl font-display font-semibold mb-8">
                  Contact & Management
                </h3>
                <div className="space-y-6 text-lg">
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-border/50 pb-4">
                    <strong className="text-foreground w-32">Booking :</strong>
                    <a
                      href="mailto:booking@laila.cg"
                      className="text-primary hover:underline font-medium"
                    >
                      booking@laila.cg
                    </a>
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-border/50 pb-4">
                    <strong className="text-foreground w-32">Presse :</strong>
                    <a
                      href="mailto:pres@laila.cg"
                      className="text-primary hover:underline font-medium"
                    >
                      pres@laila.cg
                    </a>
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-2">
                    <strong className="text-foreground w-32">
                      Management :
                    </strong>
                    <span>
                      Gilles Karter
                      <br />
                      <span className="text-muted-foreground text-base">
                        +242 06 890 9210 (WhatsApp)
                      </span>
                    </span>
                  </p>
                </div>
                <div className="mt-10">
                  <PremiumButton
                    onClick={handleDownloadPressKit}
                    className="w-full sm:w-auto shadow-lg shadow-primary/20"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le Presskit (PDF)
                  </PremiumButton>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-display font-semibold mb-8">
                  Bio Courte (Pour Médias)
                </h3>
                <div className="p-8 rounded-2xl bg-card border border-border shadow-inner">
                  <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/50 pl-6 text-lg">
                    "Laila est une étoile montante de la scène afro-fusion
                    congolaise. Mêlant des textes poignants, une voix envoûtante
                    et des rythmes puisant dans ses racines comme dans les
                    sonorités urbaines mondiales, Laila transporte son public
                    dans un univers riche en émotions. Avec des collaborations
                    marquantes et une discographie grandissante, elle est prête
                    à conquérir les scènes internationales."
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 15. SIGNATURE */}
          <FadeIn delay={0.2} className="py-24 text-center">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-muted-foreground/30 tracking-tight leading-tight">
              "Le Groove n'est pas juste de la musique.
              <br />
              <span className="text-foreground/90 not-italic font-bold block mt-4 drop-shadow-sm">
                C'est un mouvement."
              </span>
            </h2>
          </FadeIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
