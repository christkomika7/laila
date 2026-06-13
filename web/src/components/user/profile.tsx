import { authClient } from "#/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function UserProfileTab() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdating(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      toast.success("Profil mis à jour avec succès.");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isPending) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-6 text-foreground">
        Informations Personnelles
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">Nom Complet</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background h-11 border-border text-foreground"
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">Adresse E-mail</Label>
          <Input
            id="email"
            value={user?.email ?? ""}
            disabled
            className="bg-muted border-border h-11 text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            L'adresse e-mail ne peut pas être modifiée.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isUpdating || !name.trim() || name.trim() === user?.name}
          className="bg-primary hover:bg-primary/90 h-11 text-primary-foreground"
        >
          {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Mettre à jour le profil
        </Button>
      </form>
    </div>
  );
}
