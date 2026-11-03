import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

export default function ManageBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/admin/buyers")
      .then((res) => setBuyers(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return buyers;
    return buyers.filter((b) => [b.name, b.email, b.phone].some((v) => v?.toLowerCase().includes(text)));
  }, [buyers, search]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-300">{error}</p>;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">Buyers ({buyers.length})</h2>

      <input type="text" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-md" />

      <div className="glass-panel overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-white/15 text-white/60">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visible.map((b) => (
              <tr key={b._id}>
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3">{b.email}</td>
                <td className="p-3">{b.phone || "-"}</td>
                <td className="p-3 text-white/60">{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/50">No buyers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}