import Footer from "#/components/footer";
import Header from "#/components/header";
import { DonationForm } from "#/components/payment/donation";
import { StripePaymentForm } from "#/components/payment/stripe-payment";
import VideoAssetDisplay from "#/components/ui/video-asset-display";
import apiServerClient from "#/lib/api";
import { isResilience, pollPaymentStatus } from "#/lib/helpers";
import { stripePromise } from "#/lib/payment";
import { useCartStore } from "#/store/use-cart-store";
import { Elements } from "@stripe/react-stripe-js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  Search,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(public)/checkout")({
  head: () => ({
    title: "Paiement - Laïla",
    meta: [{ name: "description", content: "Paiement" }],
  }),
  component: RouteComponent,
});

const FAKE_VIDEO_URL =
  "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4";

const formatCurrency = (amount: number, currency = "XAF") => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
  }
};

const PAWAPAY_COUNTRIES: Record<
  string,
  {
    name: string;
    flag: string;
    currency: string;
    dialCode: string;
    phonePlaceholder: string;
    operators: { code: string; name: string; logo: string }[];
  }
> = {
  COG: {
    name: "Congo (Brazzaville)",
    flag: "🇨🇬",
    currency: "XAF",
    dialCode: "+242",
    phonePlaceholder: "+242 06 000 0000",
    operators: [
      { code: "AIRTEL_COG", name: "Airtel Money", logo: "🔴" },
      { code: "MTN_COG", name: "MTN Mobile Money", logo: "🟡" },
    ],
  },
  CMR: {
    name: "Cameroun",
    flag: "🇨🇲",
    currency: "XAF",
    dialCode: "+237",
    phonePlaceholder: "+237 6XX XXX XXX",
    operators: [
      { code: "MTN_CMR", name: "MTN Mobile Money", logo: "🟡" },
      { code: "ORANGE_CMR", name: "Orange Money", logo: "🟠" },
    ],
  },
  CIV: {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: "XOF",
    dialCode: "+225",
    phonePlaceholder: "+225 07 XX XX XX XX",
    operators: [
      { code: "ORANGE_CIV", name: "Orange Money", logo: "🟠" },
      { code: "MTN_CIV", name: "MTN Mobile Money", logo: "🟡" },
      { code: "MOOV_CIV", name: "Moov Money", logo: "🔵" },
      { code: "WAVE_CIV", name: "Wave", logo: "🌊" },
    ],
  },
  SEN: {
    name: "Sénégal",
    flag: "🇸🇳",
    currency: "XOF",
    dialCode: "+221",
    phonePlaceholder: "+221 7X XXX XX XX",
    operators: [
      { code: "ORANGE_SEN", name: "Orange Money", logo: "🟠" },
      { code: "FREE_SEN", name: "Free Money", logo: "🔵" },
      { code: "WAVE_SEN", name: "Wave", logo: "🌊" },
    ],
  },
  GHA: {
    name: "Ghana",
    flag: "🇬🇭",
    currency: "GHS",
    dialCode: "+233",
    phonePlaceholder: "+233 24 XXX XXXX",
    operators: [
      { code: "MTN_GHA", name: "MTN Mobile Money", logo: "🟡" },
      { code: "VODAFONE_GHA", name: "Vodafone Cash", logo: "🔴" },
      { code: "AIRTELTIGO_GHA", name: "AirtelTigo Money", logo: "🔴" },
    ],
  },
  NGA: {
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    dialCode: "+234",
    phonePlaceholder: "+234 80X XXX XXXX",
    operators: [
      { code: "MTN_NGA", name: "MTN MoMo", logo: "🟡" },
      { code: "AIRTEL_NGA", name: "Airtel Money", logo: "🔴" },
    ],
  },
  KEN: {
    name: "Kenya",
    flag: "🇰🇪",
    currency: "KES",
    dialCode: "+254",
    phonePlaceholder: "+254 7XX XXX XXX",
    operators: [
      { code: "MPESA_KEN", name: "M-Pesa", logo: "🟢" },
      { code: "AIRTEL_KEN", name: "Airtel Money", logo: "🔴" },
    ],
  },
  TZA: {
    name: "Tanzanie",
    flag: "🇹🇿",
    currency: "TZS",
    dialCode: "+255",
    phonePlaceholder: "+255 7XX XXX XXX",
    operators: [
      { code: "MPESA_TZA", name: "M-Pesa", logo: "🟢" },
      { code: "TIGO_TZA", name: "Tigo Pesa", logo: "🔵" },
      { code: "AIRTEL_TZA", name: "Airtel Money", logo: "🔴" },
      { code: "HALOTEL_TZA", name: "Halopesa", logo: "🟣" },
    ],
  },
  UGA: {
    name: "Ouganda",
    flag: "🇺🇬",
    currency: "UGX",
    dialCode: "+256",
    phonePlaceholder: "+256 7XX XXX XXX",
    operators: [
      { code: "MTN_UGA", name: "MTN Mobile Money", logo: "🟡" },
      { code: "AIRTEL_UGA", name: "Airtel Money", logo: "🔴" },
    ],
  },
  ZMB: {
    name: "Zambie",
    flag: "🇿🇲",
    currency: "ZMW",
    dialCode: "+260",
    phonePlaceholder: "+260 9X XXX XXXX",
    operators: [
      { code: "MTN_ZMB", name: "MTN Mobile Money", logo: "🟡" },
      { code: "AIRTEL_ZMB", name: "Airtel Money", logo: "🔴" },
      { code: "ZAMTEL_ZMB", name: "Zamtel Kwacha", logo: "🟢" },
    ],
  },
  ZWE: {
    name: "Zimbabwe",
    flag: "🇿🇼",
    currency: "USD",
    dialCode: "+263",
    phonePlaceholder: "+263 7X XXX XXXX",
    operators: [
      { code: "ECOCASH_ZWE", name: "EcoCash", logo: "🟢" },
      { code: "ONEMONEY_ZWE", name: "OneMoney", logo: "🔴" },
    ],
  },
  MOZ: {
    name: "Mozambique",
    flag: "🇲🇿",
    currency: "MZN",
    dialCode: "+258",
    phonePlaceholder: "+258 8X XXX XXXX",
    operators: [
      { code: "MPESA_MOZ", name: "M-Pesa", logo: "🟢" },
      { code: "EMOLA_MOZ", name: "eMola", logo: "🔵" },
    ],
  },
  GIN: {
    name: "Guinée",
    flag: "🇬🇳",
    currency: "GNF",
    dialCode: "+224",
    phonePlaceholder: "+224 6XX XXX XXX",
    operators: [
      { code: "MTN_GIN", name: "MTN Mobile Money", logo: "🟡" },
      { code: "ORANGE_GIN", name: "Orange Money", logo: "🟠" },
    ],
  },
  BFA: {
    name: "Burkina Faso",
    flag: "🇧🇫",
    currency: "XOF",
    dialCode: "+226",
    phonePlaceholder: "+226 6X XX XX XX",
    operators: [
      { code: "ORANGE_BFA", name: "Orange Money", logo: "🟠" },
      { code: "MOOV_BFA", name: "Moov Money", logo: "🔵" },
    ],
  },
  MLI: {
    name: "Mali",
    flag: "🇲🇱",
    currency: "XOF",
    dialCode: "+223",
    phonePlaceholder: "+223 7X XX XX XX",
    operators: [
      { code: "ORANGE_MLI", name: "Orange Money", logo: "🟠" },
      { code: "MOOV_MLI", name: "Moov Money", logo: "🔵" },
    ],
  },
  MDG: {
    name: "Madagascar",
    flag: "🇲🇬",
    currency: "MGA",
    dialCode: "+261",
    phonePlaceholder: "+261 3X XX XXX XX",
    operators: [
      { code: "MVOLA_MDG", name: "MVola", logo: "🔴" },
      { code: "AIRTEL_MDG", name: "Airtel Money", logo: "🔴" },
      { code: "ORANGE_MDG", name: "Orange Money", logo: "🟠" },
    ],
  },
  RWA: {
    name: "Rwanda",
    flag: "🇷🇼",
    currency: "RWF",
    dialCode: "+250",
    phonePlaceholder: "+250 7XX XXX XXX",
    operators: [
      { code: "MTN_RWA", name: "MTN Mobile Money", logo: "🟡" },
      { code: "AIRTEL_RWA", name: "Airtel Money", logo: "🔴" },
    ],
  },
  BEN: {
    name: "Bénin",
    flag: "🇧🇯",
    currency: "XOF",
    dialCode: "+229",
    phonePlaceholder: "+229 9X XX XX XX",
    operators: [
      { code: "MTN_BEN", name: "MTN Mobile Money", logo: "🟡" },
      { code: "MOOV_BEN", name: "Moov Money", logo: "🔵" },
    ],
  },
  TGO: {
    name: "Togo",
    flag: "🇹🇬",
    currency: "XOF",
    dialCode: "+228",
    phonePlaceholder: "+228 9X XX XX XX",
    operators: [
      { code: "TMONEY_TGO", name: "T-Money", logo: "🟡" },
      { code: "MOOV_TGO", name: "Moov Money", logo: "🔵" },
    ],
  },
  GAB: {
    name: "Gabon",
    flag: "🇬🇦",
    currency: "XAF",
    dialCode: "+241",
    phonePlaceholder: "+241 0X XX XX XX",
    operators: [{ code: "AIRTEL_GAB", name: "Airtel Money", logo: "🔴" }],
  },
  SLE: {
    name: "Sierra Leone",
    flag: "🇸🇱",
    currency: "SLL",
    dialCode: "+232",
    phonePlaceholder: "+232 7X XXX XXX",
    operators: [
      { code: "ORANGE_SLE", name: "Orange Money", logo: "🟠" },
      { code: "AFRIMONEY_SLE", name: "Afrimoney", logo: "🟢" },
    ],
  },
  GNB: {
    name: "Guinée-Bissau",
    flag: "🇬🇼",
    currency: "XOF",
    dialCode: "+245",
    phonePlaceholder: "+245 9X XXX XXXX",
    operators: [{ code: "MTN_GNB", name: "MTN Mobile Money", logo: "🟡" }],
  },
  COD: {
    name: "RD Congo",
    flag: "🇨🇩",
    currency: "CDF",
    dialCode: "+243",
    phonePlaceholder: "+243 8X XXX XXXX",
    operators: [
      { code: "AIRTEL_COD", name: "Airtel Money", logo: "🔴" },
      { code: "MPESA_COD", name: "M-Pesa", logo: "🟢" },
      { code: "ORANGE_COD", name: "Orange Money", logo: "🟠" },
    ],
  },
  ETH: {
    name: "Éthiopie",
    flag: "🇪🇹",
    currency: "ETB",
    dialCode: "+251",
    phonePlaceholder: "+251 9X XXX XXXX",
    operators: [{ code: "TELEBIRR_ETH", name: "Telebirr", logo: "🔵" }],
  },
};

