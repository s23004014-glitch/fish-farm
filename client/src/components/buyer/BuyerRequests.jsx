import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios.js";
import RequestForm from "../RequestForm.jsx";
import Spinner from "../Spinner.jsx";

export default function BuyerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/requests/my");
      setRequests(data);
    } catch {
      // show an empty list if it fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* New request */}
      <section className="glass-panel p-6">
        <h2 className="mb-1 text-2xl font-semibold">Send a problem or request</h2>
        <p className="mb-5 text-sm text-white/60">Tell the farm admin about any problem with an order or ask for a special fish.</p>
        <RequestForm endpoint="/requests" buttonText="Send to admin" onSent={load} />
      </section>

      {/* History */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold">Request history</h2>

        {loading ? (
          <Spinner />
        ) : requests.length === 0 ? (
          <p className="text-white/60">You have not sent any requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r._id} className="rounded-xl bg-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{r.subject}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.status === "Resolved" ? "bg-emerald-500/80" : "bg-amber-500/80"}`}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/70">{r.message}</p>
                <p className="mt-2 text-xs text-white/40">{new Date(r.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}