import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { imageUrl, formatPrice, FALLBACK_IMAGE } from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Cart() {
  const { cart, cartCount, cartTotal, cartReady, updateQuantity, removeFromCart, syncCart } = useCart();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(true);

  // Get the newest prices and stock from the server
  useEffect(() => {
    api
      .get("/fish")
      .then((res) => syncCart(res.data))
      .catch(() => {})
      .finally(() => setSyncing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!cartReady || syncing) return <Spinner text="Loading your cart..." />;

  if (cart.length === 0) {
    return (
      <div className="page-container text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="section-title mt-4">Your cart is empty</h1>
        <p className="mt-2 text-white/60">Add some beautiful fish to get started.</p>
        <Link to="/fish" className="btn-primary mt-6 px-8 py-3">
          Browse Fish
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => (
            <div key={item.fishId} className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img
                src={imageUrl(item.image)}
                alt={item.name}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                className="h-24 w-full rounded-xl object-cover sm:w-32"
              />

              <div className="flex-1">
                <Link to={`/fish/${item.fishId}`} className="text-lg font-semibold hover:text-aqua-400">
                  {item.name}
                </Link>
                <p className="text-aqua-400">{formatPrice(item.price)}</p>
                <p className="text-xs text-white/50">{item.stock} in stock</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center overflow-hidden rounded-full border border-white/20 bg-white/10">
                  <button onClick={() => updateQuantity(item.fishId, item.quantity - 1)} disabled={item.quantity <= 1} className="px-3 py-1.5 text-lg hover:bg-white/10 disabled:opacity-40" aria-label="Less">
                    −
                  </button>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.fishId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="px-3 py-1.5 text-lg hover:bg-white/10 disabled:opacity-40" aria-label="More">
                    +
                  </button>
                </div>

                <p className="w-28 text-right font-semibold">{formatPrice(item.price * item.quantity)}</p>

                <button onClick={() => removeFromCart(item.fishId)} aria-label={`Remove ${item.name}`} className="text-coral-400 hover:text-coral-500">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="glass-panel h-fit p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="flex justify-between text-white/70">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-aqua-400">{formatPrice(cartTotal)}</span>
          </div>
          <p className="mt-3 text-xs text-white/50">Prices and stock are checked again when you place the order.</p>

          <button onClick={() => navigate("/checkout")} className="btn-primary mt-5 w-full py-3">
            Proceed to Checkout
          </button>
          <Link to="/fish" className="btn-outline mt-3 w-full py-2.5 text-sm">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}