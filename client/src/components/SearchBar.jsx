import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import FishCard from "./FishCard.jsx";

// fishList = all fish from the backend. focusKey changes when we want to focus the box.
export default function SearchBar({ fishList = [], focusKey }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Fuse.js finds fish even with spelling mistakes (example: "gupy" finds "Guppy")
  const fuse = useMemo(
    () =>
      new Fuse(fishList, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "description", weight: 0.2 },
          { name: "size", weight: 0.1 },
        ],
        threshold: 0.4, // lower = stricter, higher = more forgiving
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [fishList]
  );

  // Results update on every letter
  const results = useMemo(() => {
    const text = query.trim();
    if (!text) return [];
    return fuse.search(text).map((r) => r.item);
  }, [query, fuse]);

  // Focus the box when asked (from the Navbar search icon)
  useEffect(() => {
    if (focusKey) {
      document.getElementById("search")?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    }
  }, [focusKey]);

  const hasQuery = query.trim().length > 0;

  return (
    <section id="search" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto max-w-2xl p-4">
        <div className="relative">
          <input
            id="search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fish... (try: guppy, betta, koi)"
            className="input-field pr-10 text-lg"
            autoComplete="off"
          />
          {hasQuery && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="mt-8">
          {results.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-white/60">
                {results.length} fish found
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((fish) => (
                  <FishCard key={fish._id} fish={fish} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-white/60">No fish found. Try another name.</p>
          )}
        </div>
      )}
    </section>
  );
}