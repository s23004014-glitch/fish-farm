import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import { fishData } from "../data/fish"; // adjust path if different
import Bubbole from "../components/Bubbole";

/* ------------------------------------------------------------------ */
/* Farm details aren't stored on the Fish model in the backend (only   */
/* `farm` as a plain string) — kept here as a local lookup keyed by    */
/* farm name until a dedicated Farm collection exists.                 */
/* ------------------------------------------------------------------ */
const farmDetails = {
  "Coral Bay Hatchery": { location: "Coral Bay, Gulf Coast", since: "2019", certs: ["Disease-free tested", "Line-bred for color"], blurb: "A small-batch betta breeder specializing in line-bred colors and show-quality finnage." },
  "Tidewater Farms": { location: "Tidewater Delta", since: "2021", certs: ["Sustainably farmed", "Bulk shoal specialist"], blurb: "Raises schooling fish in large outdoor pond systems for hardier, well-adjusted stock." },
  "Blue Horizon Aquafarm": { location: "Blue Horizon Valley", since: "2018", certs: ["Disease-free tested", "Selective breeding program"], blurb: "Discus specialists running a multi-generation selective breeding program for color and shape." },
  "Lagoon Breeders Co.": { location: "Lagoon Hills", since: "2017", certs: ["Championship bloodlines", "Pond-raised"], blurb: "A koi farm carrying championship bloodlines, raised in open ponds for size and vigor." },
  "Reeftrail Aquaculture": { location: "Reeftrail Coast", since: "2020", certs: ["Captive-bred, reef-safe", "Disease-free tested"], blurb: "Captive-breeds marine species to reduce pressure on wild reef populations." },
  "Mistvale Fisheries": { location: "Mistvale Basin", since: "2019", certs: ["Disease-free tested"], blurb: "A freshwater generalist farm known for consistent, healthy community fish." },
  "Sunspire Hatchery": { location: "Sunspire Flats", since: "2022", certs: ["High-volume breeder", "Sustainably farmed"], blurb: "High-volume livebearer specialists with fast, sustainable breeding cycles." },
  "Northshoal Farms": { location: "Northshoal Bay", since: "2016", certs: ["Disease-free tested", "Cichlid specialist"], blurb: "A cichlid-focused farm raising large, personable fish for experienced keepers." },
};

const specLabels = [
  ["tank", "Tank size"],
  ["temp", "Water temp"],
  ["ph", "pH range"],
  ["diet", "Diet"],
  ["temperament", "Temperament"],
  ["size", "Max size"],
  ["lifespan", "Lifespan"],
];


/* Same illustration style as Home.jsx, kept local to this file */
function FishIcon({ className = "", style, innerRef, tailRef }) {
  return (
    <svg ref={innerRef} style={style} viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M40,60 C40,30 90,15 130,25 C160,33 168,50 168,60 C168,70 160,87 130,95 C90,105 40,90 40,60 Z" fill="currentColor" />
      <path ref={tailRef} d="M166,60 L198,32 C186,48 186,72 198,88 L166,60 Z" fill="currentColor" opacity="0.85" />
      <path d="M92,24 C97,8 118,6 123,20 C112,27 101,27 92,24 Z" fill="currentColor" opacity="0.75" />
      <path d="M92,96 C97,112 116,113 121,99 C110,93 100,93 92,96 Z" fill="currentColor" opacity="0.75" />
      <path d="M104,64 C93,75 79,78 72,71 C83,66 94,63 104,64 Z" fill="currentColor" opacity="0.6" />
      <path d="M142,38 C148,48 148,72 142,82" stroke="#0B2030" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="128" cy="50" r="5.5" fill="#0B2030" />
      <circle cx="129.5" cy="48.5" r="1.6" fill="#F5EFE1" />
    </svg>
  );
}

const badgeDot = {
  checking: "bg-[var(--color-reef)]",
  "In stock": "bg-[var(--color-seafoam)]",
  "Low stock": "bg-[var(--color-coral)]",
  "Sold out": "bg-[var(--color-ink-soft)]",
};

const badgeText = {
  checking: "Validating stock…",
  "In stock": "Verified in stock",
  "Low stock": "Low stock — verified",
  "Sold out": "Sold out",
};

