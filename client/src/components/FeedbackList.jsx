import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Reveal from "./Reveal.jsx";
import Spinner from "./Spinner.jsx";

export default function FeedbackList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api
      .get("/feedback")
      .then((res) => setList(res.data))
      .catch(() => {}) // if it fails we just show nothing
      .finally(() => setLoading(false));
  }, []);

  const visible = showAll ? list : list.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="section-title mb-8 text-center">What Our Buyers Say</h2>
      </Reveal>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <p className="text-center text-white/60">No feedback yet. Be the first to write one on the About page!</p>
      ) : (
        <>
          {/* stagger: the cards appear one after another */}
          <Reveal stagger={0.12} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <div key={item._id} className="glass-panel p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aqua-400 to-ocean-600 font-bold">
                    {item.name?.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-white/50">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/80">{item.message}</p>
              </div>
            ))}
          </Reveal>

          {list.length > 6 && (
            <div className="mt-8 text-center">
              <button onClick={() => setShowAll((s) => !s)} className="btn-outline">
                {showAll ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}