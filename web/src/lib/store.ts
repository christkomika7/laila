export { createStore } from "zustand/vanilla";
export { persist, createJSONStorage } from "zustand/middleware";
import type { StoreApi, UseBoundStore } from "zustand";
import type { StateStorage } from "zustand/middleware";
import { getCookie, setCookie, removeCookie } from "typescript-cookie";

export const cookieStorage: StateStorage = {
  getItem: (name: string) => {
    return getCookie(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    setCookie(name, value, { expires: 1, secure: true });
  },
  removeItem: (name: string) => {
    removeCookie(name);
  },
};

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }
  return store;
};
