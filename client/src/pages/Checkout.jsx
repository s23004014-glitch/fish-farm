import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage, formatPrice, openPayHerePopup, imageUrl, FALLBACK_IMAGE } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Spinner from "../components/Spinner.jsx";

import CardPaymentForm from "../components/CardPaymentForm.jsx";

// true = our own demo card form, false = PayHere popup
const USE_TEST_CARD = import.meta.env.VITE_TEST_CARD === "true";

// The two ways to pay
const methods = [
  { id: "COD", icon: "💵", title: "Cash on Delivery", text: "Pay in cash when your fish arrive." },
  { id: "CARD", icon: "💳", title: "Pay with card", text: "Secure checkout by PayHere. Your card details never reach our website." },
];

const Checkout = () => {
  const { user } = useAuth();
  const { cart, cartTotal, cartReady, clearCart } = useCart();
  const navigate = useNavigate();
  const orderPlaced = useRef(false); // stops the "empty cart" redirect after we place the order

  const [delivery, setDelivery] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false); // true while the PayHere window is open
  const [cardOrder, setCardOrder] = useState(null);

  // Empty cart: go back to the cart page
  useEffect(() => {
    if (cartReady && cart.length === 0 && !orderPlaced.current) navigate("/cart", { replace: true });
  }, [cartReady, cart, navigate]);

  if (!cartReady) return <Spinner />;

  const setField = (name, value) => setDelivery((d) => ({ ...d, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (delivery.name.trim().length < 2) return toast.error("Please enter the receiver's name");
    if (!/^[0-9+\s-]{9,15}$/.test(delivery.phone.trim())) return toast.error("Enter a valid phone number");
    if (delivery.address.trim().length < 5) return toast.error("Please enter the full delivery address");

    setSubmitting(true);
    try {
      // We send only the fish ID and quantity. The server finds the price itself.
      const { data: order } = await api.post("/orders", {
        items: cart.map((i) => ({ fishId: i.fishId, quantity: i.quantity })),
        delivery: {
          name: delivery.name.trim(),
          phone: delivery.phone.trim(),
          address: delivery.address.trim(),
        },
        paymentMethod,
      });

      // The order exists now, so the cart can be cleared
      orderPlaced.current = true;
      clearCart();

      // Cash on Delivery: done
      if (paymentMethod === "COD") {
        toast.success("Order placed! Thank you.");
        navigate(`/payment/result?order_id=${order._id}`, { replace: true });
        return;
      }

      // Demo: show our own card form instead of PayHere
      if (USE_TEST_CARD) {
        setCardOrder(order);
        setSubmitting(false);
        return;
      }

      // Card: open the secure PayHere window on top of our page
      const { data } = await api.post("/payments/payhere/start", { orderId: order._id });
      setPaying(true);
      openPayHerePopup(data, {
        // The window closed after the checkout. The server decides if it was paid.
        onCompleted: () => navigate(`/payment/result?order_id=${order._id}`, { replace: true }),
        // The buyer closed the window. The order is saved and can be paid later.
        onDismissed: () => navigate(`/payment/result?order_id=${order._id}&cancelled=1`, { replace: true }),
        onError: (message) => {
          setPaying(false);
          toast.error(`${message} Your order is saved. You can pay from My Orders.`);
          navigate("/buyer?tab=orders", { replace: true });
        },
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
      setPaying(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-2">Checkout</h1>
      <p className="mb-8 flex items-center gap-2 text-sm text-white/60">
        <span>🔒</span> Your order is protected. Prices and stock are checked again on our server.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery details */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aqua-400/20 text-sm text-aqua-300">1</span>
              Delivery details
            </h2>
            <input type="text" placeholder="Receiver name" value={delivery.name} onChange={(e) => setField("name", e.target.value)} className="input-field" required />
            <input type="tel" placeholder="Phone number" value={delivery.phone} onChange={(e) => setField("phone", e.target.value)} className="input-field" required />
            <textarea placeholder="Full delivery address" rows={3} value={delivery.address} onChange={(e) => setField("address", e.target.value)} className="input-field" required />
          </section>

          {/* Payment choice */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aqua-400/20 text-sm text-aqua-300">2</span>
              Payment method
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {methods.map((m) => {
                const active = paymentMethod === m.id;
                return (
                  <label
                    key={m.id}
                    className={`relative cursor-pointer rounded-2xl border p-5 backdrop-blur-xl transition duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-aqua-400 ${
                      active
                        ? "border-aqua-400 bg-gradient-to-br from-aqua-400/25 to-white/5 shadow-[0_8px_32px_rgba(34,211,238,0.25)]"
                        : "border-white/20 bg-gradient-to-br from-white/15 to-white/5 hover:-translate-y-0.5 hover:border-white/40"
                    }`}
                  >
                    <input type="radio" name="payment" value={m.id} checked={active} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                    <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-aqua-400 bg-aqua-400 text-navy-900" : "border-white/40"}`}>
                      {active && <span className="text-xs font-bold">✓</span>}
                    </span>
                    <span className="text-3xl">{m.icon}</span>
                    <span className="mt-2 block font-semibold">{m.title}</span>
                    <span className="mt-1 block text-sm text-white/60">{m.text}</span>

                    {m.id === "CARD" && (
                      <span className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold tracking-wide">
                        <span className="rounded-md bg-white px-2 py-0.5 text-[#1a1f71]">VISA</span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[#eb001b]">Mastercard</span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[#006fcf]">AMEX</span>
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {paymentMethod === "CARD" && (
              <p className="rounded-xl bg-white/10 p-3 text-sm text-white/70">
                🔒 After you click <b>Pay with Card</b>, a secure PayHere window opens on top of this page. Please finish the payment there.
              </p>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="glass-panel h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xl font-semibold">Your order</h2>

          <ul className="space-y-3">
            {cart.map((i) => (
              <li key={i.fishId} className="flex items-center gap-3">
                <img
                  src={imageUrl(i.image)}
                  alt=""
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-white/50">Qty {i.quantity}</p>
                </div>
                <span className="text-sm">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-white/15 pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-aqua-400">{formatPrice(cartTotal)}</span>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-3">
            {submitting ? "Please wait..." : paymentMethod === "CARD" ? "🔒 Pay with Card" : "Place Order"}
          </button>
          <Link to="/cart" className="btn-outline mt-3 w-full py-2.5 text-sm">
            Back to Cart
          </Link>

          <p className="mt-4 text-center text-xs text-white/40">Card payments are processed by PayHere, a Central Bank approved payment service.</p>
        </aside>
      </form>

      {/* Shown on our page while the PayHere window is open */}
      {paying && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/70 backdrop-blur-sm">
          <div className="glass-panel mx-4 max-w-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-aqua-400" />
            <h2 className="mt-5 text-xl font-semibold">Complete your payment</h2>
            <p className="mt-2 text-sm text-white/70">A secure PayHere window is open. Please finish the payment there and do not close this page.</p>
          </div>
        </div>
      )}

      {cardOrder && (
        <CardPaymentForm
          order={cardOrder}
          onPaid={() => navigate(`/payment/result?order_id=${cardOrder._id}`, { replace: true })}
          onClose={() => navigate(`/payment/result?order_id=${cardOrder._id}&cancelled=1`, { replace: true })}
        />
      )}
    </div>
  );
}

export default Checkout;