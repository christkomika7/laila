import apiServerClient from "#/lib/api";
import { stripePromise } from "#/lib/payment";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { CreditCard, Heart, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

// Opérateurs Congo par défaut — à étendre si besoin
const MOMO_OPERATORS = [
  { code: "MTN_MOMO_COG", name: "MTN MoMo", dialCode: "+242" },
  { code: "AIRTEL_COG", name: "Airtel Money", dialCode: "+242" },
];

function DonationStripeForm({
  donationId,
  email,
  onSuccess,
  onError,
}: {
  donationId: string;
  email: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message ?? "Erreur");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { receipt_email: email },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Refusé");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
      return;
    }

    // Poll
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await apiServerClient.fetch(
          `/donations/${donationId}/status`,
        );
        if (res.ok) {
          const { status } = await res.json();
          if (status === "COMPLETED") {
            clearInterval(interval);
            onSuccess();
          }
          if (status === "FAILED") {
            clearInterval(interval);
            onError("Don refusé.");
          }
        }
      } catch {}
      if (attempts >= 20) {
        clearInterval(interval);
        onError("Délai dépassé.");
      }
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <PaymentElement onReady={() => setReady(true)} />
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading || !ready}
        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" /> Confirmer le don
          </>
        )}
      </button>
    </div>
  );
}

export function DonationForm({ email }: { email: string }) {
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">(
    "card",
  );
  const [msisdn, setMsisdn] = useState("");
  const [operator, setOperator] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = amount !== "" ? amount : parseInt(customAmount) || 0;

  const handleInitiate = async () => {
    if (finalAmount < 500) {
      setError("Montant minimum : 500 XAF");
      return;
    }
    if (paymentMethod === "mobile_money" && (!msisdn || !operator)) {
      setError("Numéro et opérateur requis.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await apiServerClient.fetch("/donations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: finalAmount,
          currency: "XAF",
          paymentMethod,
          ...(paymentMethod === "mobile_money" && {
            msisdn: msisdn.replace(/\s/g, ""),
            correspondent: operator,
            country: "COG",
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.provider === "stripe") {
        setClientSecret(data.clientSecret);
        setDonationId(data.donationId);
      } else {
        // PawaPay — démarrer le polling
        setDonationId(data.donationId);
        setPolling(true);
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const r = await apiServerClient.fetch(
              `/donations/${data.donationId}/status`,
            );
            if (r.ok) {
              const { status } = await r.json();
              if (status === "COMPLETED") {
                clearInterval(interval);
                setPolling(false);
                setSuccess(true);
              }
              if (status === "FAILED") {
                clearInterval(interval);
                setPolling(false);
                setError("Don refusé. Veuillez réessayer.");
              }
            }
          } catch {}
          if (attempts >= 40) {
            clearInterval(interval);
            setPolling(false);
            setError("Délai dépassé. Vérifiez votre téléphone.");
          }
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-2 py-4">
        <Heart className="w-10 h-10 text-emerald-500 mx-auto" />
        <p className="text-white font-semibold">Merci pour votre don ! 💚</p>
      </div>
    );
  }

  if (polling) {
    return (
      <div className="text-center space-y-3 py-4">
        <Loader2 className="w-8 h-8 text-emerald-500 mx-auto animate-spin" />
        <p className="text-white font-semibold">Validez sur votre téléphone</p>
        <p className="text-neutral-400 text-sm">
          Entrez votre code PIN MoMo pour confirmer le don.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-4">
      <div className="text-center">
        <Heart className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
        <h3 className="text-white font-semibold">Faire un don</h3>
        <p className="text-neutral-400 text-sm">
          Soutenez Laïla avec le montant de votre choix
        </p>
      </div>

      {!clientSecret ? (
        <>
          {/* Montants prédéfinis */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAmount(a);
                  setCustomAmount("");
                }}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  amount === a
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                }`}
              >
                {a.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Montant personnalisé */}
          <div className="relative">
            <Input
              type="number"
              placeholder="Autre montant (XAF)"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount("");
              }}
              className="w-full h-11 px-4 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
              XAF
            </span>
          </div>

          {/* Méthode de paiement */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            {[
              { id: "card" as const, label: "Carte", icon: CreditCard },
              {
                id: "mobile_money" as const,
                label: "Mobile Money",
                icon: Smartphone,
              },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPaymentMethod(id)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  paymentMethod === id
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Champs Mobile Money */}
          {paymentMethod === "mobile_money" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {MOMO_OPERATORS.map((op) => (
                  <button
                    key={op.code}
                    type="button"
                    onClick={() => setOperator(op.code)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      operator === op.code
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                    }`}
                  >
                    {op.name}
                  </button>
                ))}
              </div>
              <Input
                type="tel"
                placeholder="242 06 XXX XXXX"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          {error && <p className="text-amber-400 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleInitiate}
            disabled={loading || finalAmount < 500}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Heart className="w-4 h-4" /> Donner{" "}
                {finalAmount > 0 ? `${finalAmount.toLocaleString()} XAF` : ""}
              </>
            )}
          </button>
        </>
      ) : (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "night",
              variables: { colorPrimary: "#10b981" },
            },
          }}
        >
          <DonationStripeForm
            donationId={donationId!}
            email={email}
            onSuccess={() => setSuccess(true)}
            onError={(msg) => {
              setError(msg);
              setClientSecret(null);
            }}
          />
        </Elements>
      )}
    </div>
  );
}