const WORLD_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albanie", flag: "🇦🇱" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "AD", name: "Andorre", flag: "🇦🇩" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "AR", name: "Argentine", flag: "🇦🇷" },
  { code: "AM", name: "Arménie", flag: "🇦🇲" },
  { code: "AU", name: "Australie", flag: "🇦🇺" },
  { code: "AT", name: "Autriche", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaïdjan", flag: "🇦🇿" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
  { code: "BG", name: "Bulgarie", flag: "🇧🇬" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
  { code: "CV", name: "Cap-Vert", flag: "🇨🇻" },
  { code: "KH", name: "Cambodge", flag: "🇰🇭" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CF", name: "Centrafrique", flag: "🇨🇫" },
  { code: "TD", name: "Tchad", flag: "🇹🇩" },
  { code: "CL", name: "Chili", flag: "🇨🇱" },
  { code: "CN", name: "Chine", flag: "🇨🇳" },
  { code: "CO", name: "Colombie", flag: "🇨🇴" },
  { code: "CG", name: "Congo (Brazzaville)", flag: "🇨🇬" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩" },
  { code: "HR", name: "Croatie", flag: "🇭🇷" },
  { code: "CY", name: "Chypre", flag: "🇨🇾" },
  { code: "CZ", name: "Tchéquie", flag: "🇨🇿" },
  { code: "DK", name: "Danemark", flag: "🇩🇰" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯" },
  { code: "EG", name: "Égypte", flag: "🇪🇬" },
  { code: "EE", name: "Estonie", flag: "🇪🇪" },
  { code: "ET", name: "Éthiopie", flag: "🇪🇹" },
  { code: "FI", name: "Finlande", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "GM", name: "Gambie", flag: "🇬🇲" },
  { code: "GE", name: "Géorgie", flag: "🇬🇪" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Grèce", flag: "🇬🇷" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
  { code: "GW", name: "Guinée-Bissau", flag: "🇬🇼" },
  { code: "HU", name: "Hongrie", flag: "🇭🇺" },
  { code: "IS", name: "Islande", flag: "🇮🇸" },
  { code: "IN", name: "Inde", flag: "🇮🇳" },
  { code: "ID", name: "Indonésie", flag: "🇮🇩" },
  { code: "IE", name: "Irlande", flag: "🇮🇪" },
  { code: "IL", name: "Israël", flag: "🇮🇱" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "JO", name: "Jordanie", flag: "🇯🇴" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "LV", name: "Lettonie", flag: "🇱🇻" },
  { code: "LB", name: "Liban", flag: "🇱🇧" },
  { code: "LT", name: "Lituanie", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬" },
  { code: "MY", name: "Malaisie", flag: "🇲🇾" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "MT", name: "Malte", flag: "🇲🇹" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷" },
  { code: "MX", name: "Mexique", flag: "🇲🇽" },
  { code: "MD", name: "Moldavie", flag: "🇲🇩" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿" },
  { code: "NP", name: "Népal", flag: "🇳🇵" },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱" },
  { code: "NZ", name: "Nouvelle-Zélande", flag: "🇳🇿" },
  { code: "NE", name: "Niger", flag: "🇳🇪" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norvège", flag: "🇳🇴" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "PE", name: "Pérou", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Pologne", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Roumanie", flag: "🇷🇴" },
  { code: "RU", name: "Russie", flag: "🇷🇺" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "SA", name: "Arabie saoudite", flag: "🇸🇦" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "RS", name: "Serbie", flag: "🇷🇸" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "SG", name: "Singapour", flag: "🇸🇬" },
  { code: "SK", name: "Slovaquie", flag: "🇸🇰" },
  { code: "SI", name: "Slovénie", flag: "🇸🇮" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SE", name: "Suède", flag: "🇸🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿" },
  { code: "TH", name: "Thaïlande", flag: "🇹🇭" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "TR", name: "Turquie", flag: "🇹🇷" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "Émirats arabes unis", flag: "🇦🇪" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "VN", name: "Viêt Nam", flag: "🇻🇳" },
  { code: "ZM", name: "Zambie", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
];

interface CheckoutPayload {
  email: string;
  name?: string;
  items: {
    variantId?: string;
    title: string;
    variantTitle?: string;
    priceInCents: number;
    quantity: number;
    currency: string;
    coverUrl: string | null;
  }[];
  paymentMethod: "card" | "mobile_money";
  msisdn?: string;
  correspondent?: string;
  country?: string;
  billingCountry?: string;
}

interface CheckoutResponsePawapay {
  provider: "pawapay";
  orderId: string;
  paymentId: string;
  depositId: string;
  status: "ACCEPTED";
}

interface CheckoutResponseStripe {
  provider: "stripe";
  orderId: string;
  paymentId: string;
  clientSecret: string;
}

type CheckoutResponse = CheckoutResponsePawapay | CheckoutResponseStripe;

async function callCheckout(
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  const res = await apiServerClient.fetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Erreur serveur (${res.status})`);
  }

  return data as CheckoutResponse;
}

type PaymentMethod = "mobile_money" | "card";
type Status = "idle" | "processing" | "polling" | "completed" | "failed";

function CountryDropdown<
  T extends { code: string; name: string; flag: string; currency?: string },
>({
  options,
  value,
  onChange,
  disabled,
  placeholder = "Sélectionner…",
  showCurrency = false,
}: {
  options: T[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showCurrency?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.code === value);
  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-4 flex items-center justify-between gap-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm hover:border-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <>
              <span className="text-base leading-none shrink-0">
                {selected.flag}
              </span>
              <span className="text-neutral-100 truncate">{selected.name}</span>
              {showCurrency && selected.currency && (
                <span className="text-xs text-neutral-500 font-mono shrink-0">
                  {selected.currency}
                </span>
              )}
            </>
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none border border-transparent focus:border-neutral-600"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-500 hover:text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-500 text-sm py-5">
                  Aucun résultat
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.code}
                    type="button"
                    onClick={() => {
                      onChange(o.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-neutral-800 transition-colors text-left ${value === o.code ? "bg-neutral-800" : ""}`}
                  >
                    <span className="text-base leading-none">{o.flag}</span>
                    <span
                      className={
                        value === o.code
                          ? "text-white font-medium"
                          : "text-neutral-300"
                      }
                    >
                      {o.name}
                    </span>
                    {showCurrency && o.currency && (
                      <span className="ml-auto text-xs font-mono text-neutral-600">
                        {o.currency}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-11 px-4 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 transition-colors hover:border-neutral-600";

// ─── Checkout page ─────────────────────────────────────────────────────────────
function RouteComponent() {
  const navigate = useNavigate();

  const cartItems = useCartStore.use.items();
  const subtotal = useCartStore.use.subtotal()();
  const itemCount = useCartStore.use.itemCount()();
  const removeItem = useCartStore.use.removeItem();
  const clearCart = useCartStore.use.clearCart();

  const defaultCurrency = cartItems[0]?.currency ?? "XAF";

  // Payment form state
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mobile_money");
  const [email, setEmail] = useState("");
  // Mobile money
  const [country, setCountry] = useState("COG");
  const [operator, setOperator] = useState("");
  const [msisdn, setMsisdn] = useState("");
  // Card
  const [cardName, setCardName] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Keep abort controller ref for polling cleanup
  const pollingAbortRef = useRef<AbortController | null>(null);

  const countryData = PAWAPAY_COUNTRIES[country] ?? PAWAPAY_COUNTRIES.COG;
  const pawapayOptions = Object.entries(PAWAPAY_COUNTRIES).map(([code, d]) => ({
    code,
    name: d.name,
    flag: d.flag,
    currency: d.currency,
  }));

  useEffect(() => {
    setOperator("");
    setMsisdn("");
  }, [country]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingAbortRef.current?.abort();
    };
  }, []);

  const handleRemoveItem = (id: string, title: string) => {
    removeItem(id);
    toast.info(`« ${title} » retiré du panier`);
  };

  // Build full msisdn with dial code if not already prefixed
  const buildFullMsisdn = (raw: string): string => {
    const cleaned = raw.replace(/\s/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
    // Remove leading 0 before prepending dial code
    const withoutLeadingZero = cleaned.startsWith("0")
      ? cleaned.slice(1)
      : cleaned;
    return countryData.dialCode + withoutLeadingZero;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return setError("Adresse e-mail invalide.");
    if (itemCount === 0) return setError("Votre panier est vide.");

    const items = cartItems.map((item) => ({
      variantId: item.variantId ?? item.id,
      quantity: item.quantity,
      title: item.title,
      variantTitle: item.variantTitle,
      priceInCents: item.priceInCents,
      currency: item.currency ?? defaultCurrency,
      coverUrl: item.coverUrl,
    }));

    // ── Dans handleSubmit, bloc mobile_money — REMPLACE le try/catch entier
    if (paymentMethod === "mobile_money") {
      if (!operator) return setError("Sélectionnez un opérateur.");

      const fullPhone = buildFullMsisdn(msisdn);
      if (fullPhone.replace(/\D/g, "").length < 10)
        return setError(
          `Numéro invalide (ex: ${countryData.phonePlaceholder}).`,
        );

      setStatus("processing");

      try {
        const data = await callCheckout({
          email,
          items,
          paymentMethod: "mobile_money", // ✅ corrigé
          msisdn: fullPhone,
          correspondent: operator,
          country, // ✅ le state du dropdown PawaPay
        });

        if (data.provider !== "pawapay") throw new Error("Réponse inattendue.");

        setTransactionId(data.depositId);
        setStatus("polling");

        const abortController = new AbortController();
        pollingAbortRef.current = abortController;

        try {
          const result = await pollPaymentStatus(
            data.paymentId,
            abortController.signal,
          );
          if (result === "COMPLETED") {
            setStatus("completed");
            clearCart();
            toast.success("Paiement confirmé !");
          } else {
            setStatus("failed");
            setError("Paiement refusé ou annulé. Veuillez réessayer.");
          }
        } catch (pollErr: unknown) {
          if ((pollErr as Error)?.message === "Polling annulé") return;
          setStatus("failed");
          setError(
            pollErr instanceof Error
              ? pollErr.message
              : "Erreur lors de la confirmation.",
          );
        }
      } catch (err: unknown) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "Erreur PawaPay.");
      }
      // ── Dans handleSubmit, bloc card — REMPLACE le try/catch entier
    } else {
      if (!cardName) return setError("Nom sur la carte requis.");
      if (!billingCountry) return setError("Pays de facturation requis.");

      setStatus("processing");

      try {
        const data = await callCheckout({
          email,
          name: cardName,
          items,
          paymentMethod: "card",
          billingCountry,
          country: billingCountry,
        });

        if (data.provider !== "stripe") throw new Error("Réponse inattendue.");

        // Stocker clientSecret → affiche Stripe Elements
        setClientSecret(data.clientSecret);
        setPaymentId(data.paymentId);
        setStatus("idle"); // ✅ retour idle pour que Elements s'affiche
      } catch (err: unknown) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "Erreur Stripe.");
      }
    }
  };

  const isProcessing = status === "processing";
  const canSubmit =
    email &&
    (paymentMethod === "mobile_money"
      ? msisdn && operator
      : cardName && billingCountry);

  // ── Empty cart ──
  if (itemCount === 0 && status !== "completed") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-white">
        <Header />
        <main className="grow flex items-center justify-center pt-20 px-4">
          <div className="text-center bg-[#111] p-12 rounded-3xl border border-neutral-800 shadow-2xl">
            <h1 className="text-3xl font-bold mb-4 font-display">
              Votre panier est vide
            </h1>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Ajoutez des articles pour passer à la caisse.
            </p>
            <button
              onClick={() => navigate({ to: "/store" })}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all"
            >
              Parcourir la Boutique
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Success ──
  if (status === "completed") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-white">
        <Header />
        <main className="grow flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white font-display">
                Paiement réussi !
              </h2>
              <p className="text-neutral-400">Un reçu a été envoyé à {email}</p>
              <p className="text-neutral-600 text-xs font-mono">
                {transactionId}
              </p>
              <button
                onClick={() => navigate({ to: "/" })}
                className="mt-4 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all"
              >
                Retour à l'accueil
              </button>
            </motion.div>

            {/* ── Don ── */}
            <DonationForm email={email} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Polling ──
  if (status === "polling") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-white">
        <Header />
        <main className="grow flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-sm">
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 border-4 border-neutral-800 border-t-amber-500 rounded-full animate-spin" />
              {paymentMethod === "mobile_money" ? (
                <Smartphone className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              ) : (
                <CreditCard className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {paymentMethod === "mobile_money"
                  ? "Validez sur votre téléphone"
                  : "Traitement en cours…"}
              </h3>
              <p className="text-neutral-400 text-sm">
                {paymentMethod === "mobile_money"
                  ? `Message envoyé au ${buildFullMsisdn(msisdn)}. Entrez votre code PIN.`
                  : "Votre paiement est en cours de traitement."}
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700 text-neutral-400 text-sm animate-pulse">
              En attente de confirmation…
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout layout ──
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />

      <main className="grow pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate({ to: -1 as any })}
            className="mb-8 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <h1 className="text-4xl md:text-5xl font-bold mb-10 font-display tracking-tight text-white">
            Paiement
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* ── Left: Payment form ─────────────────────────────────────── */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-[#111] rounded-2xl border border-neutral-800 shadow-xl overflow-hidden"
              >
                {/* Method toggle */}
                <div className="p-5 border-b border-neutral-800">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
                    {(
                      [
                        {
                          id: "mobile_money" as PaymentMethod,
                          label: "Mobile Money",
                          icon: Smartphone,
                        },
                        {
                          id: "card" as PaymentMethod,
                          label: "Carte bancaire",
                          icon: CreditCard,
                        },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        disabled={isProcessing}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${paymentMethod === id ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Dans la section du formulaire, après le toggle de méthode */}
                {clientSecret && paymentMethod === "card" ? (
                  <div className="p-5">
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "night",
                          variables: { colorPrimary: "#f59e0b" },
                        },
                      }}
                    >
                      <StripePaymentForm
                        paymentId={paymentId!}
                        email={email}
                        cardName={cardName}
                        billingCountry={billingCountry}
                        onSuccess={() => {
                          setStatus("completed");
                          setTransactionId(paymentId);
                          clearCart();
                          toast.success("Paiement confirmé !");
                        }}
                        onError={(msg) => {
                          setStatus("failed");
                          setError(msg);
                          setClientSecret(null); // reset pour pouvoir réessayer
                        }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {/* Email */}
                    <Field
                      label="Adresse e-mail"
                      icon={<Mail className="w-3.5 h-3.5" />}
                    >
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isProcessing}
                        className={inputCls}
                      />
                    </Field>

                    <AnimatePresence mode="wait">
                      {paymentMethod === "mobile_money" ? (
                        <motion.div
                          key="mobile"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-4"
                        >
                          {/* Country */}
                          <Field
                            label="Pays"
                            icon={<Globe className="w-3.5 h-3.5" />}
                          >
                            <CountryDropdown
                              options={pawapayOptions}
                              value={country}
                              onChange={setCountry}
                              disabled={isProcessing}
                              showCurrency
                            />
                          </Field>
                          {/* Phone */}
                          <Field label="Numéro Mobile Money">
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                <span className="text-sm text-neutral-400 font-mono">
                                  {countryData.dialCode}
                                </span>
                                <div className="w-px h-4 bg-neutral-700" />
                              </div>
                              <input
                                type="tel"
                                placeholder={countryData.phonePlaceholder.replace(
                                  countryData.dialCode + " ",
                                  "",
                                )}
                                value={msisdn}
                                onChange={(e) => setMsisdn(e.target.value)}
                                required
                                disabled={isProcessing}
                                className={`${inputCls} pl-18`}
                              />
                            </div>
                          </Field>
                          {/* Operator */}
                          <Field label="Opérateur">
                            <div className="grid grid-cols-2 gap-2">
                              {countryData.operators.map((op) => (
                                <button
                                  key={op.code}
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => setOperator(op.code)}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left disabled:opacity-50 ${operator === op.code ? "border-neutral-500 bg-neutral-800 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"}`}
                                >
                                  <span className="text-base leading-none">
                                    {op.logo}
                                  </span>
                                  <span className="truncate">{op.name}</span>
                                  {operator === op.code && (
                                    <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0 text-emerald-500" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </Field>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="card"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-4"
                        >
                          <Field label="Nom complet">
                            <input
                              type="text"
                              placeholder="ELIKIA NEYA"
                              value={cardName}
                              onChange={(e) =>
                                setCardName(e.target.value.toUpperCase())
                              }
                              disabled={isProcessing}
                              className={inputCls}
                            />
                          </Field>
                          <Field
                            label="Pays de facturation"
                            icon={<Globe className="w-3.5 h-3.5" />}
                          >
                            <CountryDropdown
                              options={WORLD_COUNTRIES}
                              value={billingCountry}
                              onChange={setBillingCountry}
                              disabled={isProcessing}
                              placeholder="Sélectionner un pays…"
                            />
                          </Field>
                          <p className="flex items-center gap-2 text-xs text-neutral-600">
                            <span>🔒</span> Les informations de carte sont
                            saisies directement via Stripe.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 flex gap-2.5 text-sm text-neutral-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                            <p>{error}</p>
                          </div>
                          {status === "failed" && (
                            <button
                              type="button"
                              onClick={() => {
                                setStatus("idle");
                                setError(null);
                              }}
                              className="mt-2 w-full py-2 rounded-xl border border-neutral-700 text-neutral-400 text-sm hover:text-white hover:border-neutral-500 transition-colors"
                            >
                              Réessayer
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {status !== "failed" && !clientSecret && (
                  <div className="px-5 pb-5">
                    <button
                      type="submit"
                      disabled={isProcessing || !canSubmit || itemCount === 0}
                      className="w-full py-3.5 rounded-xl bg-amber-500 ..."
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          Initialisation…
                        </>
                      ) : (
                        `Payer ${formatCurrency(subtotal, defaultCurrency)}`
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* ── Right: Order summary ───────────────────────────────────── */}
            <div className="lg:col-span-5">
              <div className="bg-[#111] rounded-2xl border border-neutral-800 shadow-xl sticky top-28">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                  <h2 className="text-base font-semibold text-white">
                    Récapitulatif
                  </h2>
                  <button
                    onClick={() => {
                      clearCart();
                      toast.info("Panier vidé");
                    }}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-600 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Vider
                  </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-neutral-800/60 max-h-[50vh] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex gap-3 items-start group"
                    >
                      {/* Thumbnail */}
                      {item.coverUrl && (
                        <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-neutral-800 group-hover:border-neutral-600 transition-colors">
                          {isResilience(item.title) ? (
                            <VideoAssetDisplay
                              videoUrl={FAKE_VIDEO_URL}
                              posterUrl={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {item.title}
                        </p>
                        {item.variantTitle && (
                          <p className="text-xs text-neutral-500 uppercase tracking-widest truncate">
                            {item.variantTitle}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-neutral-500 font-mono">
                            {formatCurrency(item.priceInCents, item.currency)}
                          </span>
                          {item.quantity > 1 && (
                            <>
                              <span className="text-xs text-neutral-700">
                                ×
                              </span>
                              <span className="text-xs text-neutral-500 font-mono">
                                {item.quantity}
                              </span>
                              <span className="text-xs text-neutral-700">
                                =
                              </span>
                              <span className="text-xs text-amber-400 font-mono font-semibold">
                                {formatCurrency(
                                  item.priceInCents * item.quantity,
                                  item.currency,
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: total + remove */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-bold text-amber-400 font-mono whitespace-nowrap">
                          {formatCurrency(
                            item.priceInCents * item.quantity,
                            item.currency,
                          )}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.title)}
                          className="text-[11px] text-neutral-600 hover:text-neutral-300 border border-neutral-800 hover:border-neutral-600 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                        >
                          <X className="w-2.5 h-2.5" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="px-6 py-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-amber-400 font-mono tracking-tight">
                      {formatCurrency(subtotal, defaultCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
