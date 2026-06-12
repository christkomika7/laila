import Footer from "#/components/footer";
import Header from "#/components/header";
import { DonationForm } from "#/components/payment/donation";
import { StripePaymentForm } from "#/components/payment/stripe-payment";
import VideoAssetDisplay from "#/components/ui/video-asset-display";
import { callCheckout, isResilience, pollPaymentStatus } from "#/lib/helpers";
import { stripePromise } from "#/lib/payment";
import { useCartStore } from "#/store/use-cart-store";
import { Elements } from "@stripe/react-stripe-js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Input } from "#/components/ui/input";
import { PurchaseSummary } from "#/components/payment/purchase-summary";
import { useCheckoutSuccessStore } from "#/store/use-checkout-store";
import { PAWAPAY_COUNTRIES, WORLD_COUNTRIES } from "#/lib/data";
import type { PaymentMethod, Status } from "#/types/checkout";
import { Field } from "#/components/ui/field";
import { CountryDropdown } from "#/components/ui/country-dropdown";
import { formatCurrency } from "#/lib/utils";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/(public)/checkout")({
  head: () => ({
    title: "Paiement - Laïla",
    meta: [{ name: "description", content: "Paiement" }],
  }),
  component: RouteComponent,
});

const FAKE_VIDEO_URL =
  "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4";

const inputCls =
  "w-full h-11 px-4 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 transition-colors hover:border-neutral-600";

function RouteComponent() {
  const navigate = useNavigate();

  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;

  const cartItems = useCartStore.use.items();
  const subtotal = useCartStore.use.subtotal()();
  const itemCount = useCartStore.use.itemCount()();
  const removeItem = useCartStore.use.removeItem();
  const clearCart = useCartStore.use.clearCart();

  const defaultCurrency = cartItems[0]?.currency ?? "XAF";

  // Payment form state
  const [email, setEmail] = useState(sessionUser?.email ?? "");
  const [username, setUsername] = useState(sessionUser?.name ?? "");
  const [cardName, setCardName] = useState(
    sessionUser?.name?.toUpperCase() ?? "",
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mobile_money");

  // Mobile money
  const [country, setCountry] = useState("COG");
  const [operator, setOperator] = useState("");
  const [msisdn, setMsisdn] = useState("");
  // Card
  const [billingCountry, setBillingCountry] = useState("");

  // Store
  const isCompleted = useCheckoutSuccessStore.use.isCompleted();
  const successEmail = useCheckoutSuccessStore.use.email();
  const successOrderId = useCheckoutSuccessStore.use.orderId();
  const successTransactionId = useCheckoutSuccessStore.use.transactionId();
  const setSuccess = useCheckoutSuccessStore.use.setSuccess();
  const clearSuccess = useCheckoutSuccessStore.use.clearSuccess();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(
    isCompleted ? "completed" : "idle",
  );
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

  useEffect(() => {
    if (sessionUser) {
      setCardName(sessionUser?.name?.toUpperCase() ?? "");
      setEmail(sessionUser?.email ?? "");
      setUsername(sessionUser?.name ?? "");
    }
  }, [sessionUser]);

  const handleRemoveItem = (id: string, title: string) => {
    removeItem(id);
    toast.info(`« ${title} » retiré du panier`);
  };

  const buildFullMsisdn = (raw: string): string => {
    const cleaned = raw.replace(/\s/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
    return countryData.dialCode + cleaned;
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
          name: username,
          items,
          paymentMethod: "mobile_money",
          msisdn: fullPhone,
          correspondent: operator,
          country,
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
            setSuccess({
              email,
              orderId: data.orderId ?? null,
              transactionId: data.depositId,
            });
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

        setClientSecret(data.clientSecret);
        setPaymentId(data.paymentId);
        setOrderId(data.orderId);
        setStatus("idle");
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
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-md transition-all"
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
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col gap-y-4 text-white">
        <Header />
        <div className="w-full mt-10" />
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
              <p className="text-neutral-400">
                Un reçu a été envoyé à {successEmail}
              </p>
              <p className="text-neutral-600 text-xs font-mono">
                {successTransactionId}
              </p>
              <button
                onClick={() => {
                  clearSuccess();
                  navigate({ to: "/" });
                }}
                className="mt-4 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-md transition-all"
              >
                Retour à l'accueil
              </button>
            </motion.div>

            {/* ── Achats musicaux + téléchargement ── */}
            <PurchaseSummary orderId={successOrderId} />
            {/* ── Don ── */}
            <DonationForm email={successEmail ?? ""} />
            <div className="flex justify-center">
              <button
                className="mt-4 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-md transition-all"
                onClick={() => {
                  clearSuccess();
                  navigate({ to: "/store" });
                }}
              >
                Terminer
              </button>
            </div>
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
            <div className="px-4 py-3 rounded-md bg-neutral-800/60 border border-neutral-700 text-neutral-400 text-sm animate-pulse">
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
                className="bg-[#111] rounded-lg relative border border-neutral-800 shadow-xl"
              >
                {/* Method toggle */}
                <div className="p-5 border-b border-neutral-800">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-md border border-neutral-800">
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
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm text-sm font-medium transition-all disabled:opacity-50 ${paymentMethod === id ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
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
                        isLoggedIn={!!sessionUser}
                        billingCountry={billingCountry}
                        onSuccess={() => {
                          setStatus("completed");
                          setSuccess({
                            email,
                            orderId,
                            transactionId: transactionId,
                          });
                          setTransactionId(transactionId);
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
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isProcessing || !!sessionUser}
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
                          <Field
                            label="Nom complet"
                            icon={<Mail className="w-3.5 h-3.5" />}
                          >
                            <Input
                              type="text"
                              placeholder="Ex: ELIKIA NEYA"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                              disabled={isProcessing || !!sessionUser}
                              className={inputCls}
                            />
                          </Field>
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
                              <Input
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
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-all text-left disabled:opacity-50 ${operator === op.code ? "border-neutral-500 bg-neutral-800 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"}`}
                                >
                                  <img src={op.logo} className="size-6" />
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
                            <Input
                              type="text"
                              placeholder="ELIKIA NEYA"
                              value={cardName}
                              onChange={(e) =>
                                setCardName(e.target.value.toUpperCase())
                              }
                              disabled={isProcessing || !!sessionUser}
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
                          <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-700 flex gap-2.5 text-sm text-neutral-300">
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
                              className="mt-2 w-full py-2 rounded-md border border-neutral-700 text-neutral-400 text-sm hover:text-white hover:border-neutral-500 transition-colors"
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
                      className="w-full py-3.5 flex justify-center items-center gap-x-2 rounded-md bg-amber-500 ..."
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
              <div className="bg-[#111] rounded-lg border border-neutral-800 shadow-xl sticky top-28">
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
