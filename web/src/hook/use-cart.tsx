import { useCallback, useEffect, useState } from "react";
import type { Product } from "#/types/product";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

const STORAGE_KEY = "laila_cart";

const persist = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

const hydrate = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

let _state: CartItem[] = hydrate();
const _listeners = new Set<() => void>();

const getState = () => _state;
const setState = (items: CartItem[]) => {
  _state = items;
  persist(items);
  _listeners.forEach((cb) => cb());
};

export const useCart = () => {
  const [, rerender] = useState(0);

  useEffect(() => {
    const cb = () => rerender((n) => n + 1);
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const prev = getState();
    const idx = prev.findIndex((i) => i.id === product.id);
    setState(
      idx >= 0
        ? prev.map((i, n) =>
            n === idx ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [
            ...prev,
            { id: product.id, product, quantity, price: product.price },
          ],
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState(getState().filter((i) => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setState(
      getState().map((i) => (i.id === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setState([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getCartTotal = useCallback(
    () => getState().reduce((sum, i) => sum + i.price * i.quantity, 0),
    [],
  );

  const cartItems = getState();

  return {
    cartItems,
    cartCount: cartItems.reduce((s, i) => s + i.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };
};
