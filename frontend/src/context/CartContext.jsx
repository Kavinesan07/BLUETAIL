import { createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "bluetail_cart";


function readStoredCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  // Save the cart every time it changes, so it survives a page refresh
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((current) => {
      const found = current.find((i) => i.id === product.id);
      if (found) {
        return current.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...current,
        { id: product.id, name: product.name, price: product.price, image_url: product.image_url, qty },
      ];
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      setQty,
      removeItem,
      clear,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      total: items.reduce((sum, i) => sum + i.qty * i.price, 0),
    }),
    [items, addItem, setQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}