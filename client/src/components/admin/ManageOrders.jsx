import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage, formatPrice } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusColor = {
  "Pending Payment": "bg-amber-500/80",
  Pending: "bg-amber-500/80",
  Confirmed: "bg-sky-500/80",
  Shipped: "bg-indigo-500/80",
  Delivered: "bg-emerald-500/80",
  Cancelled: "bg-red-500/80",
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null); // which order details are open
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/orders");
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

  // The server returns the order without the buyer details, so we keep the old buyer info
  const replaceOrder = (updated) =>
    setOrders((list) => list.map((o) => (o._id === updated._id ? { ...o, ...updated, user: o.user } : o)));

  const changeStatus = async (order, status) => {
    if (status === order.orderStatus) return;
    if (status === "Cancelled") {
      const extra = order.paymentStatus === "Paid" ? " This order is PAID. You must refund the buyer by hand in PayHere." : "";
      if (!window.confirm(`Cancel this order? The fish stock will be returned.${extra}`)) return;
    }
    setBusyId(order._id);
    try {
      const { data } = await api.put(`/admin/orders/${order._id}/status`, { status });
      replaceOrder(data);
      toast.success(`Status changed to ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const markPaid = async (order) => {
    setBusyId(order._id);
    try {
      const { data } = await api.put(`/admin/orders/${order._id}/paid`);
      replaceOrder(data);
      toast.success("Marked as paid");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (order) => {
    if (!window.confirm("Delete this order for good? An active order will return its stock.")) return;
    setBusyId(order._id);
    try {
      await api.delete(`/orders/${order._id}`);
      setOrders((list) => list.filter((o) => o._id !== order._id));
      toast.success("Order deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  // Which statuses can the admin choose for this order
  const optionsFor = (order) => {
    if (["Cancelled", "Delivered"].includes(order.orderStatus)) return [];
    if (order.orderStatus === "Pending Payment") return ["Cancelled"]; // waiting for card payment
    return STATUSES;
  };

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "All" && o.orderStatus !== filter) return false;
      if (!text) return true;
      return (
        o._id.slice(-6).toLowerCase().includes(text) ||
        o.user?.name?.toLowerCase().includes(text) ||
        o.user?.email?.toLowerCase().includes(text)
      );
    });
  }, [orders, filter, search]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">Manage Orders ({orders.length})</h2>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by buyer name, email or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field min-w-[220px] flex-1"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto bg-navy-800" aria-label="Filter by status">
          <option>All</option>
          <option>Pending Payment</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 && <p className="text-center text-white/50">No orders found.</p>}

      {visible.map((order) => {
        const options = optionsFor(order);
        const isOpen = openId === order._id;
        const busy = busyId === order._id;

        return (
          <article key={order._id} className="glass-panel p-5">
            {/* Summary */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">#{order._id.slice(-6).toUpperCase()} · {order.user?.name || "Deleted user"}</p>
                <p className="text-xs text-white/50">{order.user?.email} · {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-aqua-400">{formatPrice(order.totalAmount)}</p>
                <div className="mt-1 flex flex-wrap justify-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[order.orderStatus]}`}>{order.orderStatus}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.paymentStatus === "Paid" ? "bg-emerald-500/80" : order.paymentStatus === "Failed" ? "bg-red-500/80" : "bg-white/20"}`}>
                    {order.paymentMethod === "COD" ? "COD" : "Card"} · {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {options.length > 0 ? (
                <select
                  value={order.orderStatus}
                  disabled={busy}
                  onChange={(e) => changeStatus(order, e.target.value)}
                  className="input-field !w-auto bg-navy-800 !py-1.5 text-sm"
                  aria-label="Change status"
                >
                  {!options.includes(order.orderStatus) && <option disabled>{order.orderStatus}</option>}
                  {options.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-white/50">Status is final.</span>
              )}

              {order.paymentMethod === "COD" && order.paymentStatus !== "Paid" && order.orderStatus !== "Cancelled" && (
                <button onClick={() => markPaid(order)} disabled={busy} className="rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/30">
                  Mark as paid
                </button>
              )}

              <button onClick={() => setOpenId(isOpen ? null : order._id)} className="rounded-full bg-white/10 px-4 py-1.5 text-sm hover:bg-white/20">
                {isOpen ? "Hide details" : "View details"}
              </button>
              <button onClick={() => remove(order)} disabled={busy} className="rounded-full bg-coral-500/20 px-4 py-1.5 text-sm text-coral-400 hover:bg-coral-500/30">
                Delete
              </button>
            </div>

            {/* Details */}
            {isOpen && (
              <div className="mt-4 space-y-3 border-t border-white/15 pt-4 text-sm">
                <ul className="space-y-1">
                  {order.items.map((i) => (
                    <li key={i.fish} className="flex justify-between gap-2">
                      <span>{i.name} × {i.quantity} <span className="text-white/40">({formatPrice(i.price)} each)</span></span>
                      <span>{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-1 text-white/70 sm:grid-cols-2">
                  <p>Deliver to: <b className="text-white">{order.delivery.name}</b></p>
                  <p>Phone: <b className="text-white">{order.delivery.phone}</b></p>
                  <p className="sm:col-span-2">Address: <b className="text-white">{order.delivery.address}</b></p>
                  {order.payherePaymentId && <p>PayHere payment ID: <b className="text-white">{order.payherePaymentId}</b></p>}
                  {order.paidAt && <p>Paid at: <b className="text-white">{new Date(order.paidAt).toLocaleString()}</b></p>}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}