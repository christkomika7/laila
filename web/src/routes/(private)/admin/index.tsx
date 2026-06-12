import AdminAlbum from "#/components/admin/album";
import AdminClient from "#/components/admin/client";
import { AdminMessagesTab } from "#/components/admin/contact-message";
import { AdminGalleryTab } from "#/components/admin/gallery";
import AdminInvoiceTab from "#/components/admin/invoice";
import { AdminProductTab } from "#/components/admin/product";
import Header from "#/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BarChart, FileText, Mail, Package, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(private)/admin/")({
  head: () => ({
    meta: [{ title: "Tableau de Bord Admin - Laila" }],
  }),
  beforeLoad({ context }) {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    if (context.session.user.role !== "admin") {
      toast.error("Vous n'avez pas l'autorisation d'accéder à cette page");
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

type Invoice = {
  id: string;
  invoiceNumber: string;
  created: string;
  total: number;
  status: string;
  expand: { userId: { email: string } };
};

const FAKE_INVOICES: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2024-001",
    created: "2024-05-10T10:00:00Z",
    total: 12.99,
    status: "payée",
    expand: { userId: { email: "marie.dupont@email.com" } },
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2024-002",
    created: "2024-05-12T14:30:00Z",
    total: 9.99,
    status: "payée",
    expand: { userId: { email: "jean.martin@email.com" } },
  },
  {
    id: "inv3",
    invoiceNumber: "INV-2024-003",
    created: "2024-05-18T09:15:00Z",
    total: 24.97,
    status: "en attente",
    expand: { userId: { email: "sophie.leblanc@email.com" } },
  },
  {
    id: "inv4",
    invoiceNumber: "INV-2024-004",
    created: "2024-06-01T16:45:00Z",
    total: 7.99,
    status: "payée",
    expand: { userId: { email: "thomas.bernard@email.com" } },
  },
];

function RouteComponent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [unreadMessages] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setInvoices(FAKE_INVOICES);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 font-sans text-foreground">
            Tableau de Bord Admin
          </h1>

          <Tabs defaultValue="customers" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-8 bg-muted/50 p-1 rounded-md h-auto!">
              <TabsTrigger
                value="customers"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Clients
              </TabsTrigger>
              <TabsTrigger
                value="albums"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <Package className="h-4 w-4 mr-2" />
                Albums & Titres
              </TabsTrigger>
              <TabsTrigger
                value="galeries"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <Package className="h-4 w-4 mr-2" />
                Galeries
              </TabsTrigger>
              <TabsTrigger
                value="stores"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Boutiques
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Factures
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="relative py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <Mail className="h-4 w-4 mr-2" />
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {unreadMessages}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Analytique
              </TabsTrigger>
            </TabsList>

            {/* ── Clients ── */}
            <TabsContent value="customers">
              <AdminClient />
            </TabsContent>

            {/* ── Albums & Titres ── */}
            <TabsContent value="albums" className="space-y-6">
              <AdminAlbum />
            </TabsContent>

            {/* ── Galeries ── */}
            <TabsContent value="galeries">
              <AdminGalleryTab />
            </TabsContent>

            {/* ── Boutiques ── */}
            <TabsContent value="stores">
              <AdminProductTab />
            </TabsContent>

            {/* ── Factures ── */}
            <TabsContent value="invoices">
              <AdminInvoiceTab />
            </TabsContent>

            {/* ── Messages ── */}
            <TabsContent value="messages">
              <AdminMessagesTab />
            </TabsContent>

            {/* ── Analytique ── */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card rounded-md p-6 shadow-sm border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Revenu Total
                  </h3>
                  <p className="text-3xl font-bold text-primary font-mono">
                    $
                    {invoices
                      .reduce((sum, inv) => sum + inv.total, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="bg-card rounded-md p-6 shadow-sm border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Total des Commandes
                  </h3>
                  <p className="text-3xl font-bold text-foreground font-mono">
                    {invoices.length}
                  </p>
                </div>
                <div className="bg-card rounded-md p-6 shadow-sm border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Clients
                  </h3>
                  <p className="text-3xl font-bold text-foreground font-mono">
                    {/* {customers.length} */}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
