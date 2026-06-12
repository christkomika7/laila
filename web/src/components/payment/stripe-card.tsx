import { Globe } from "lucide-react";
import { WorldCountryPicker } from "../ui/word-country-color";

export const StripeCardFields = ({
  disabled,
  cardNumber,
  expiry,
  cvc,
  cardName,
  billingCountry,
  onCardNumber,
  onExpiry,
  onCvc,
  onCardName,
  onBillingCountry,
}: {
  disabled?: boolean;
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardName: string;
  billingCountry: string;
  onCardNumber: (v: string) => void;
  onExpiry: (v: string) => void;
  onCvc: (v: string) => void;
  onCardName: (v: string) => void;
  onBillingCountry: (v: string) => void;
}) => {
  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Nom sur la carte
        </label>
        <input
          type="text"
          placeholder="JEAN DUPONT"
          value={cardName}
          onChange={(e) => onCardName(e.target.value.toUpperCase())}
          disabled={disabled}
          className="w-full h-12 px-4 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 transition-colors hover:border-neutral-600"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Numéro de carte
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => onCardNumber(formatCardNumber(e.target.value))}
            disabled={disabled}
            className="w-full h-12 pl-4 pr-12 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 transition-colors hover:border-neutral-600"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-40">
            <span className="text-base">💳</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Expiration
          </label>
          <input
            type="text"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => onExpiry(formatExpiry(e.target.value))}
            disabled={disabled}
            className="w-full h-12 px-4 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 transition-colors hover:border-neutral-600"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            CVC
          </label>
          <input
            type="text"
            placeholder="123"
            value={cvc}
            onChange={(e) =>
              onCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            disabled={disabled}
            className="w-full h-12 px-4 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 transition-colors hover:border-neutral-600"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> Pays de facturation
        </label>
        <WorldCountryPicker
          value={billingCountry}
          onChange={onBillingCountry}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
