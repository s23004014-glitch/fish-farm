import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import { fishData } from "../data/fish";

/* ------------------------------------------------------------------ */
/* Mock order history — replace with a real fetch keyed to the buyer  */
/* once auth is wired up. Each order just references a fish id so the */
/* name/farm/price stay in sync with the shared catalog data.         */
/* ------------------------------------------------------------------ */
const orders = [
  { id: "AQ-10234", fishId: 1, qty: 1, status: "Delivered", date: "Jul 14, 2026" },
  { id: "AQ-10251", fishId: 3, qty: 2, status: "Shipped", date: "Aug 20, 2026" },
  { id: "AQ-10267", fishId: 5, qty: 1, status: "Delivered", date: "Jun 2, 2026" },
  { id: "AQ-10289", fishId: 7, qty: 3, status: "Delivered", date: "Jul 30, 2026" },
  { id: "AQ-10301", fishId: 2, qty: 6, status: "Confirmed", date: "Aug 24, 2026" },
  { id: "AQ-10312", fishId: 8, qty: 1, status: "Validating stock", date: "Aug 28, 2026" },
  { id: "AQ-10318", fishId: 4, qty: 1, status: "Cancelled", date: "Aug 10, 2026" },
  { id: "AQ-10325", fishId: 6, qty: 2, status: "Shipped", date: "Aug 26, 2026" },
  { id: "AQ-10330", fishId: 1, qty: 1, status: "Validating stock", date: "Aug 29, 2026" },
];

const tabs = ["All", "Validating stock", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusStyles = {
  "Validating stock": "bg-[rgba(255,107,74,0.15)] text-[var(--color-coral)]",
  Confirmed: "bg-[rgba(15,92,102,0.12)] text-[var(--color-reef)]",
  Shipped: "bg-[rgba(27,122,133,0.15)] text-[var(--color-reef-light)]",
  Delivered: "bg-[rgba(127,217,196,0.25)] text-[#0f5c4a]",
  Cancelled: "bg-[rgba(11,32,48,0.06)] text-[var(--color-ink-soft)]",
};

function withFish(order) {
  const fish = fishData.find((f) => f.id === order.fishId);
  return { ...order, fish, total: fish ? fish.price * order.qty : 0 };
}

const enrichedOrders = orders.map(withFish);

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("All");
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const isFirstRender = useRef(true);

  const filtered =
    activeTab === "All" ? enrichedOrders : enrichedOrders.filter((o) => o.status === activeTab);

  const activeCount = enrichedOrders.filter((o) =>
    ["Validating stock", "Confirmed", "Shipped"].includes(o.status)
  ).length;
  const deliveredCount = enrichedOrders.filter((o) => o.status === "Delivered").length;
  const totalSpent = enrichedOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dash-fade", { opacity: 0, y: 16, duration: 0.5, stagger: 0.06, ease: "power3.out" });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (listRef.current) {
      gsap.fromTo(listRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [activeTab]);

  return (
    <>
      <Navbar />
      <main ref={rootRef} className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {/* Header */}
        <div className="dash-fade">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-reef)]">
            Buyer dashboard
          </span>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">Your orders</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Track every order from stock validation through delivery.
          </p>
        </div>

        {/* Stat cards */}
        <div className="dash-fade mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
            <p className="font-data text-2xl font-semibold text-[var(--color-reef)]">{activeCount}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Active orders</p>
          </div>
          <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
            <p className="font-data text-2xl font-semibold text-[#0f5c4a]">{deliveredCount}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Delivered</p>
          </div>
          <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
            <p className="font-data text-2xl font-semibold text-[var(--color-ink)]">${totalSpent.toFixed(2)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Total spent</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-fade mt-8 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-[var(--color-abyss)] text-[var(--color-sand)]"
                  : "bg-[rgba(11,32,48,0.06)] text-[var(--color-ink-soft)] hover:bg-[rgba(11,32,48,0.1)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div ref={listRef} className="mt-6">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(11,32,48,0.15)] bg-[rgba(255,255,255,0.6)] px-6 py-14 text-center">
              <p className="text-lg font-semibold text-[var(--color-ink)]">No orders here yet</p>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Orders with a &ldquo;{activeTab}&rdquo; status will show up in this tab.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-[rgba(11,32,48,0.08)] md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[rgba(11,32,48,0.04)] text-xs uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-5 py-3 font-semibold">Fish</th>
                      <th className="px-5 py-3 font-semibold">Farm</th>
                      <th className="px-5 py-3 font-semibold">Qty</th>
                      <th className="px-5 py-3 font-semibold">Total</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(11,32,48,0.06)] bg-white">
                    {filtered.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4 font-data text-[var(--color-ink)]">{order.id}</td>
                        <td className="px-5 py-4 font-semibold text-[var(--color-ink)]">
                          {order.fish?.name ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-[var(--color-ink-soft)]">{order.fish?.farm ?? "—"}</td>
                        <td className="px-5 py-4 text-[var(--color-ink-soft)]">{order.qty}</td>
                        <td className="px-5 py-4 font-data text-[var(--color-ink)]">${order.total.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[var(--color-ink-soft)]">{order.date}</td>
                        <td className="px-5 py-4 text-right">
                          {order.fish && (
                            <Link
                              to={`/listing/${order.fish.id}`}
                              className="text-xs font-semibold text-[var(--color-reef)] hover:underline"
                            >
                              View listing
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-4 md:hidden">
                {filtered.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-data text-xs text-[var(--color-ink-soft)]">{order.id}</p>
                        <p className="mt-0.5 font-semibold text-[var(--color-ink)]">{order.fish?.name ?? "—"}</p>
                        <p className="text-xs text-[var(--color-ink-soft)]">{order.fish?.farm ?? "—"}</p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[rgba(11,32,48,0.06)] pt-3 text-sm">
                      <span className="text-[var(--color-ink-soft)]">
                        Qty {order.qty} · {order.date}
                      </span>
                      <span className="font-data font-semibold text-[var(--color-ink)]">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    {order.fish && (
                      <Link
                        to={`/listing/${order.fish.id}`}
                        className="mt-3 inline-block text-xs font-semibold text-[var(--color-reef)] hover:underline"
                      >
                        View listing →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
