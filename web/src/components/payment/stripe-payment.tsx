import { pollPaymentStatus } from "#/lib/helpers";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function StripePaymentForm({
  paymentId,
  email,
  cardName,
  billingCountry,
  onSuccess,
  onError,
}: {
  paymentId: string;
  email: string;
  cardName: string;
  billingCountry: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) {
      onError("Stripe non initialisé, veuillez patienter.");
      return;
    }

    setLoading(true);

    // Forcer la validation du formulaire Stripe avant confirmation
    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message ?? "Erreur de validation.");
      setLoading(false);
      return;
    }
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: email,
        payment_method_data: {
          billing_details: {
            name: cardName,
            address: { country: billingCountry },
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      console.error("[stripe] confirmPayment error:", error);
      onError(error.message ?? "Paiement refusé.");
      setLoading(false);
      return;
    }

    console.log("[stripe] paymentIntent status:", paymentIntent?.status);

    // Si succeeded immédiatement (cas test sans 3DS)
    if (paymentIntent?.status === "succeeded") {
      onSuccess();
      return;
    }

    // Sinon on poll en attendant le webhook
    const abortController = new AbortController();
    try {
      const result = await pollPaymentStatus(paymentId, abortController.signal);
      if (result === "COMPLETED") {
        onSuccess();
      } else {
        onError("Paiement refusé. Vérifiez vos informations.");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erreur de confirmation.");
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement
        onReady={() => setStripeReady(true)}
        options={{
          layout: "tabs",
        }}
      />
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading || !stripe || !stripeReady}
        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2.5"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Confirmation…
          </>
        ) : !stripeReady ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
          </>
        ) : (
          "Confirmer le paiement"
        )}
      </button>
    </div>
  );
}
