import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage, formatPrice, openPayHerePopup } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

import CardPaymentForm from "../CardPaymentForm.jsx";

const USE_TEST_CARD = import.meta.env.VITE_TEST_CARD === "true";

const statusColor = {
  "Pending Payment": "bg-amber-500/80",
  Pending: "bg-amber-500/80",
  Confirmed: "bg-sky-500/80",
  Shipped: "bg-indigo-500/80",
  Delivered: "bg-emerald-500/80",
  Cancelled: "bg-red-500/80",
};

const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];

// Simple tracker: Pending > Confirmed > Shipped > Delivered
function Tracker({ status }) {
  if (status === "Cancelled") return <p className="text-sm text-red-300">This order was cancelled.</p>;
  if (status === "Pending Payment") return <p className="text-sm text-amber-300">Waiting for card payment.</p>;

  const current = steps.indexOf(status);
  return (
    <ol className="flex items-center">
      {steps.map((step, i) => (
        <li key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= current ? "bg-aqua-400 text-navy-900" : "bg-white/15 text-white/50"}`}>
              {i <= current ? "✓" : i + 1}
            </span>
            <span className={`mt-1 text-[11px] ${i <= current ? "text-aqua-300" : "text-white/40"}`}>{step}</span>
          </div>
          {i < steps.length - 1 && <span className={`mx-1 mb-4 h-0.5 flex-1 ${i < current ? "bg-aqua-400" : "bg-white/15"}`} />}
        </li>
      ))}
    </ol>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // order that is being changed
  const [cardOrder, setCardOrder] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/orders/my");
      setOrders(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (order) => {
    if (!window.confirm("Cancel this order?")) return;
    setBusyId(order._id);
    try {
      await api.put(`/orders/${order._id}/cancel`);
      toast.success("Order cancelled");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (order) => {
    if (!window.confirm("Delete this order from your list?")) return;
    setBusyId(order._id);
    try {
      await api.delete(`/orders/${order._id}`);
      toast.success("Order deleted");
      setOrders((list) => list.filter((o) => o._id !== order._id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  // Open the secure PayHere window on top of this page
  const payNow = async (order) => {
    if (USE_TEST_CARD) {
      setCardOrder(order);
      return;
    }
    setBusyId(order._id);
    try {
      const { data } = await api.post("/payments/payhere/start", { orderId: order._id });
      openPayHerePopup(data, {
        // The window closed after the checkout. The result page asks the server if it was paid.
        onCompleted: () => navigate(`/payment/result?order_id=${order._id}`),
        // The buyer closed the window without paying
        onDismissed: () => {
          setBusyId(null);
          load();
        },
        onError: (message) => {
          toast.error(message);
          setBusyId(null);
        },
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusyId(null);
    }
  };

  if (loading) return <Spinner text="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-5xl">📦</p>
        <p className="mt-3 text-lg">You have no orders yet.</p>
        <Link to="/fish" className="btn-primary mt-5">Browse Fish</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">My Orders</h2>

      {orders.map((order) => {
        const canCancel = ["Pending Payment", "Pending", "Confirmed"].includes(order.orderStatus) && order.paymentStatus !== "Paid";
        const canPay = order.paymentMethod === "CARD" && order.orderStatus === "Pending Payment" && order.paymentStatus === "Pending";
        const canDelete = ["Cancelled", "Delivered"].includes(order.orderStatus);
        const paidButActive = order.paymentStatus === "Paid" && ["Pending", "Confirmed"].includes(order.orderStatus);

        return (
          <article key={order._id} className="glass-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-white/50">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[order.orderStatus]}`}>{order.orderStatus}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.paymentStatus === "Paid" ? "bg-emerald-500/80" : order.paymentStatus === "Failed" ? "bg-red-500/80" : "bg-white/20"}`}>
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : "Card"} · {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="my-5">
              <Tracker status={order.orderStatus} />
            </div>

            <ul className="space-y-1 text-sm">
              {order.items.map((i) => (
                <li key={i.fish} className="flex justify-between gap-2">
                  <span className="text-white/80">{i.name} × {i.quantity}</span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between border-t border-white/15 pt-3 font-bold">
              <span>Total</span>
              <span className="text-aqua-400">{formatPrice(order.totalAmount)}</span>
            </div>

            <p className="mt-2 text-xs text-white/50">Deliver to: {order.delivery.name}, {order.delivery.phone}, {order.delivery.address}</p>

            {/* Actions (only when allowed by status) */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {canPay && (
                <button onClick={() => payNow(order)} disabled={busyId === order._id} className="btn-primary !py-2 text-sm">
                  {busyId === order._id ? "Opening payment..." : "🔒 Pay now"}
                </button>
              )}
              {canCancel && (
                <button onClick={() => cancel(order)} disabled={busyId === order._id} className="btn-outline !border-coral-400/60 !py-2 text-sm !text-coral-400 hover:!bg-coral-400/10">
                  Cancel order
                </button>
              )}
              {canDelete && (
                <button onClick={() => remove(order)} disabled={busyId === order._id} className="btn-outline !py-2 text-sm">
                  Delete
                </button>
              )}
              {paidButActive && <span className="text-xs text-white/50">Paid orders cannot be cancelled online. Please contact the farm.</span>}
              {order.orderStatus === "Shipped" && <span className="text-xs text-white/50">This order is on its way.</span>}
            </div>
          </article>
        );
      })}

      {cardOrder && (
        <CardPaymentForm
          order={cardOrder}
          onPaid={() => navigate(`/payment/result?order_id=${cardOrder._id}`)}
          onClose={() => {
            setCardOrder(null);
            load();
          }}
        />
      )}
    </div>
  );
}