import { PAWAPAY_COUNTRIES } from "#/lib/data";
import { formatCurrency } from "#/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CountryPicker } from "../ui/country-picker";
import { StripeCardFields } from "../payment/stripe-card";

const fakePawaPay = (_payload: unknown): Promise<{ depositId: string }> =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ depositId: "PAWA-" + Date.now() }), 2000),
  );

const fakeStripe = (_payload: unknown): Promise<{ paymentIntentId: string }> =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ paymentIntentId: "pi_" + Date.now() }), 2000),
  );

export interface CartItem {
  id: string;
  type: "album" | "track";
  title: string;
  price: number;
}

interface PaymentFormProps {
  amount: number;
  albumId?: string;
  trackId?: string;
  cartItems?: CartItem[];
  onSuccess?: (transactionId: string) => void;
}

type PaymentMethod = "mobile_money" | "card";
type Status = "idle" | "processing" | "polling" | "completed" | "failed";

const PaymentForm = ({
  amount,
  albumId,
  trackId,
  cartItems = [],
  onSuccess,
}: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mobile_money");
  const [country, setCountry] = useState("COG");
  const [email, setEmail] = useState("");
  const [operator, setOperator] = useState("");
  const [msisdn, setMsisdn] = useState("");
  // Stripe fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const countryData = PAWAPAY_COUNTRIES[country] ?? PAWAPAY_COUNTRIES.COG;
  const amountDisplay = formatCurrency(amount, countryData.currency);

  useEffect(() => {
    setOperator("");
    setMsisdn("");
  }, [country]);

  useEffect(() => {
    if (status !== "polling" || !transactionId) return;
    const timer = setTimeout(() => {
      setStatus("completed");
      setTimeout(() => onSuccess?.(transactionId), 1500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, transactionId, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email)
      return setError("L'adresse e-mail est requise pour votre reçu.");

    if (paymentMethod === "mobile_money") {
      if (!operator) return setError("Sélectionnez un opérateur mobile.");
      let phone = msisdn.replace(/\s/g, "");
      if (!phone.startsWith("+")) phone = countryData.dialCode + phone;
      if (phone.length < 10)
        return setError(
          `Numéro invalide. Inclure le code pays (ex: ${countryData.dialCode}…).`,
        );

      setStatus("processing");
      try {
        const productTitle =
          cartItems.length > 1
            ? `${cartItems.length} Articles`
            : (cartItems[0]?.title ?? "Achat Boutique");
        const data = await fakePawaPay({
          amount,
          currency: countryData.currency,
          phoneNumber: phone,
          provider: operator,
          productId: cartItems[0]?.id ?? albumId ?? trackId ?? "cart",
          productTitle,
          customerEmail: email,
        });
        setTransactionId(data.depositId);
        setStatus("polling");
      } catch (err: unknown) {
        setStatus("failed");
        setError(
          err instanceof Error ? err.message : "Erreur lors de l'initiation.",
        );
      }
    } else {
      // Stripe card
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16)
        return setError("Numéro de carte incomplet.");
      if (!expiry || expiry.length < 5)
        return setError("Date d'expiration invalide.");
      if (!cvc || cvc.length < 3) return setError("Code CVC invalide.");
      if (!cardName) return setError("Le nom sur la carte est requis.");
      if (!billingCountry)
        return setError("Le pays de facturation est requis.");

      setStatus("processing");
      try {
        const data = await fakeStripe({
          amount,
          currency: "eur",
          cardNumber: cardNumber.replace(/\s/g, ""),
          email,
          billingDetails: {
            name: cardName,
            email,
            address: { country: billingCountry },
          },
        });
        setTransactionId(data.paymentIntentId);
        setStatus("polling");
      } catch (err: unknown) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "Erreur Stripe.");
      }
    }
  };

  if (status === "polling") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-6 min-h-[320px]"
      >
        <div className="relative">
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
          <p className="text-neutral-400 text-sm max-w-xs mx-auto">
            {paymentMethod === "mobile_money"
              ? `Un message a été envoyé au ${msisdn}. Entrez votre code PIN pour confirmer.`
              : "Votre paiement est en cours de traitement. Merci de patienter."}
          </p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700 text-neutral-400 text-sm animate-pulse">
          En attente de confirmation…
        </div>
      </motion.div>
    );
  }

  if (status === "completed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[320px]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <CheckCircle2 className="w-20 h-20 text-emerald-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white">Paiement réussi !</h3>
        <p className="text-neutral-400 text-sm">
          Un reçu a été envoyé à {email}
        </p>
        <p className="text-neutral-600 text-xs font-mono">{transactionId}</p>
      </motion.div>
    );
  }

  const isProcessing = status === "processing";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              paymentMethod === id
                ? "bg-neutral-700 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            } disabled:opacity-50`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-3.5 h-3.5" /> Adresse e-mail
        </label>
        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isProcessing}
          className="w-full h-12 px-4 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 transition-colors hover:border-neutral-600"
        />
      </div>

      {/* Conditional fields */}
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
            {/* Country picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Pays
              </label>
              <CountryPicker
                value={country}
                onChange={setCountry}
                disabled={isProcessing}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Numéro Mobile Money
              </label>
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
                  className="w-full h-12 pl-18 pr-4 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 transition-colors hover:border-neutral-600"
                />
              </div>
            </div>

            {/* Operator */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Opérateur
              </label>
              <div className="grid grid-cols-2 gap-2">
                {countryData.operators.map((op) => (
                  <button
                    key={op.code}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setOperator(op.code)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      operator === op.code
                        ? "border-neutral-500 bg-neutral-800 text-white"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    } disabled:opacity-50`}
                  >
                    <span className="text-lg leading-none">{op.logo}</span>
                    <span>{op.name}</span>
                    {operator === op.code && (
                      <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            <StripeCardFields
              disabled={isProcessing}
              cardNumber={cardNumber}
              expiry={expiry}
              cvc={cvc}
              cardName={cardName}
              billingCountry={billingCountry}
              onCardNumber={setCardNumber}
              onExpiry={setExpiry}
              onCvc={setCvc}
              onCardName={setCardName}
              onBillingCountry={setBillingCountry}
            />
            <div className="flex items-center gap-2 mt-3 text-xs text-neutral-600">
              <span>🔒</span>
              <span>
                Paiement sécurisé via Stripe. Vos données sont chiffrées.
              </span>
            </div>
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
              <p className="leading-relaxed">{error}</p>
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
      {/* Amount summary — sticky footer */}
      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">
            Total
          </p>
          <p className="text-2xl font-bold font-mono text-white tracking-tight">
            {amountDisplay}
          </p>
        </div>
        {paymentMethod === "card" && (
          <div className="flex gap-1.5 items-center opacity-40">
            <span className="text-2xl">💳</span>
            <span className="text-2xl">🔐</span>
          </div>
        )}
        {paymentMethod === "mobile_money" && operator && (
          <div className="text-right">
            <p className="text-xs text-neutral-500">via</p>
            <p className="text-sm font-medium text-neutral-300">
              {countryData.operators.find((o) => o.code === operator)?.name}
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      {status !== "failed" && (
        <button
          type="submit"
          disabled={
            isProcessing ||
            !email ||
            (paymentMethod === "mobile_money" && (!msisdn || !operator)) ||
            (paymentMethod === "card" &&
              (!cardNumber || !expiry || !cvc || !cardName || !billingCountry))
          }
          className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-500 flex items-center justify-center gap-2.5"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initialisation…
            </>
          ) : (
            `Payer ${amountDisplay}`
          )}
        </button>
      )}
    </form>
  );
};

export default PaymentForm;
