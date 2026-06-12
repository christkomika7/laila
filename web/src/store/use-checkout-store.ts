import { createSelectors } from "#/lib/store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CheckoutSuccessState {
  email: string | null;
  orderId: string | null;
  transactionId: string | null;
  isCompleted: boolean;
}

type CheckoutSuccessStore = CheckoutSuccessState & {
  setSuccess: (payload: {
    email: string;
    orderId: string | null;
    transactionId: string | null;
  }) => void;
  clearSuccess: () => void;
};

const INITIAL_STATE: CheckoutSuccessState = {
  email: null,
  orderId: null,
  transactionId: null,
  isCompleted: false,
};

export const useCheckoutSuccessStore = createSelectors(
  create<CheckoutSuccessStore>()(
    persist(
      (set) => ({
        ...INITIAL_STATE,

        setSuccess: ({ email, orderId, transactionId }) =>
          set({ email, orderId, transactionId, isCompleted: true }),

        clearSuccess: () => set(INITIAL_STATE),
      }),
      {
        name: "checkout-success",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);
