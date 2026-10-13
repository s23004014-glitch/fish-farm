import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import { fishData } from "../data/fish";

/* ------------------------------------------------------------------ */
/* Icons — same minimal line style used across the app                */
/* ------------------------------------------------------------------ */
function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="10" width="7" height="11" rx="1.5" />
      <rect x="3" y="13" width="7" height="8" rx="1.5" />
    </svg>
  );
}
function ListingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  );
}
function ImportIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v11" />
      <path d="M8 10l4 4 4-4" />
      <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}
function OrdersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
    </svg>
  );
}
function ReportsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
    </svg>
  );
}

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { key: "listings", label: "Manage Listings", icon: ListingsIcon },
  { key: "imports", label: "Import Records", icon: ImportIcon },
  { key: "orders", label: "Manage Orders", icon: OrdersIcon },
  { key: "reports", label: "View Reports", icon: ReportsIcon },
];

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */
const initialOrders = [
  { id: "AQ-10102", buyer: "Alex Chen", fishId: 3, qty: 1, status: "Delivered", date: "Mar 12, 2026" },
  { id: "AQ-10145", buyer: "Priya Nair", fishId: 1, qty: 2, status: "Delivered", date: "Apr 3, 2026" },
  { id: "AQ-10178", buyer: "Marcus Webb", fishId: 4, qty: 1, status: "Delivered", date: "Apr 22, 2026" },
  { id: "AQ-10201", buyer: "Sofia Alvarez", fishId: 2, qty: 8, status: "Delivered", date: "May 9, 2026" },
  { id: "AQ-10229", buyer: "Tom Becker", fishId: 6, qty: 2, status: "Delivered", date: "May 27, 2026" },
  { id: "AQ-10251", buyer: "Grace Kim", fishId: 3, qty: 2, status: "Shipped", date: "Aug 20, 2026" },
  { id: "AQ-10267", buyer: "Diego Ruiz", fishId: 5, qty: 1, status: "Delivered", date: "Jun 2, 2026" },
  { id: "AQ-10289", buyer: "Nadia Farouk", fishId: 7, qty: 3, status: "Delivered", date: "Jul 30, 2026" },
  { id: "AQ-10301", buyer: "Liam O'Connor", fishId: 2, qty: 6, status: "Confirmed", date: "Aug 24, 2026" },
  { id: "AQ-10312", buyer: "Alex Chen", fishId: 8, qty: 1, status: "Validating stock", date: "Aug 28, 2026" },
  { id: "AQ-10318", buyer: "Priya Nair", fishId: 4, qty: 1, status: "Cancelled", date: "Aug 10, 2026" },
  { id: "AQ-10325", buyer: "Sofia Alvarez", fishId: 6, qty: 2, status: "Shipped", date: "Aug 26, 2026" },
  { id: "AQ-10330", buyer: "Marcus Webb", fishId: 1, qty: 1, status: "Validating stock", date: "Aug 29, 2026" },
];

const importBatches = [
  { id: "IMP-2201", farm: "Coral Bay Hatchery", fish: "Crimson Betta", qty: 40, expected: "Sep 3, 2026", status: "In transit" },
  { id: "IMP-2198", farm: "Tidewater Farms", fish: "Neon Tetra Shoal", qty: 300, expected: "Aug 30, 2026", status: "In transit" },
  { id: "IMP-2184", farm: "Blue Horizon Aquafarm", fish: "Blue Discus", qty: 15, expected: "Aug 22, 2026", status: "Received" },
  { id: "IMP-2177", farm: "Lagoon Breeders Co.", fish: "Koi Butterfly", qty: 20, expected: "Aug 18, 2026", status: "Received" },
  { id: "IMP-2165", farm: "Reeftrail Aquaculture", fish: "Ocellaris Clownfish", qty: 60, expected: "Sep 6, 2026", status: "Delayed" },
  { id: "IMP-2152", farm: "Northshoal Farms", fish: "Tiger Oscar", qty: 25, expected: "Sep 1, 2026", status: "In transit" },
];

