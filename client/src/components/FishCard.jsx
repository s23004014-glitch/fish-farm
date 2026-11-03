import { useId, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { imageUrl, formatPrice, FALLBACK_IMAGE } from "../api/axios.js";

/* ---------------- Fish drawing (used when a fish has no photo) ---------------- */

const SHAPES = {
  classic: {
    tail: "M44 50 C28 34 12 24 2 14 C10 36 10 64 2 86 C12 76 28 66 44 50Z",
    body: "M36 50 C58 14 124 12 160 50 C124 88 58 86 36 50Z",
    dorsal: "M70 26 C86 4 112 6 122 24Z",
    belly: "M84 74 C88 94 106 98 114 80Z",
    stripe: "M98 18 C106 40 106 60 98 82",
    eye: [138, 45],
  },
  disc: {
    tail: "M54 50 C44 42 34 40 24 42 C30 50 30 50 24 58 C34 60 44 58 54 50Z",
    body: "M48 50 C48 6 150 6 158 50 C150 94 48 94 48 50Z",
    dorsal: "M70 16 C90 -8 122 -6 134 18Z",
    belly: "M80 82 C86 104 114 104 126 84Z",
    stripe: "M100 12 C108 40 108 60 100 88",
    eye: [136, 42],
  },
  veil: {
    tail: "M62 50 C42 20 12 0 0 10 C-6 40 -6 60 0 90 C12 100 42 80 62 50Z",
    body: "M56 50 C70 28 124 26 158 50 C124 74 70 72 56 50Z",
    dorsal: "M90 34 C100 6 132 8 138 36Z",
    belly: "M92 64 C94 92 122 98 132 68Z",
    stripe: "M104 30 C110 44 110 56 104 70",
    eye: [142, 46],
  },
};

// Colors by fish name. Add your own fish here.
const PALETTES = [
  { match: /betta|fighter/i, shape: "veil", body: ["#ff5a6e", "#8a1650"], fin: "#ff9a52", stripe: "rgba(255,255,255,0)" },
  { match: /guppy/i, shape: "classic", body: ["#38e0d0", "#1b62d8"], fin: "#ffb347", stripe: "rgba(255,255,255,.5)" },
  { match: /angel/i, shape: "disc", body: ["#f4f7f2", "#8fb1c2"], fin: "#cfe3ee", stripe: "#1d2e38" },
  { match: /discus/i, shape: "disc", body: ["#ff8a3d", "#c2410c"], fin: "#ffd29a", stripe: "#7c2d12" },
  { match: /neon|tetra/i, shape: "classic", body: ["#38b6ff", "#0a3b99"], fin: "#9ef0ff", stripe: "#ff3b57" },
  { match: /gold|oranda/i, shape: "disc", body: ["#ffb020", "#ff5a1f"], fin: "#ffd37a", stripe: "rgba(255,255,255,.45)" },
  { match: /koi/i, shape: "classic", body: ["#ffffff", "#ff7043"], fin: "#ffd0b8", stripe: "#e53935" },
  { match: /oscar/i, shape: "disc", body: ["#4b5563", "#111827"], fin: "#f97316", stripe: "#f97316" },
  { match: /molly|platy/i, shape: "classic", body: ["#a78bfa", "#4c1d95"], fin: "#f0abfc", stripe: "rgba(255,255,255,.4)" },
  { match: /flowerhorn/i, shape: "disc", body: ["#fb7185", "#9f1239"], fin: "#fda4af", stripe: "#fde047" },
  { match: /arowana/i, shape: "classic", body: ["#e5e7eb", "#6b7280"], fin: "#d1d5db", stripe: "rgba(255,255,255,.5)" },
];

// Fish with an unknown name get one of these, always the same one for the same name
const EXTRA = [
  { shape: "classic", body: ["#34d399", "#047857"], fin: "#a7f3d0", stripe: "rgba(255,255,255,.45)" },
  { shape: "disc", body: ["#60a5fa", "#1e3a8a"], fin: "#bfdbfe", stripe: "rgba(255,255,255,.4)" },
  { shape: "classic", body: ["#f472b6", "#9d174d"], fin: "#fbcfe8", stripe: "rgba(255,255,255,.4)" },
];

const artFor = (name = "") => {
  const found = PALETTES.find((p) => p.match.test(name));
  if (found) return found;
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return EXTRA[hash % EXTRA.length];
};

function FishArt({ shape = "classic", body, fin, stripe }) {
  const uid = useId().replace(/:/g, "");
  const s = SHAPES[shape];
  return (
    <svg viewBox="-6 -10 216 120" className="block h-auto w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="1" stopColor={body[1]} />
        </linearGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={fin} stopOpacity=".95" />
          <stop offset="1" stopColor={fin} stopOpacity=".4" />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={s.body} />
        </clipPath>
      </defs>
      <path d={s.tail} fill={`url(#${uid}f)`} />
      <path d={s.dorsal} fill={`url(#${uid}f)`} />
      <path d={s.belly} fill={`url(#${uid}f)`} />
      <path d={s.body} fill={`url(#${uid}b)`} />
      <g clipPath={`url(#${uid}c)`}>
        <path d={s.stripe} stroke={stripe} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M64 32 C92 20 130 24 152 40 C124 34 92 36 66 46Z" fill="rgba(255,255,255,.28)" />
      </g>
      <circle cx={s.eye[0]} cy={s.eye[1]} r="6" fill="#fff" />
      <circle cx={s.eye[0] + 1.6} cy={s.eye[1]} r="3.4" fill="#0a1418" />
    </svg>
  );
}

/* ---------------- Card ---------------- */

const badgeStyle = {
  "In stock": "bg-emerald-500/90",
  "Low stock": "bg-amber-500/95",
  "Out of stock": "bg-red-500/90",
};

export default function FishCard({ fish }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const cardRef = useRef(null);
  const parallaxRef = useRef(null); // moves a little when the mouse moves (SVG fish only)
  const floatRef = useRef(null); // floats up and down (SVG fish only)
  const btnRef = useRef(null);
  const motion = useRef(null); // GSAP setters used by the mouse handlers

  const outOfStock = fish.stock <= 0;
  const hasPhoto = Boolean(fish.image);
  const art = useMemo(() => artFor(fish.name), [fish.name]);

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const card = cardRef.current;
      gsap.set(card, { transformPerspective: 900, transformStyle: "preserve-3d" });

      // 1. Scroll entrance. A small delay per column makes a wave.
      const index = Array.prototype.indexOf.call(card.parentElement.children, card);
      gsap.from(card, {
        opacity: 0,
        y: 60,
        scale: 0.94,
        duration: 0.8,
        delay: (index % 3) * 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 92%", once: true },
      });

      // 2. Smooth 3D tilt. quickTo is the fast way to follow the mouse.
      const follow = { duration: 0.5, ease: "power3.out" };
      motion.current = {
        rx: gsap.quickTo(card, "rotationX", follow),
        ry: gsap.quickTo(card, "rotationY", follow),
      };

      if (parallaxRef.current) {
        gsap.set(parallaxRef.current, { z: 60 }); // the fish stands out of the card
        motion.current.px = gsap.quickTo(parallaxRef.current, "x", follow);
        motion.current.py = gsap.quickTo(parallaxRef.current, "y", follow);
      }

      // 3. The drawn fish floats slowly
      if (floatRef.current) {
        gsap.to(floatRef.current, {
          y: -8,
          rotation: 1.5,
          duration: 1.8 + Math.random(),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
    },
    { scope: cardRef }
  );

  const onMove = (e) => {
    const m = motion.current;
    if (!m || e.pointerType === "touch") return;
    const card = cardRef.current;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

    m.ry((x - 0.5) * 14);
    m.rx(-(y - 0.5) * 14);
    m.px?.(-(x - 0.5) * 20); // the fish moves the other way, which feels deep
    m.py?.(-(y - 0.5) * 12);

    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
  };

  const onLeave = () => {
    const m = motion.current;
    if (!m) return;
    m.rx(0);
    m.ry(0);
    m.px?.(0);
    m.py?.(0);
  };

  // Small happy animation when a fish is added
  const celebrate = contextSafe(() => {
    if (btnRef.current) {
      gsap.fromTo(btnRef.current, { scale: 0.85 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    }
    if (floatRef.current) {
      gsap.fromTo(floatRef.current, { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
    }
  });

  const handleAdd = (e) => {
    e.stopPropagation(); // do not open the details page

    // Visitors must log in first
    if (!user) {
      toast("Please log in to add fish to your cart", { icon: "🔒" });
      navigate("/login", { state: { from: `/fish/${fish._id}` } });
      return;
    }
    if (user.role === "admin") {
      toast.error("Admin accounts cannot buy fish");
      return;
    }

    const result = addToCart(fish, 1);
    if (result.ok) {
      toast.success(`${fish.name}: ${result.message}`);
      celebrate();
    } else {
      toast.error(result.message);
    }
  };

  const openDetails = () => navigate(`/fish/${fish._id}`);

    return (
    <article
      ref={cardRef}
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => e.key === "Enter" && openDetails()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative flex cursor-pointer flex-col rounded-[26px] text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_16px_50px_rgba(34,211,238,0.3)]"
    >
      {/* Liquid glass layer. The blur sits on its own layer so the 3D tilt still works. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/25 bg-gradient-to-br from-white/25 via-white/10 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition-colors duration-300 group-hover:border-aqua-400/60"
      />

      {/* Picture area */}
      <div
        className="relative mx-2.5 mt-2.5 grid h-48 place-items-center rounded-[18px] border border-white/15"
        style={{
          transformStyle: "preserve-3d",
          background: `radial-gradient(70% 90% at 50% 70%, color-mix(in srgb, ${art.body[0]} 40%, transparent), transparent 72%), linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.04))`,
        }}
      >
        {hasPhoto ? (
          <img
            src={imageUrl(fish.image)}
            alt={fish.name}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            className={`absolute inset-0 h-full w-full rounded-[18px] object-cover ${outOfStock ? "grayscale-[0.6]" : ""}`}
          />
        ) : (
          <div
            ref={parallaxRef}
            className={`w-[58%] ${outOfStock ? "opacity-70 grayscale-[0.5]" : ""}`}
            style={{ filter: "drop-shadow(0 18px 14px rgba(0,10,30,.45))" }}
          >
            <div ref={floatRef}>
              <FishArt {...art} />
            </div>
          </div>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur ${badgeStyle[fish.stockStatus] || badgeStyle["In stock"]}`}
          style={{ transform: "translateZ(40px)" }}
        >
          {fish.stockStatus}
        </span>
      </div>

      {/* Details */}
      <div className="relative flex flex-1 flex-col p-5 pt-4" style={{ transform: "translateZ(20px)" }}>
        <h3 className="text-[1.4rem] font-extrabold leading-tight tracking-tight">{fish.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-[3.1em] text-[0.98rem] leading-relaxed text-white/75">
          {fish.description || "A healthy, beautiful fish from our farm."}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[0.82rem] text-white/55">Size</dt>
            <dd className="mt-0.5 text-[0.94rem] font-bold">{fish.size || "-"}</dd>
          </div>
          <div>
            <dt className="text-[0.82rem] text-white/55">Availability</dt>
            <dd className="mt-0.5 text-[0.94rem] font-bold">
              {outOfStock ? "Sold out" : fish.stockStatus === "Low stock" ? `Only ${fish.stock} left` : `${fish.stock} available`}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <strong className="text-[1.15rem] text-aqua-300">{formatPrice(fish.price)}</strong>
          <button
            ref={btnRef}
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Add ${fish.name} to cart`}
            className="rounded-full border border-white/20 bg-gradient-to-r from-aqua-400 to-ocean-600 px-[18px] py-2.5 text-sm font-bold text-white shadow-lg transition duration-200 hover:-translate-y-px hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100"
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Light that follows the mouse */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: "radial-gradient(circle at var(--gx, 50%) var(--gy, 0%), rgba(255,255,255,.28), transparent 45%)" }}
      />
    </article>
  );
}