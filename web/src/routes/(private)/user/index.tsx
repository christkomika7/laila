import Footer from "#/components/footer";
import Header from "#/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import UserDownloadsTab from "#/components/user/downloads";
import MyInvoicesTab from "#/components/user/invoice";
import UserProfileTab from "#/components/user/profile";
import UserPurchaseTab from "#/components/user/purchase";
import UserSettingsTab from "#/components/user/settings";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Download, FileText, Settings, ShoppingBag, User } from "lucide-react";
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

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              Mon Portail
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenue, {user?.name || user?.email}
            </p>
          </div>
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

          <TabsContent value="profile" className="space-y-6">
            <UserProfileTab />
          </TabsContent>

          <TabsContent value="purchases">
            <UserPurchaseTab />
          </TabsContent>

          <TabsContent value="downloads">
            <UserDownloadsTab />
          </TabsContent>

          <TabsContent value="invoices">
            <MyInvoicesTab />
          </TabsContent>

          <TabsContent value="settings">
            <UserSettingsTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
