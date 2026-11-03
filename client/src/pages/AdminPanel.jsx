import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Dashboard from "../components/admin/Dashboard.jsx";
import ManageFish from "../components/admin/ManageFish.jsx";
import ManageOrders from "../components/admin/ManageOrders.jsx";
import ManageBuyers from "../components/admin/ManageBuyers.jsx";
import ManageRequests from "../components/admin/ManageRequests.jsx";
import ManageFeedback from "../components/admin/ManageFeedback.jsx";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "fish", label: "Fish", icon: "🐠" },
  { id: "orders", label: "Orders", icon: "📦" },
  { id: "buyers", label: "Buyers", icon: "👥" },
  { id: "requests", label: "Requests", icon: "💬" },
  { id: "feedback", label: "Feedback", icon: "⭐" },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = tabs.some((t) => t.id === params.get("tab")) ? params.get("tab") : "dashboard";

  return (
    <div className="page-container">
      <h1 className="section-title mb-1">Admin Panel</h1>
      <p className="mb-8 text-white/60">Welcome, {user?.name}.</p>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Menu: side list on desktop, scroll row on mobile */}
        <nav className="glass-panel flex gap-2 overflow-x-auto p-3 lg:flex-col lg:self-start">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setParams({ tab: t.id })}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                tab === t.id ? "bg-gradient-to-r from-coral-500/90 to-coral-400/90 shadow" : "hover:bg-white/10"
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 lg:col-span-4">
          {tab === "dashboard" && <Dashboard />}
          {tab === "fish" && <ManageFish />}
          {tab === "orders" && <ManageOrders />}
          {tab === "buyers" && <ManageBuyers />}
          {tab === "requests" && <ManageRequests />}
          {tab === "feedback" && <ManageFeedback />}
        </div>
      </div>
    </div>
  );
}