export default function ListingDetail() {
  const { id } = useParams();


  // Local lookup instead of a fetch — String() guards against id being a number in fishData
  const fish = fishData.find((f) => String(f.id) === id) ?? null;
  const notFound = !fish;

  const rootRef = useRef(null);
  const fishBodyRef = useRef(null);
  const tailRef = useRef(null);
  const badgeRef = useRef(null);

  const [checking, setChecking] = useState(true);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (fish) document.title = `${fish.name} · AquaPulse`;
  }, [fish]);

  // Simulated live stock validation — the moment this page exists to demonstrate.
  // The stock status already came from local data above; this brief
  // "checking" state is just a trust-building UI beat.
  useEffect(() => {
    if (!fish) return;
    setChecking(true);
    const t = setTimeout(() => setChecking(false), 900);
    return () => clearTimeout(t);
  }, [fish]);

  useEffect(() => {
    if (!checking && badgeRef.current) {
      gsap.fromTo(badgeRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }

  }, [checking]);

  useEffect(() => {
    if (!fish) return;
    const ctx = gsap.context(() => {
      gsap.from(".listing-fade", { opacity: 0, y: 16, duration: 0.5, stagger: 0.06, ease: "power3.out" });
      gsap.to(fishBodyRef.current, { y: -8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(tailRef.current, { rotation: 10, transformOrigin: "10% 50%", duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, rootRef);
    return () => ctx.revert();
  }, [fish]);

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Listing not found</h1>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            That fish may have sold out and been removed, or the link is out of date.
          </p>
          <Link to="/" className="btn-primary mt-6 inline-flex text-[var(--color-abyss)]">
            Back to catalog
          </Link>
        </main>
      </>
    );
  }

  const farm = farmDetails[fish.farm];
  const soldOut = fish.stock === "Sold out";
  const subtotal = fish.price * qty;

  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />
      <main className="bg-[#acf1f1]">
        <Bubbole count={14} />
        <section ref={rootRef} className=" mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="listing-fade text-sm text-[var(--color-ink-soft)]">
          <Link to="/" className="hover:text-[var(--color-reef)]">Catalog</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-ink)]">{fish.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr]">
          {/* ---------------- Visual ---------------- */}
          <div className="listing-fade relative flex items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-abyss)] py-16">
            <span className="pulse-ring absolute h-56 w-56 rounded-full border border-[rgba(255,107,74,0.35)]" aria-hidden="true" />
            <FishIcon
              innerRef={fishBodyRef}
              tailRef={tailRef}
              className="relative h-48 w-48 drop-shadow-[0_20px_30px_rgba(15,92,102,0.35)]"
              style={{ color: fish.color }}
            />
          </div>

          {/* ---------------- Info ---------------- */}
          <div className="listing-fade">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-reef)]">
              {fish.farm}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">{fish.name}</h1>

            <p className="mt-1 text-sm italic text-[var(--color-ink-soft)]">{fish.species}</p>

            {/* Stock validation */}
            <div ref={badgeRef} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(11,32,48,0.05)] px-3 py-1.5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                {checking && (
                  <span className={`pulse-ring absolute inline-flex h-full w-full rounded-full ${badgeDot.checking}`} />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${badgeDot[checking ? "checking" : fish.stock]}`} />
              </span>
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                {badgeText[checking ? "checking" : fish.stock]}
              </span>
            </div>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {fish.description}
            </p>

            {/* Spec table */}
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-[rgba(11,32,48,0.08)] py-6 text-sm sm:grid-cols-3">
              {specLabels.map(([key, label]) => (
                <div key={key}>
                  <dt className="text-[var(--color-ink-soft)]">{label}</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">{fish.specs[key]}</dd>
                </div>
              ))}
            </dl>

            {/* Price calculator */}
            <div className="mt-6 rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="font-data text-2xl font-semibold text-[var(--color-reef)]">
                    Rs{fish.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-[var(--color-ink-soft)]">per fish</p>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-[rgba(11,32,48,0.15)] px-2 py-1">
                  <button
                    type="button"
                    disabled={soldOut || qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors duration-200 hover:bg-[rgba(11,32,48,0.06)] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-data text-sm font-semibold">{qty}</span>
                  <button
                    type="button"
                    disabled={soldOut || qty >= 20}
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors duration-200 hover:bg-[rgba(11,32,48,0.06)] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <dl className="mt-5 space-y-1.5 text-sm">
                <div className="flex justify-between text-[var(--color-ink-soft)]">
                  <dt>Subtotal ({qty} fish)</dt>
                  <dd className="font-data">Rs{subtotal.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between text-[var(--color-ink-soft)]">
                  <dt>Shipping</dt>
                  <dd className="font-data">{shipping === 0 ? "Free" : `Rs${shipping.toFixed(2)}`}</dd>
                </div>
                <div className="flex justify-between border-t border-[rgba(11,32,48,0.08)] pt-2 text-base font-semibold text-[var(--color-ink)]">
                  <dt>Total</dt>
                  <dd className="font-data">Rs{total.toFixed(2)}</dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={soldOut}
                onClick={() => {
                  // No cart context yet — just confirms the interaction for frontend testing
                  setNotice(`Added ${qty} × ${fish.name} to your cart.`);
                }}
                className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                {soldOut ? "Sold out" : "Add to order"}
              </button>
              {notice && (
                <p className="mt-3 text-center text-xs text-[var(--color-ink-soft)]">
                  {notice}{" "}
                  <Link to="/checkout" className="font-semibold text-[var(--color-reef)] hover:underline">
                    Go to checkout →
                  </Link>
                </p>
              )}
            </div>

            {/* Farm details */}

            {farm && (
              <div className="mt-6 rounded-2xl border border-[rgba(11,32,48,0.08)] p-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">From {fish.farm}</h3>
                <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                  {farm.location} · Partner since {farm.since}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">{farm.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {farm.certs.map((cert) => (
                    <span
                      key={cert}
                      className="rounded-full bg-[rgba(127,217,196,0.2)] px-3 py-1 text-xs font-semibold text-[#0f5c4a]"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      </main>
    </>
  );
}