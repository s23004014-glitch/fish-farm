import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Navbar from "../components/Navbar";
import { fishData } from "../data/fish";
import heroFish from "../assets/hero.png"; // adjust path to wherever hero.png actually lives
import Bubbole from "../components/Bubbole";

gsap.registerPlugin(useGSAP);
/* ------------------------------------------------------------------ */
/* Original fish illustration (no stock photos, animates cleanly)     */
/* ------------------------------------------------------------------ */


const badgeStyles = {
  "In stock": "bg-[rgba(127,217,196,0.25)] text-[#0f5c4a]",
  "Low stock": "bg-[rgba(255,107,74,0.15)] text-[var(--color-coral)]",
  "Sold out": "bg-[rgba(11,32,48,0.06)] text-[var(--color-ink-soft)]",
};

function FishCard({ fish }) {
  return (
    <Link
      to={`/listing/${fish.id}`}
      className="card-fish group relative flex flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/10 shadow-[0_8px_32px_rgba(15,92,102,0.15)] backdrop-blur-xl transition-all duration-500 [transform-style:preserve-3d] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(15,92,102,0.3)] hover:[transform:perspective(1000px)_rotateX(3deg)_rotateY(-3deg)_translateY(-8px)] glass"
    >
      {/* subtle glass shine overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60 " />

      <div className="relative flex items-center justify-center bg-[rgba(7,27,43,0.04)]">
        <img
          src={fish.img}
          alt={fish.name}
          className="object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-seafoam)]">{fish.name}</h3>
          </div>
          <span
            className={`whitespace-nowrap text-white rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              badgeStyles[fish.stock]
            }`}
          >
            {fish.stock}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">

          <span className="font-data text-sm font-semibold text-white">
            ${fish.price.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-[var(--color-coral)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [fish] = useState(fishData);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const heroRef = useRef(null);
  const fishWrapRef = useRef(null);
  const fishBodyRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.5 })
      .from(".hero-heading", { opacity: 0, y: 24, duration: 0.6 }, "-=0.25")
      .from(".hero-subtext", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
      .from(".hero-but", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
      .from(fishWrapRef.current, { opacity: 0, scale: 0.85, duration: 0.7 }, "-=0.5");

    gsap.to(fishBodyRef.current, {
      y: -10,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, { scope: heroRef });

  const handleFilter = (e) => {
    e.preventDefault();
    setAppliedQuery(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    setAppliedQuery("");
  };

  const filteredFish = appliedQuery
    ? fish.filter((f) => f.name.toLowerCase().includes(appliedQuery.toLowerCase()))
    : fish;

  // Also switched to useGSAP for the same StrictMode-safety
  useGSAP(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, { scope: cardsRef, dependencies: [filteredFish] });

  return (
    <>
      <Navbar />
      <main className="bg-[#0e3a52]">
        {/* ---------------- Hero ---------------- */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-[#393a9a] pb-20 text-[var(--color-sand)] md:pb-20"
        >
          <div className="glow-orb absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full" />
          <div className="glow-orb absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full" style={{ animationDelay: '2s' }} />
          <Bubbole count={14} />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 md:grid-cols-2 md:gap-12 md:px-8">
            <div>
              <span className="hero-eyebrow text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-coral)]">
                Farm-direct aquatics
              </span>
              <h1 className="hero-heading mt-4 text-4xl font-semibold leading-[1.1] md:text-5xl lg:text-6xl">
                buy <span className="text-shimmer">what you want.</span>
              </h1>
              <p className="hero-subtext mt-5 max-w-md text-base leading-relaxed text-[rgba(245,239,225,0.75)] md:text-lg">
                Browse live inventory straight from trusted fish farms, watch stock update
                the moment it changes, and get healthy fish delivered with care.
              </p>
              <div className="hero-but mt-8 flex flex-wrap gap-3">
                <a href="#catalog" className="hero-cta btn-primary">
                  Browse the catalog
                </a>
                <Link to="/auth" className="hero-cta btn-outline">
                  Become a buyer
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <span
                className="pulse-ring absolute h-56 w-56 rounded-full border border-[rgba(255,107,74,0.4)] md:h-72 md:w-72"
                aria-hidden="true"
              />
              <span
                className="pulse-ring absolute h-56 w-56 rounded-full border border-[rgba(255,107,74,0.4)] [animation-delay:1.1s] md:h-72 md:w-72"
                aria-hidden="true"
              />
              <div ref={fishWrapRef} className="relative">
                <div ref={fishWrapRef} className="relative">
                  <div ref={fishWrapRef} className="relative">
                    <img
                      ref={fishBodyRef}
                      src={heroFish}
                      alt="Featured fish"
                      className="h-[40rem] w-[40rem] object-contain drop-shadow-[0_20px_30px_rgba(15,92,102,0.35)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Filter bar ---------------- */}
        <section className="relative z-10 mx-auto -mt-8 max-w-4xl px-5 md:-mt-14 md:px-8">
          <form
            onSubmit={handleFilter}
            className="flex flex-col gap-3 rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-4 shadow-[0_20px_40px_rgba(15,92,102,0.12)] sm:flex-row sm:items-center"
          >
            <label htmlFor="fish-search" className="sr-only">
              Search fish by name
            </label>
            <input
              id="fish-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, e.g. Betta"
              className="w-full flex-1 rounded-xl border border-[rgba(11,32,48,0.12)] bg-[rgba(245,239,225,0.5)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 sm:flex-none">
                Filter
              </button>
              {appliedQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] transition-colors duration-200 hover:text-[var(--color-coral)]"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ---------------- Catalog grid ---------------- */}
        <section id="catalog" className="bg-[#0e3a52]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="mb-8 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-seafoam)]">
              Live inventory
            </span>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Fresh from the farm
              </h2>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {filteredFish.length} of {fish.length} fish shown
              </p>
            </div>
          </div>

          {filteredFish.length > 0 ? (
            <div
              ref={cardsRef}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredFish.map((f) => (
                <FishCard key={f.id} fish={f} />
              ))}
            </div>
          ) : fish.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(11,32,48,0.15)] bg-[rgba(255,255,255,0.6)] px-6 py-14 text-center">
              <p className="font-display text-lg font-semibold text-[var(--color-ink)]">The catalog is empty right now</p>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Check back soon, or ask an admin to add listings.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[rgba(11,32,48,0.15)] bg-[rgba(255,255,255,0.6)] px-6 py-14 text-center">
              <p className="font-display text-lg font-semibold text-[var(--color-ink)]">
                No fish match &ldquo;{appliedQuery}&rdquo;
              </p>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Try another name, or clear the filter to see the full catalog.
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="btn-outline mt-5 border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
        </section>
      </main>
    </>
  );
}