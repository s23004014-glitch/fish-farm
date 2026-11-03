import { useEffect, useState } from "react";
import api, { getErrorMessage, formatPrice } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} p-5 shadow-lg`}>
      <p className="text-3xl">{icon}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-300">{error}</p>;
  if (!stats) return <Spinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon="📦" label="Total orders" value={stats.totalOrders} color="from-ocean-600 to-ocean-500" />
        <StatCard icon="💰" label="Total revenue (paid orders)" value={formatPrice(stats.totalRevenue)} color="from-lagoon-600 to-lagoon-500" />
        <StatCard icon="⏳" label="Pending orders" value={stats.pendingOrders} color="from-amber-600 to-amber-500" />
        <StatCard icon="⚠️" label="Low-stock fish" value={stats.lowStockFish.length} color="from-coral-600 to-coral-500" />
        <StatCard icon="👥" label="Buyers" value={stats.totalBuyers} color="from-navy-700 to-ocean-600" />
        <StatCard icon="💬" label="Open requests" value={stats.openRequests} color="from-navy-700 to-lagoon-600" />
      </div>

      {/* Low stock list */}
      <section className="glass-panel p-6">
        <h3 className="mb-4 text-lg font-semibold">Fish that need restocking (5 or fewer)</h3>
        {stats.lowStockFish.length === 0 ? (
          <p className="text-white/60">All fish have enough stock. 🎉</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {stats.lowStockFish.map((f) => (
              <li key={f._id} className="flex items-center justify-between py-2.5">
                <span>{f.name}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${f.stock === 0 ? "bg-red-500/80" : "bg-amber-500/90"}`}>
                  {f.stock === 0 ? "Out of stock" : `${f.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}