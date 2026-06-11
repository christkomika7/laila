// apps/web/src/components/header.tsx

import { useState } from "react";
import {
  Menu,
  X,
  ShoppingCart as ShoppingCartIcon,
  LogOut,
  User,
  Home as House,
  Music,
  Mic2,
  Mail,
  Image,
  ShoppingBag,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { toast } from "sonner";
import { useCartStore } from "#/store/use-cart-store";

const navLinks = [
  { path: "/", label: "Accueil", icon: House },
  { path: "/music", label: "Musique", icon: Music },
  { path: "/videography", label: "Vdéographie", icon: Mic2 },
  { path: "/gallery", label: "Galerie", icon: Image },
  { path: "/store", label: "Boutique", icon: ShoppingBag },
  { path: "/pressbook", label: "Pressbook", icon: FileText },
  { path: "/contact", label: "Contact", icon: Mail },
];

const lailaLogoUrl =
  "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/f17982153cc76fcc048f5cef0e446f0d.png";

// ─── CartButton lit le store directement → réactif sans prop ─────────────────
const CartButton = () => {
  // Lecture directe du store : le composant se re-render dès qu'items change
  const items = useCartStore.use.items();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const inner = (
    <>
      <ShoppingCartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-md">
          {count}
        </span>
      )}
    </>
  );

  if (count > 0) {
    return (
      <Link to="/checkout">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {inner}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      {inner}
    </Button>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name ?? "";
  const portalTo = isAdmin ? "/admin" : "/user";

  const authReady = !isPending;

  const isActive = (path: string) => location.pathname === path;
  const isOnPortal = location.pathname.startsWith(portalTo);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Déconnexion réussie");
      router.navigate({ to: "/" });
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const AuthButtons = () => {
    if (!authReady) return null;

    if (!isAuthenticated) {
      return (
        <Link to="/login">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-muted gap-2"
          >
            <User className="size-4" />
            <span className="hidden xl:inline">Connexion</span>
          </Button>
        </Link>
      );
    }

    return (
      <>
        {isOnPortal ? (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="gap-2 opacity-50 cursor-default"
          >
            {isAdmin ? (
              <LayoutDashboard className="h-[18px] w-[18px]" />
            ) : (
              <User className="h-[18px] w-[18px]" />
            )}
            <span className="hidden xl:inline max-w-[120px] truncate">
              {userName || (isAdmin ? "Admin" : "Mon compte")}
            </span>
          </Button>
        ) : (
          <Link to={portalTo}>
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-300 hover:text-foreground hover:bg-muted gap-2"
            >
              {isAdmin ? (
                <LayoutDashboard className="h-[18px] w-[18px]" />
              ) : (
                <User className="h-[18px] w-[18px]" />
              )}
              <span className="hidden xl:inline max-w-[120px] truncate">
                {userName || (isAdmin ? "Admin" : "Mon compte")}
              </span>
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-500 bg-red-500/10 hover:text-red-500 hover:bg-red-500/5 gap-2"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span className="hidden xl:inline">Déconnexion</span>
        </Button>
      </>
    );
  };

  const MobileAuthLinks = () => {
    if (!authReady) return null;

    if (!isAuthenticated) {
      return (
        <Link
          to="/login"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 text-base font-medium px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <User className="h-[18px] w-[18px]" />
          Connexion
        </Link>
      );
    }

    return (
      <>
        {isOnPortal ? (
          <div className="flex items-center gap-2 text-base font-medium px-4 py-3 rounded-lg text-primary bg-primary/5 opacity-70">
            {isAdmin ? (
              <LayoutDashboard className="h-[18px] w-[18px]" />
            ) : (
              <User className="h-[18px] w-[18px]" />
            )}
            <span className="truncate">
              {userName || (isAdmin ? "Admin Dashboard" : "Mon compte")}
            </span>
          </div>
        ) : (
          <Link
            to={portalTo}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-base font-medium px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {isAdmin ? (
              <LayoutDashboard className="h-[18px] w-[18px]" />
            ) : (
              <User className="h-[18px] w-[18px]" />
            )}
            <span className="truncate">
              {userName || (isAdmin ? "Admin Dashboard" : "Mon compte")}
            </span>
          </Link>
        )}

        <button
          onClick={() => {
            handleLogout();
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 text-base font-medium px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/5 w-full text-left"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Déconnexion
        </button>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img
              src={lailaLogoUrl}
              alt="Logo Laila"
              className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center space-x-6">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 relative py-2 ${
                  isActive(path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{label}</span>
                {isActive(path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />
                )}
              </Link>
            ))}

            <div className="flex items-center space-x-2 border-l border-border pl-6">
              <CartButton />
              <AuthButtons />
            </div>
          </nav>

          {/* Mobile icons */}
          <div className="xl:hidden flex items-center space-x-4">
            <CartButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2 -mr-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border bg-background shadow-xl absolute left-0 w-full px-4 h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-base font-medium px-4 py-3 rounded-lg transition-colors ${
                    isActive(path)
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <MobileAuthLinks />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
