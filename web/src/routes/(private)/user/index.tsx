import Footer from "#/components/footer";
import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import MyInvoicesTab from "#/components/user/invoice";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Download,
  FileText,
  Loader2,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(private)/user/")({
  head: () => ({
    meta: [{ title: "Mon Portail - Laïla Music" }],
  }),
  beforeLoad({ context }) {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    if (context.session.user.role !== "user") {
      toast.error("Vous n'avez pas l'autorisation d'accéder à cette page");
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface FakeUser {
  id: string;
  name: string;
  email: string;
}

interface FakeOrder {
  id: string;
  status: "completed" | "pending" | "failed";
  totalAmount: number;
  created: string;
  itemCount: number;
}

interface FakeDownload {
  id: string;
  title: string;
  coverUrl: string;
  created: string;
}

interface FakeInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  created: string;
  pdfUrl?: string;
}

// ─── Fake data ────────────────────────────────────────────────────────────────

const FAKE_USER: FakeUser = {
  id: "user-001",
  name: "Jean Makaya",
  email: "jean.makaya@example.com",
};

const FAKE_ORDERS: FakeOrder[] = [
  {
    id: "order-abc123",
    status: "completed",
    totalAmount: 510000,
    created: "2024-05-10T14:32:00Z",
    itemCount: 2,
  },
  {
    id: "order-def456",
    status: "pending",
    totalAmount: 255000,
    created: "2024-06-01T09:15:00Z",
    itemCount: 1,
  },
  {
    id: "order-ghi789",
    status: "failed",
    totalAmount: 102000,
    created: "2024-06-03T18:45:00Z",
    itemCount: 1,
  },
];

const FAKE_DOWNLOADS: FakeDownload[] = [
  {
    id: "dl-001",
    title: "Résilience",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&q=80",
    created: "2024-05-10T14:35:00Z",
  },
  {
    id: "dl-002",
    title: "Lumière d'Aube",
    coverUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&q=80",
    created: "2024-05-10T14:36:00Z",
  },
];

const FAKE_INVOICES: FakeInvoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "FAC-2024-0042",
    total: 510000,
    created: "2024-05-10T14:35:00Z",
    pdfUrl: "#",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
  // TODO: remplacer par useAuth()
  const currentUser = FAKE_USER;
  const logout = () => {
    toast.info("Déconnexion simulée.");
    // TODO: appeler logout() réel
  };

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<FakeOrder[]>([]);
  const [downloads, setDownloads] = useState<FakeDownload[]>([]);
  const [invoices, setInvoices] = useState<FakeInvoice[]>([]);

  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulation délai réseau
        await new Promise((r) => setTimeout(r, 700));

        // TODO: remplacer par pb.collection('orders').getFullList(...)
        setOrders(FAKE_ORDERS);

        // TODO: remplacer par pb.collection('downloads').getFullList(...)
        setDownloads(FAKE_DOWNLOADS);

        // TODO: remplacer par pb.collection('invoices').getFullList(...)
        setInvoices(FAKE_INVOICES);
      } catch (error) {
        console.error("General error fetching user data:", error);
        toast.error("Erreur lors du chargement de certaines données.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      // Simulation
      await new Promise((r) => setTimeout(r, 800));
      // TODO: remplacer par pb.collection('users').update(currentUser.id, { name: profileData.name })
      toast.success("Profil mis à jour avec succès.");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Main ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              Mon Portail
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenue, {currentUser.name || currentUser.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="border-border text-foreground hover:bg-muted"
          >
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 bg-muted/50 p-1 rounded-md h-auto! w-full">
            {[
              { value: "profile", icon: User, label: "Profil" },
              { value: "purchases", icon: ShoppingBag, label: "Achats" },
              { value: "downloads", icon: Download, label: "Téléchargements" },
              { value: "invoices", icon: FileText, label: "Factures" },
              { value: "settings", icon: Settings, label: "Paramètres" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <Icon className="w-4 h-4 mr-2 hidden sm:inline" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Profil ── */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-foreground">
                Informations Personnelles
              </h2>
              <form
                onSubmit={handleProfileUpdate}
                className="space-y-6 max-w-md"
              >
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="name">Nom Complet</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="bg-background h-11 border-border text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="email">Adresse E-mail</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted border-border h-11 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'adresse e-mail ne peut pas être modifiée.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-primary hover:bg-primary/90 h-11 text-primary-foreground"
                >
                  {isUpdatingProfile && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Mettre à jour le profil
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* ── Achats ── */}
          <TabsContent value="purchases">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-foreground">
                Historique des Achats
              </h2>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Vous n'avez pas encore effectué d'achats.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-md border border-border bg-background/50 gap-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          Commande #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {order.itemCount} article(s)
                        </p>
                      </div>
                      <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <span className="font-bold text-foreground">
                          {order.totalAmount.toLocaleString("fr-FR")} FCFA
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full mt-2 ${
                            order.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : order.status === "pending"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Terminé"
                            : order.status === "pending"
                              ? "En attente"
                              : "Échoué"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Téléchargements ── */}
          <TabsContent value="downloads">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-foreground">
                Mes Téléchargements
              </h2>
              {downloads.length === 0 ? (
                <div className="text-center py-12">
                  <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucun téléchargement disponible.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {downloads.map((download) => (
                    <div
                      key={download.id}
                      className="flex items-center justify-between p-4 rounded-md border border-border bg-background/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                          <img
                            src={download.coverUrl}
                            alt={download.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {download.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acheté le{" "}
                            {format(new Date(download.created), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-muted"
                        onClick={() => toast.info("Téléchargement simulé.")}
                      >
                        <Download className="w-4 h-4 mr-2" /> Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Factures ── */}
          <TabsContent value="invoices">
            <MyInvoicesTab />
          </TabsContent>

          {/* ── Paramètres ── */}
          <TabsContent value="settings">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-foreground">
                Paramètres du Compte
              </h2>
              <div className="max-w-md space-y-6">
                <div className="p-4 rounded-md border border-border bg-background/50">
                  <h3 className="font-medium text-foreground mb-2">
                    Mot de passe
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pour modifier votre mot de passe, veuillez vous déconnecter
                    et utiliser la fonction "Mot de passe oublié" sur la page de
                    connexion.
                  </p>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full border-border text-foreground hover:bg-muted"
                  >
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
