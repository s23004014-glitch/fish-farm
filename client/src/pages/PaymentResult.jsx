import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage, formatPrice } from "../api/axios.js";
import Spinner from "../components/Spinner.jsx";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const cancelled = params.get("cancelled") === "1";

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  // Load the order. For card payments PayHere tells our server a few seconds later,
  // so we ask again every 3 seconds (up to 10 times) until it says Paid.
  useEffect(() => {
    if (!orderId) {
      setError("No order was found");
      return;
    }
    let timer;
    let attempts = 0;
    let stopped = false;

    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        if (stopped) return;
        setOrder(data);

        const waiting =
          data.paymentMethod === "CARD" &&
          data.orderStatus === "Pending Payment" &&
          data.paymentStatus === "Pending" &&
          !cancelled;

        if (waiting && attempts < 10) {
          attempts++;
          setChecking(true);
          timer = setTimeout(load, 3000);
        } else {
          setChecking(false);
        }
      } catch (err) {
        if (!stopped) setError(getErrorMessage(err));
      }
    };

    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId, cancelled]);

  if (error) {
    return (
      <div className="page-container text-center">
        <p className="text-red-300">{error}</p>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    );
  }
  if (!order) return <Spinner text="Loading your order..." />;

  // Decide what message to show
  let view;
  if (order.paymentStatus === "Paid") {
    view = { icon: "✅", title: "Payment successful", text: "Thank you! We received your payment and sent a confirmation email." };
  } else if (order.paymentStatus === "Failed" || order.orderStatus === "Cancelled") {
    view = { icon: "❌", title: "Order not completed", text: "The payment failed or the order was cancelled. You were not charged for a failed payment." };
  } else if (order.paymentMethod === "CARD" && cancelled) {
    view = { icon: "⚠️", title: "Payment cancelled", text: "You cancelled the payment. Your order is saved. You can pay again or cancel it from My Orders." };
  } else if (order.paymentMethod === "CARD" && checking) {
    view = { icon: "⏳", title: "Confirming your payment...", text: "Please wait a few seconds. Do not close this page." };
  } else if (order.paymentMethod === "CARD") {
    view = { icon: "⏳", title: "Waiting for confirmation", text: "We have not received the payment confirmation yet. Check My Orders in a few minutes." };
  } else {
    view = { icon: "🎉", title: "Order placed", text: "Thank you! We sent you a confirmation email. Please keep the cash ready for delivery." };
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="glass-panel p-6 text-center sm:p-8">
        <p className="text-6xl">{view.icon}</p>
        <h1 className="section-title mt-3">{view.title}</h1>
        <p className="mt-2 text-white/70">{view.text}</p>
        {checking && <Spinner text="" />}
      </div>

      {/* Order summary */}
      <div className="glass-panel mt-6 p-6">
        <h2 className="mb-1 text-xl font-semibold">Order details</h2>
        <p className="mb-4 text-xs text-white/50">Order ID: {order._id}</p>

        <ul className="space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.fish} className="flex justify-between gap-2">
              <span>{i.name} × {i.quantity}</span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-white/15 pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="text-aqua-400">{formatPrice(order.totalAmount)}</span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
          <p>Payment: <b className="text-white">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Card (PayHere)"}</b></p>
          <p>Payment status: <b className="text-white">{order.paymentStatus}</b></p>
          <p>Order status: <b className="text-white">{order.orderStatus}</b></p>
          <p>Deliver to: <b className="text-white">{order.delivery.name}</b>, {order.delivery.address}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/buyer?tab=orders" className="btn-primary px-8">My Orders</Link>
        <Link to="/fish" className="btn-outline px-8">Continue Shopping</Link>
      </div>
    </div>
  );
}