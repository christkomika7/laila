import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(public)/contact")({
  head: () => ({
    title: "Contact - Laïla Music",
    meta: [
      { property: "og:title", content: "Contact - Laïla Music" },
      {
        name: "description",
        content:
          "Contactez Laila pour des réservations, des demandes de presse et des collaborations.",
      },
    ],
  }),
  component: RouteComponent,
});

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function RouteComponent() {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "Erreur serveur");
      }

      toast.success("Merci ! Votre message a été envoyé avec succès.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact submission error:", error);
      toast.error("Échec de l'envoi du message. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="grow pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 mr-[-20%] mt-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 ml-[-20%] mb-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pour les réservations, les demandes de presse ou les questions
              générales, veuillez nous contacter via le formulaire ci-dessous ou
              contacter directement notre management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Contact Info Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-4 space-y-8"
            >
              <div className="bg-card p-8 rounded-lg border border-border shadow-lg h-full">
                <h2 className="text-2xl font-semibold font-display mb-6 border-b border-border pb-4 text-foreground">
                  Contacts Directs
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Booking
                      </p>

                      <a
                        href="mailto:booking@laila.cg"
                        className="text-base text-foreground hover:text-primary transition-colors"
                      >
                        booking@laila.cg
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                      <Mail className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Presse / Contact
                      </p>

                      <a
                        href="mailto:infos@laila.cg"
                        className="text-base text-foreground hover:text-secondary transition-colors"
                      >
                        infos@laila.cg
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                      <Phone className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Management (WhatsApp)
                      </p>
                      <p className="text-base text-foreground">
                        +242 06 890 9210
                        <span className="block text-sm text-muted-foreground mt-0.5">
                          Gilles Karter
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Localisation
                      </p>
                      <p className="text-base text-foreground">
                        Brazzaville, Congo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-8"
            >
              <div className="bg-card p-8 rounded-lg border border-border shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">
                        Nom Complet *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        required
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        Adresse E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.com"
                        required
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">
                        Numéro de Téléphone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+242 00 000 0000"
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-foreground">
                        Sujet *
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={handleSelectChange}
                        required
                      >
                        <SelectTrigger
                          id="subject"
                          className="bg-background border-border text-foreground focus:ring-primary h-12"
                        >
                          <SelectValue placeholder="Sélectionnez un sujet" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="press">
                            Prise de contact
                          </SelectItem>
                          <SelectItem value="other">Autres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Comment pouvons-nous vous aider ?"
                      rows={6}
                      required
                      className="bg-background border-border text-foreground focus-visible:ring-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full md:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Envoyer le Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
