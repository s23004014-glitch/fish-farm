import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

export default function ManageFeedback() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/feedback")
      .then((res) => setList(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (item) => {
    if (!window.confirm("Delete this feedback? It will disappear from the Home page.")) return;
    try {
      await api.delete(`/admin/feedback/${item._id}`);
      setList((old) => old.filter((f) => f._id !== item._id));
      toast.success("Feedback deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">Feedback ({list.length})</h2>
      <p className="text-sm text-white/50">Shows the latest 50 messages. These are the same ones shown on the Home page.</p>

      {list.length === 0 && <p className="text-center text-white/50">No feedback yet.</p>}

      {list.map((f) => (
        <article key={f._id} className="glass-panel flex items-start justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">{f.name}</p>
            <p className="mt-1 text-white/80">{f.message}</p>
            <p className="mt-2 text-xs text-white/40">{new Date(f.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => remove(f)} className="shrink-0 rounded-full bg-coral-500/20 px-4 py-1.5 text-sm text-coral-400 hover:bg-coral-500/30">
            Delete
          </button>
        </article>
      ))}
    </div>
  );
}