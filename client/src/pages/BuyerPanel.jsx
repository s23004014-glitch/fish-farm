import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import BuyerProfile from "../components/buyer/BuyerProfile.jsx";
import MyOrders from "../components/buyer/MyOrders.jsx";
import BuyerRequests from "../components/buyer/BuyerRequests.jsx";

const tabs = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "orders", label: "My Orders", icon: "📦" },
  { id: "requests", label: "Requests", icon: "💬" },
];

export default function BuyerPanel() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [params, setParams] = useSearchParams();

  // The tab is saved in the address (?tab=orders), so links like "My Orders" work
  const tab = tabs.some((t) => t.id === params.get("tab")) ? params.get("tab") : "profile";

  return (
    <div className="page-container">
      <h1 className="section-title mb-1">Buyer Panel</h1>
      <p className="mb-8 text-white/60">Hi {user?.name}, manage your account and orders here.</p>

      <div className="grid gap-6 lg:grid-cols-4">
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

          {/* Cart shortcut */}
          <Link to="/cart" className="flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10">
            <span>🛒</span> Cart {cartCount > 0 && <span className="rounded-full bg-coral-500 px-2 text-xs">{cartCount}</span>}
          </Link>
        </nav>

        <div className="lg:col-span-3">
          {tab === "profile" && <BuyerProfile />}
          {tab === "orders" && <MyOrders />}
          {tab === "requests" && <BuyerRequests />}
        </div>
      </div>
    </div>
  );
}