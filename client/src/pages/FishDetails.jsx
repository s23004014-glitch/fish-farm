import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage, imageUrl, formatPrice, FALLBACK_IMAGE } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Spinner from "../components/Spinner.jsx";

const badgeStyle = {
  "In stock": "bg-emerald-500/80",
  "Low stock": "bg-amber-500/90",
  "Out of stock": "bg-red-500/80",
};

export default function FishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/fish/${id}`)
      .then((res) => {
        setFish(res.data);
        setQuantity(1);
      })
      .catch((err) => setError(err.response?.status === 404 || err.response?.status === 400 ? "Fish not found" : getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;

  if (error || !fish) {
    return (
      <div className="page-container text-center">
        <p className="text-xl">{error || "Fish not found"}</p>
        <Link to="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </div>
    );
  }

  const outOfStock = fish.stock <= 0;

  // Quantity can never be more than the stock
  const changeQty = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    setQuantity(Math.max(1, Math.min(n, fish.stock)));
  };

  const handleAdd = () => {
    if (!user) {
      toast("Please log in to add fish to your cart", { icon: "🔒" });
      navigate("/login", { state: { from: `/fish/${fish._id}` } });
      return;
    }
    if (user.role === "admin") {
      toast.error("Admin accounts cannot buy fish");
      return;
    }
    const result = addToCart(fish, quantity);
    result.ok ? toast.success(result.message) : toast.error(result.message);
  };

  return (
    <div className="page-container">
      <Link to="/" className="btn-outline mb-6 !py-2 text-sm">
        ← Back to Home
      </Link>

      <div className="glass-panel grid gap-8 p-5 md:grid-cols-2 md:p-8">
        {/* Large image */}
        <div className="overflow-hidden rounded-2xl">
          <img
            src={imageUrl(fish.image)}
            alt={fish.name}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            className="h-full max-h-[480px] w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{fish.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle[fish.stockStatus]}`}>{fish.stockStatus}</span>
          </div>

          <p className="text-3xl font-bold text-aqua-400">{formatPrice(fish.price)}</p>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-white/50">Size</dt>
              <dd className="font-semibold">{fish.size || "-"}</dd>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-white/50">Stock available</dt>
              <dd className="font-semibold">{fish.stock}</dd>
            </div>
          </dl>

          {fish.description && (
            <div>
              <h2 className="mb-1 font-semibold text-aqua-400">Description</h2>
              <p className="text-white/80">{fish.description}</p>
            </div>
          )}

          {fish.careTips && (
            <div>
              <h2 className="mb-1 font-semibold text-aqua-400">Care tips</h2>
              <p className="text-white/80">{fish.careTips}</p>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center overflow-hidden rounded-full border border-white/20 bg-white/10">
              <button onClick={() => changeQty(quantity - 1)} disabled={outOfStock || quantity <= 1} className="px-4 py-2 text-xl hover:bg-white/10 disabled:opacity-40" aria-label="Less">
                −
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                max={fish.stock}
                onChange={(e) => changeQty(e.target.value)}
                disabled={outOfStock}
                className="w-14 bg-transparent text-center outline-none"
                aria-label="Quantity"
              />
              <button onClick={() => changeQty(quantity + 1)} disabled={outOfStock || quantity >= fish.stock} className="px-4 py-2 text-xl hover:bg-white/10 disabled:opacity-40" aria-label="More">
                +
              </button>
            </div>

            <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 px-8 py-3">
              {outOfStock ? "Out of stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}