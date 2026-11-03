import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Open");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api
      .get("/admin/requests")
      .then((res) => setRequests(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const resolve = async (request) => {
    setBusyId(request._id);
    try {
      const { data } = await api.put(`/admin/requests/${request._id}/resolve`);
      setRequests((list) => list.map((r) => (r._id === data._id ? { ...r, status: data.status } : r)));
      toast.success("Marked as resolved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner />;

  const visible = filter === "All" ? requests : requests.filter((r) => r.status === filter);
  const openCount = requests.filter((r) => r.status === "Open").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Buyer problems and requests ({openCount} open)</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto bg-navy-800" aria-label="Filter">
          <option>Open</option>
          <option>Resolved</option>
          <option>All</option>
        </select>
      </div>

      {visible.length === 0 && <p className="text-center text-white/50">Nothing here.</p>}

      {visible.map((r) => (
        <article key={r._id} className="glass-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold">{r.subject}</p>
              <p className="text-sm text-white/60">
                {r.name} ({r.email})
                {r.user && <span className="ml-2 rounded-full bg-aqua-400/20 px-2 py-0.5 text-xs text-aqua-300">Buyer</span>}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.status === "Resolved" ? "bg-emerald-500/80" : "bg-amber-500/80"}`}>{r.status}</span>
          </div>

          <p className="mt-3 whitespace-pre-line text-white/80">{r.message}</p>
          <p className="mt-2 text-xs text-white/40">{new Date(r.createdAt).toLocaleString()}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`mailto:${r.email}?subject=${encodeURIComponent("Re: " + r.subject)}`}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm hover:bg-white/20"
            >
              Reply by email
            </a>
            {r.status === "Open" && (
              <button onClick={() => resolve(r)} disabled={busyId === r._id} className="rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/30">
                Mark as resolved
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}