import { Link } from "@tanstack/react-router";
import {
  SiInstagram as Instagram,
  SiFacebook as Facebook,
  SiYoutube as Youtube,
} from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const lailaLogoUrl =
    "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/f17982153cc76fcc048f5cef0e446f0d.png";

  return (
    <footer className="bg-[hsl(var(--book-bg))] text-foreground border-t border-red-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="flex flex-col items-start">
            <Link to="/" className="inline-block mb-4">
              <img
                src={lailaLogoUrl}
                alt="Logo Laila"
                className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] transition-transform hover:scale-105"
              />
            </Link>
            <div className="w-12 h-1 bg-linear-to-r from-red-600 to-amber-500 mb-6 rounded-full" />
            <p className="text-sm text-red-100/70 leading-relaxed font-light">
              Artiste indépendante créant des mélodies pleines d'âme et une
              musique intemporelle. Vivez le voyage à travers le son et
              l'esprit.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-6 tracking-widest uppercase">
              Liens Rapides
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-sm text-red-100/70 hover:text-red-400 transition-colors duration-200"
              >
                Catalogue Musical
              </Link>
              <Link
                to="/"
                className="text-sm text-red-100/70 hover:text-red-400 transition-colors duration-200"
              >
                Mes Téléchargements
              </Link>
              <a
                href="#"
                className="text-sm text-red-100/70 hover:text-red-400 transition-colors duration-200"
              >
                Politique de Confidentialité
              </a>
              <a
                href="#"
                className="text-sm text-red-100/70 hover:text-red-400 transition-colors duration-200"
              >
                Conditions d'Utilisation
              </a>
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-6 tracking-widest uppercase">
              Contact
            </h3>
            <div className="flex flex-col space-y-4">
              {/* Email */}
              <a
                href="mailto:Info@laila.cg"
                className="flex items-center gap-3 text-sm text-red-100/70 hover:text-red-400 transition-colors duration-200 group"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Info@laila.cg</span>
              </a>

              {/* Social Media Icons */}
              <div className="flex gap-4 pt-2">
                <a
                  href="https://www.youtube.com/@Lailaandthegroove"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-100/70 hover:text-red-400 transition-colors duration-200 hover:scale-110 transform"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/lailaandthegroove"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-100/70 hover:text-red-400 transition-colors duration-200 hover:scale-110 transform"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/lailaandthegroove/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-100/70 hover:text-red-400 transition-colors duration-200 hover:scale-110 transform"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-red-950/30 pt-8">
          <p className="text-sm text-red-100/50 text-center font-light">
            © {currentYear} Laila. Tous droits réservés. Propulsé par{" "}
            <a
              href="https://boyoka.africa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 transition-colors duration-200 font-medium"
            >
              BOYOKA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
