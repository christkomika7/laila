import { authClient } from "#/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PremiumButton from "../ui/premiem.button";

export default function UserSettingsTab() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      navigate({ to: "/" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-6 text-foreground">
        Paramètres du Compte
      </h2>
      <div className="max-w-md space-y-6">
        <div className="p-4 rounded-md border border-border bg-background/50">
          <h3 className="font-medium text-foreground mb-2">Mot de passe</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Pour modifier votre mot de passe, veuillez vous déconnecter et
            utiliser la fonction "Mot de passe oublié" sur la page de connexion.
          </p>
          <PremiumButton disabled={isLoading} onClick={handleLogout}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Se déconnecter
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
