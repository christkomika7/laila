import { authClient } from "#/lib/auth-client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AdminProfileTab() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        toast.error("Mot de passe actuel incorrect.");
        return;
      }
      toast.success("Mot de passe modifié avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Erreur lors du changement de mot de passe.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordStrength = (() => {
    if (!newPassword) return null;
    if (newPassword.length < 6)
      return { label: "Trop court", color: "bg-red-500", width: "w-1/4" };
    if (newPassword.length < 10)
      return { label: "Moyen", color: "bg-amber-500", width: "w-2/4" };
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      return { label: "Bon", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Fort", color: "bg-emerald-500", width: "w-full" };
  })();

  if (isPending) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Informations personnelles ── */}
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

      {/* ── Changer le mot de passe ── */}
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-foreground">
          Changer le mot de passe
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
          {/* Mot de passe actuel */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background h-11 border-border text-foreground pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background h-11 border-border text-foreground pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordStrength && (
              <div className="space-y-1">
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Force :{" "}
                  <span className="text-foreground">
                    {passwordStrength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirmer */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`bg-background h-11 border-border text-foreground pr-10 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-500/50"
                    : confirmPassword && confirmPassword === newPassword
                      ? "border-emerald-500/50"
                      : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400">
                Les mots de passe ne correspondent pas.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              isChangingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 8
            }
            className="bg-primary hover:bg-primary/90 h-11 text-primary-foreground"
          >
            {isChangingPassword && (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            )}
            Changer le mot de passe
          </Button>
        </form>
      </div>
    </div>
  );
}
