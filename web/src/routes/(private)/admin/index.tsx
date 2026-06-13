import AdminAlbum from "#/components/admin/album";
import AdminAnalyticsTab from "#/components/admin/analytics";
import AdminClient from "#/components/admin/client";
import { AdminMessagesTab } from "#/components/admin/contact-message";
import { AdminGalleryTab } from "#/components/admin/gallery";
import AdminInvoiceTab from "#/components/admin/invoice";
import { AdminProductTab } from "#/components/admin/product";
import AdminProfileTab from "#/components/admin/profil";
import Header from "#/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BarChart, FileText, Mail, Package, Users } from "lucide-react";
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

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 font-sans text-foreground">
            Tableau de Bord Admin
          </h1>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-8 mb-8 bg-muted/50 p-1 rounded-md h-auto!">
              <TabsTrigger
                value="profile"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
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
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="py-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Analytique
              </TabsTrigger>
            </TabsList>

            {/* ── Profils ── */}
            <TabsContent value="profile">
              <AdminProfileTab />
            </TabsContent>

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
              <AdminAnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