const orderStatusOptions = ["Validating stock", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusStyles = {
  "Validating stock": "bg-[rgba(255,107,74,0.15)] text-[var(--color-coral)]",
  Confirmed: "bg-[rgba(15,92,102,0.12)] text-[var(--color-reef)]",
  Shipped: "bg-[rgba(27,122,133,0.15)] text-[var(--color-reef-light)]",
  Delivered: "bg-[rgba(127,217,196,0.25)] text-[#0f5c4a]",
  Cancelled: "bg-[rgba(11,32,48,0.06)] text-[var(--color-ink-soft)]",
  "In transit": "bg-[rgba(15,92,102,0.12)] text-[var(--color-reef)]",
  Received: "bg-[rgba(127,217,196,0.25)] text-[#0f5c4a]",
  Delayed: "bg-[rgba(255,107,74,0.15)] text-[var(--color-coral)]",
};

const listingStatusStyles = {
  "In stock": "bg-[rgba(127,217,196,0.25)] text-[#0f5c4a]",
  "Low stock": "bg-[rgba(255,107,74,0.15)] text-[var(--color-coral)]",
  "Sold out": "bg-[rgba(11,32,48,0.06)] text-[var(--color-ink-soft)]",
};

const monthsOrder = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-ink)]">{label}</span>
        <span className="font-data text-[var(--color-ink-soft)]">${value.toFixed(0)}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[rgba(11,32,48,0.06)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [orders, setOrders] = useState(initialOrders);
  const [listingSearch, setListingSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [notice, setNotice] = useState("");

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".admin-fade", { opacity: 0, y: 16, duration: 0.5, stagger: 0.05, ease: "power3.out" });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setNotice("");
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [activeSection]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const revenueFor = (order) => {
    if (order.status === "Cancelled") return 0;
    const fish = fishData.find((f) => f.id === order.fishId);
    return fish ? fish.price * order.qty : 0;
  };

  // ---- Derived data for Dashboard & Reports ----
  const totalRevenue = orders.reduce((sum, o) => sum + revenueFor(o), 0);
  const lowStockListings = fishData.filter((f) => f.stock === "Low stock" || f.stock === "Sold out");
  const recentOrders = orders.slice(-5).reverse();

  const revenueByMonth = monthsOrder.map((month) => ({
    label: month,
    value: orders.filter((o) => o.date.startsWith(month)).reduce((sum, o) => sum + revenueFor(o), 0),
  }));

  const speciesRevenue = Object.entries(
    orders.reduce((acc, o) => {
      const fish = fishData.find((f) => f.id === o.fishId);
      if (!fish) return acc;
      acc[fish.name] = (acc[fish.name] || 0) + revenueFor(o);
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const farmRevenue = Object.entries(
    orders.reduce((acc, o) => {
      const fish = fishData.find((f) => f.id === o.fishId);
      if (!fish) return acc;
      acc[fish.farm] = (acc[fish.farm] || 0) + revenueFor(o);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const filteredListings = fishData.filter((f) =>
    f.name.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.buyer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main ref={rootRef} className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="admin-fade">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-reef)]">
            Admin panel
          </span>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
            Operations overview
          </h1>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* ---------------- Sidebar (desktop) ---------------- */}
          <aside className="admin-fade hidden w-56 flex-shrink-0 lg:block">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSection(key)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors duration-200 ${
                    activeSection === key
                      ? "bg-[var(--color-abyss)] text-[var(--color-sand)]"
                      : "text-[var(--color-ink-soft)] hover:bg-[rgba(11,32,48,0.06)]"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            {/* ---------------- Tabs (mobile/tablet) ---------------- */}
            <div className="admin-fade mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSection(key)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    activeSection === key
                      ? "bg-[var(--color-abyss)] text-[var(--color-sand)]"
                      : "bg-[rgba(11,32,48,0.06)] text-[var(--color-ink-soft)] hover:bg-[rgba(11,32,48,0.1)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div ref={contentRef}>
              {/* ================= DASHBOARD ================= */}
              {activeSection === "dashboard" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                      <p className="font-data text-2xl font-semibold text-[var(--color-reef)]">${totalRevenue.toFixed(0)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Total revenue</p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                      <p className="font-data text-2xl font-semibold text-[var(--color-ink)]">{orders.length}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Total orders</p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                      <p className="font-data text-2xl font-semibold text-[#0f5c4a]">
                        {fishData.filter((f) => f.stock !== "Sold out").length}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Active listings</p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                      <p className="font-data text-2xl font-semibold text-[var(--color-coral)]">{lowStockListings.length}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Stock alerts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                      <h3 className="text-base font-semibold text-[var(--color-ink)]">Low stock alerts</h3>
                      <ul className="mt-4 space-y-3">
                        {lowStockListings.map((fish) => (
                          <li key={fish.id} className="flex items-center justify-between gap-3 text-sm">
                            <div>
                              <p className="font-semibold text-[var(--color-ink)]">{fish.name}</p>
                              <p className="text-xs text-[var(--color-ink-soft)]">{fish.farm}</p>
                            </div>
                            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${listingStatusStyles[fish.stock]}`}>
                              {fish.stock}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                      <h3 className="text-base font-semibold text-[var(--color-ink)]">Recent orders</h3>
                      <ul className="mt-4 space-y-3">
                        {recentOrders.map((order) => (
                          <li key={order.id} className="flex items-center justify-between gap-3 text-sm">
                            <div>
                              <p className="font-semibold text-[var(--color-ink)]">{order.id}</p>
                              <p className="text-xs text-[var(--color-ink-soft)]">{order.buyer} · {order.date}</p>
                            </div>
                            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                              {order.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MANAGE LISTINGS ================= */}
              {activeSection === "listings" && (
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      type="text"
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      placeholder="Search listings by name..."
                      className="w-full max-w-xs rounded-xl border border-[rgba(11,32,48,0.15)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
                    />
                    <button
                      type="button"
                      onClick={() => setNotice("Adding listings requires a connected backend — hook this button up to your API.")}
                      className="btn-primary text-[var(--color-abyss)]"
                    >
                      Add listing
                    </button>
                  </div>
                  {notice && <p className="mt-3 text-xs text-[var(--color-ink-soft)]">{notice}</p>}

                  <div className="mt-5 overflow-hidden rounded-2xl border border-[rgba(11,32,48,0.08)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[rgba(11,32,48,0.04)] text-xs uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Fish</th>
                          <th className="hidden px-5 py-3 font-semibold sm:table-cell">Farm</th>
                          <th className="px-5 py-3 font-semibold">Price</th>
                          <th className="px-5 py-3 font-semibold">Stock</th>
                          <th className="px-5 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(11,32,48,0.06)] bg-white">
                        {filteredListings.map((fish) => (
                          <tr key={fish.id}>
                            <td className="px-5 py-4 font-semibold text-[var(--color-ink)]">{fish.name}</td>
                            <td className="hidden px-5 py-4 text-[var(--color-ink-soft)] sm:table-cell">{fish.farm}</td>
                            <td className="px-5 py-4 font-data text-[var(--color-ink)]">${fish.price.toFixed(2)}</td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${listingStatusStyles[fish.stock]}`}>
                                {fish.stock}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => setNotice(`Editing "${fish.name}" requires a connected backend.`)}
                                className="mr-3 text-xs font-semibold text-[var(--color-reef)] hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setNotice(`Deleting "${fish.name}" requires a connected backend.`)}
                                className="text-xs font-semibold text-[var(--color-coral)] hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredListings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--color-ink-soft)]">
                              No listings match &ldquo;{listingSearch}&rdquo;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= IMPORT RECORDS ================= */}
              {activeSection === "imports" && (
                <div className="overflow-hidden rounded-2xl border border-[rgba(11,32,48,0.08)]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[rgba(11,32,48,0.04)] text-xs uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Batch</th>
                        <th className="px-5 py-3 font-semibold">Farm</th>
                        <th className="hidden px-5 py-3 font-semibold sm:table-cell">Fish</th>
                        <th className="px-5 py-3 font-semibold">Qty</th>
                        <th className="hidden px-5 py-3 font-semibold md:table-cell">Expected</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(11,32,48,0.06)] bg-white">
                      {importBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td className="px-5 py-4 font-data text-[var(--color-ink)]">{batch.id}</td>
                          <td className="px-5 py-4 text-[var(--color-ink-soft)]">{batch.farm}</td>
                          <td className="hidden px-5 py-4 text-[var(--color-ink-soft)] sm:table-cell">{batch.fish}</td>
                          <td className="px-5 py-4 text-[var(--color-ink-soft)]">{batch.qty}</td>
                          <td className="hidden px-5 py-4 text-[var(--color-ink-soft)] md:table-cell">{batch.expected}</td>
                          <td className="px-5 py-4">
                            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[batch.status]}`}>
                              {batch.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================= MANAGE ORDERS ================= */}
              {activeSection === "orders" && (
                <div>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by buyer or order ID..."
                    className="w-full max-w-xs rounded-xl border border-[rgba(11,32,48,0.15)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
                  />

                  <div className="mt-5 overflow-hidden rounded-2xl border border-[rgba(11,32,48,0.08)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[rgba(11,32,48,0.04)] text-xs uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Order</th>
                          <th className="px-5 py-3 font-semibold">Buyer</th>
                          <th className="hidden px-5 py-3 font-semibold sm:table-cell">Fish</th>
                          <th className="hidden px-5 py-3 font-semibold md:table-cell">Total</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(11,32,48,0.06)] bg-white">
                        {filteredOrders.map((order) => {
                          const fish = fishData.find((f) => f.id === order.fishId);
                          return (
                            <tr key={order.id}>
                              <td className="px-5 py-4 font-data text-[var(--color-ink)]">{order.id}</td>
                              <td className="px-5 py-4 text-[var(--color-ink)]">{order.buyer}</td>
                              <td className="hidden px-5 py-4 text-[var(--color-ink-soft)] sm:table-cell">{fish?.name ?? "—"}</td>
                              <td className="hidden px-5 py-4 font-data text-[var(--color-ink-soft)] md:table-cell">
                                ${(fish ? fish.price * order.qty : 0).toFixed(2)}
                              </td>
                              <td className="px-5 py-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${statusStyles[order.status]}`}
                                >
                                  {orderStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--color-ink-soft)]">
                              No orders match &ldquo;{orderSearch}&rdquo;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= VIEW REPORTS ================= */}
              {activeSection === "reports" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5 lg:col-span-2">
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">Revenue by month</h3>
                    <div className="mt-5 space-y-4">
                      {revenueByMonth.map((row) => (
                        <BarRow key={row.label} label={row.label} value={row.value} max={Math.max(...revenueByMonth.map((r) => r.value), 1)} color="#0f5c66" />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">Top species by revenue</h3>
                    <div className="mt-5 space-y-4">
                      {speciesRevenue.map(([name, value]) => (
                        <BarRow key={name} label={name} value={value} max={speciesRevenue[0]?.[1] ?? 1} color="#ff6b4a" />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">Farm analytics</h3>
                    <div className="mt-5 space-y-4">
                      {farmRevenue.map(([name, value]) => (
                        <BarRow key={name} label={name} value={value} max={farmRevenue[0]?.[1] ?? 1} color="#7fd9c4" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
