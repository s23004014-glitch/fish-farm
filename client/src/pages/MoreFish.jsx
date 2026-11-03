import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api/axios.js";
import FishCard from "../components/FishCard.jsx";
import Spinner from "../components/Spinner.jsx";

export default function MoreFish() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    api
      .get("/fish")
      .then((res) => setFish(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Sort the list (copy it first so we do not change the original)
  const sorted = useMemo(() => {
    const list = [...fish];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [fish, sort]);

  return (
    <div className="page-container">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">All Fish</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field !w-auto bg-navy-800"
          aria-label="Sort fish"
        >
          <option className="!w-auti" value="newest">Newest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      {loading ? (
        <Spinner text="Loading fish..." />
      ) : error ? (
        <p className="text-center text-red-300">{error}</p>
      ) : sorted.length === 0 ? (
        <p className="text-center text-white/60">No fish available right now.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((f) => (
            <FishCard key={f._id} fish={f} />
          ))}
        </div>
      )}
    </div>
  );
}