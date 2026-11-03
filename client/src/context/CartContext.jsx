import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null); // which user's cart is loaded

  const storageKey = user ? `cart_${user._id}` : null;

  // Load the cart when a buyer logs in. Clear it when nobody is logged in.
  useEffect(() => {
    if (loading) return;
    if (user && user.role === "buyer") {
      try {
        const saved = JSON.parse(localStorage.getItem(`cart_${user._id}`));
        setCart(Array.isArray(saved) ? saved : []);
      } catch {
        setCart([]);
      }
      setLoadedFor(user._id);
    } else {
      setCart([]);
      setLoadedFor(null);
    }
  }, [user, loading]);

  // Save the cart in the browser when it changes
  useEffect(() => {
    if (user && loadedFor === user._id) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, user, loadedFor, storageKey]);

  // Add fish. Quantity can never be more than the stock.
  const addToCart = (fish, quantity = 1) => {
    const existing = cart.find((i) => i.fishId === fish._id);
    const current = existing ? existing.quantity : 0;

    if (fish.stock <= 0) return { ok: false, message: "This fish is out of stock" };
    if (current >= fish.stock) return { ok: false, message: `Only ${fish.stock} in stock, you already have all of them` };

    const newQty = Math.min(current + quantity, fish.stock);
    const item = {
      fishId: fish._id,
      name: fish.name,
      price: fish.price,
      image: fish.image,
      stock: fish.stock,
      quantity: newQty,
    };

    setCart((old) => (existing ? old.map((i) => (i.fishId === fish._id ? item : i)) : [...old, item]));

    const limited = current + quantity > fish.stock;
    return { ok: true, message: limited ? `Added. Only ${fish.stock} available, so quantity was limited.` : "Added to cart" };
  };

  const updateQuantity = (fishId, quantity) => {
    setCart((old) =>
      old.map((i) => (i.fishId === fishId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
    );
  };

  const removeFromCart = (fishId) => setCart((old) => old.filter((i) => i.fishId !== fishId));

  const clearCart = () => setCart([]);

  // Update cart items with fresh data from the server (price, stock).
  // Removes fish that no longer exist or are out of stock. Used on the Cart page.
  const syncCart = (freshFishList) => {
    setCart((old) =>
      old
        .map((item) => {
          const fresh = freshFishList.find((f) => f._id === item.fishId);
          if (!fresh || fresh.stock <= 0) return null;
          return {
            ...item,
            name: fresh.name,
            price: fresh.price,
            image: fresh.image,
            stock: fresh.stock,
            quantity: Math.min(item.quantity, fresh.stock),
          };
        })
        .filter(Boolean)
    );
  };

  // Display only. The server calculates the real total again when ordering.
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
        <CartContext.Provider
      value={{
        cart, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, syncCart,
        cartReady: !!user && loadedFor === user._id, // true when the saved cart has loaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Use this in any component: const { cart, addToCart } = useCart();
export const useCart = () => useContext(CartContext);