import MTN from "#/assets/mtn-new-logo.svg";
import Airtel from "#/assets/bharti-airtel-limited.svg";
import Orange from "#/assets/orange-3.svg";
import Wave from "#/assets/wave.png";
import Moov from "#/assets/logo-moov-money.png";
import Free from "#/assets/69bbe853f53519cb6c894c2e_66c2529c9bd2cc5c76811926_logo.webp";
import Vodafone from "#/assets/Vodafone_Logo.svg.png";

export const PAWAPAY_COUNTRIES: Record<
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
      { code: "AIRTEL_COG", name: "Airtel Money", logo: Airtel },
      { code: "MTN_MOMO_COG", name: "MTN Mobile Money", logo: MTN },
    ],
  },

  CMR: {
    name: "Cameroun",
    flag: "🇨🇲",
    currency: "XAF",
    dialCode: "+237",
    phonePlaceholder: "+237 6XX XXX XXX",
    operators: [
      { code: "MTN_MOMO_CMR", name: "MTN Mobile Money", logo: MTN },
      { code: "ORANGE_CMR", name: "Orange Money", logo: Orange },
    ],
  },

  CIV: {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: "XOF",
    dialCode: "+225",
    phonePlaceholder: "+225 07 XX XX XX XX",
    operators: [
      { code: "ORANGE_CIV", name: "Orange Money", logo: Orange },
      { code: "MTN_MOMO_CIV", name: "MTN Mobile Money", logo: MTN },
      { code: "WAVE_CIV", name: "Wave", logo: Wave },
    ],
  },

  SEN: {
    name: "Sénégal",
    flag: "🇸🇳",
    currency: "XOF",
    dialCode: "+221",
    phonePlaceholder: "+221 7X XXX XX XX",
    operators: [
      { code: "ORANGE_SEN", name: "Orange Money", logo: Orange },
      { code: "FREE_SEN", name: "Free Money", logo: Free },
      { code: "WAVE_SEN", name: "Wave", logo: Wave },
    ],
  },

  GHA: {
    name: "Ghana",
    flag: "🇬🇭",
    currency: "GHS",
    dialCode: "+233",
    phonePlaceholder: "+233 24 XXX XXXX",
    operators: [
      { code: "MTN_MOMO_GHA", name: "MTN Mobile Money", logo: MTN },
      { code: "VODAFONE_GHA", name: "Vodafone Cash", logo: Vodafone },
      { code: "AIRTELTIGO_GHA", name: "AirtelTigo Money", logo: Airtel },
    ],
  },

  NGA: {
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    dialCode: "+234",
    phonePlaceholder: "+234 80X XXX XXXX",
    operators: [
      { code: "MTN_MOMO_NGA", name: "MTN MoMo", logo: MTN },
      { code: "AIRTEL_NGA", name: "Airtel Money", logo: Airtel },
    ],
  },

  KEN: {
    name: "Kenya",
    flag: "🇰🇪",
    currency: "KES",
    dialCode: "+254",
    phonePlaceholder: "+254 7XX XXX XXX",
    operators: [{ code: "MPESA_KEN", name: "M-Pesa", logo: "🟢" }],
  },

  TZA: {
    name: "Tanzanie",
    flag: "🇹🇿",
    currency: "TZS",
    dialCode: "+255",
    phonePlaceholder: "+255 7XX XXX XXX",
    operators: [
      { code: "VODACOM_TZA", name: "M-Pesa (Vodacom)", logo: "🟢" },
      { code: "TIGO_TZA", name: "Tigo Pesa", logo: "🔵" },
      { code: "AIRTEL_TZA", name: "Airtel Money", logo: Airtel },
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
      { code: "MTN_MOMO_UGA", name: "MTN Mobile Money", logo: MTN },
      { code: "AIRTEL_OAPI_UGA", name: "Airtel Money", logo: Airtel },
    ],
  },

  ZMB: {
    name: "Zambie",
    flag: "🇿🇲",
    currency: "ZMW",
    dialCode: "+260",
    phonePlaceholder: "+260 9X XXX XXXX",
    operators: [
      { code: "MTN_MOMO_ZMB", name: "MTN Mobile Money", logo: MTN },
      { code: "AIRTEL_OAPI_ZMB", name: "Airtel Money", logo: Airtel },
      { code: "ZAMTEL_ZMB", name: "Zamtel Kwacha", logo: "🟢" },
    ],
  },

  MOZ: {
    name: "Mozambique",
    flag: "🇲🇿",
    currency: "MZN",
    dialCode: "+258",
    phonePlaceholder: "+258 8X XXX XXXX",
    operators: [
      { code: "VODACOM_MOZ", name: "M-Pesa (Vodacom)", logo: "🟢" },
      { code: "MOVITEL_MOZ", name: "eMola (Movitel)", logo: "🔵" },
    ],
  },

  BFA: {
    name: "Burkina Faso",
    flag: "🇧🇫",
    currency: "XOF",
    dialCode: "+226",
    phonePlaceholder: "+226 6X XX XX XX",
    operators: [
      { code: "ORANGE_BFA", name: "Orange Money", logo: Orange },
      { code: "MOOV_BFA", name: "Moov Money", logo: Moov },
    ],
  },

  BEN: {
    name: "Bénin",
    flag: "🇧🇯",
    currency: "XOF",
    dialCode: "+229",
    phonePlaceholder: "+229 9X XX XX XX",
    operators: [
      { code: "MTN_MOMO_BEN", name: "MTN Mobile Money", logo: MTN },
      { code: "MOOV_BEN", name: "Moov Money", logo: Moov },
    ],
  },

  RWA: {
    name: "Rwanda",
    flag: "🇷🇼",
    currency: "RWF",
    dialCode: "+250",
    phonePlaceholder: "+250 7XX XXX XXX",
    operators: [
      { code: "MTN_MOMO_RWA", name: "MTN Mobile Money", logo: MTN },
      { code: "AIRTEL_RWA", name: "Airtel Money", logo: Airtel },
    ],
  },

  GAB: {
    name: "Gabon",
    flag: "🇬🇦",
    currency: "XAF",
    dialCode: "+241",
    phonePlaceholder: "+241 0X XX XX XX",
    operators: [{ code: "AIRTEL_GAB", name: "Airtel Money", logo: Airtel }],
  },

  SLE: {
    name: "Sierra Leone",
    flag: "🇸🇱",
    currency: "SLL",
    dialCode: "+232",
    phonePlaceholder: "+232 7X XXX XXX",
    operators: [{ code: "ORANGE_SLE", name: "Orange Money", logo: Orange }],
  },

  COD: {
    name: "RD Congo",
    flag: "🇨🇩",
    currency: "CDF",
    dialCode: "+243",
    phonePlaceholder: "+243 8X XXX XXXX",
    operators: [
      { code: "AIRTEL_COD", name: "Airtel Money", logo: Airtel },
      { code: "VODACOM_MPESA_COD", name: "M-Pesa (Vodacom)", logo: "🟢" },
      { code: "ORANGE_COD", name: "Orange Money", logo: Orange },
    ],
  },

  ETH: {
    name: "Éthiopie",
    flag: "🇪🇹",
    currency: "ETB",
    dialCode: "+251",
    phonePlaceholder: "+251 9X XXX XXXX",
    operators: [{ code: "MPESA_ETH", name: "M-Pesa (Safaricom)", logo: "🔵" }],
  },
};

export const WORLD_COUNTRIES: { code: string; name: string; flag: string }[] = [
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
