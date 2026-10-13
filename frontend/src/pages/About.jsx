import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import Bubbole from "../components/Bubbole";

/* ------------------------------------------------------------------ */
/* Small inline line icons — no external icon library needed          */
/* ------------------------------------------------------------------ */
function CatalogIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function PulseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12h4l2 6 4-12 2 6h8" />
    </svg>
  );
}

function DeliveryIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

const pillars = [
  {
    icon: CatalogIcon,
    title: "Farm-direct sourcing",
    body: "Every listing traces back to a certified farm, not a warehouse. You see the species, the breeder, and the batch before you buy.",
  },
  {
    icon: PulseIcon,
    title: "Live stock, live pulse",
    body: "Stock levels update the moment they change on the farm side, so the number on your screen is the number in the tank.",
  },
  {
    icon: DeliveryIcon,
    title: "Careful delivery",
    body: "Orders are packed and shipped by people who know fish, with routes chosen to keep transit time — and stress — as low as possible.",
  },
];

const steps = [
  { title: "Browse the live catalog", body: "Filter by name or species and see real-time stock straight from the farm." },
  { title: "Place your order", body: "Add a fish to your order, choose shipping, and check out securely." },
  { title: "We validate stock", body: "Before anything ships, we confirm the fish is still available — no surprise cancellations." },
  { title: "The farm ships direct", body: "Your order leaves the farm in temperature-controlled, oxygenated packaging." },
];

const stats = [
  { value: "48+", label: "Partner farms" },
  { value: "320+", label: "Species tracked" },
  { value: "12,000+", label: "Orders shipped" },
  { value: "98%", label: "Stock accuracy" },
];

export default function About() {
  const bannerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-eyebrow", { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" });
      gsap.from(".about-heading", { opacity: 0, y: 24, duration: 0.6, ease: "power3.out", delay: 0.1 });
      gsap.from(".about-subtext", { opacity: 0, y: 16, duration: 0.5, ease: "power3.out", delay: 0.25 });
    }, bannerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* ---------------- Banner ---------------- */}
        <section ref={bannerRef} className="bg-[var(--color-abyss)] py-16 text-[var(--color-sand)] md:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
            <span className="about-eyebrow text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-coral)]">
              Our story
            </span>
            <h1 className="about-heading mt-4 text-4xl font-semibold leading-[1.1] md:text-5xl">
              Built for farms. Trusted by buyers.
            </h1>
            <p className="about-subtext mt-5 text-base leading-relaxed text-[rgba(245,239,225,0.75)] md:text-lg">
              AquaPulse connects independent aquaculture farms directly with buyers, so
              healthy fish move from tank to doorstep with fewer hands — and less guesswork
              — in between.
            </p>
          </div>
        </section>

        {/* ---------------- Pillars ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,92,102,0.12)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,107,74,0.12)] text-[var(--color-coral)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- How it works (genuine sequence — numbered) ---------------- */}
        <section className="bg-[rgba(15,92,102,0.05)] py-16">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-10 max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-reef)]">
                From tank to doorstep
              </span>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
                How it works
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title}>
                  <span className="font-data text-sm font-semibold text-[var(--color-coral)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-[var(--color-ink)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Stats band ---------------- */}
        <section className="bg-[var(--color-abyss)] py-14 text-[var(--color-sand)]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 text-center md:grid-cols-4 md:px-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-data text-3xl font-semibold text-[var(--color-seafoam)] md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[rgba(245,239,225,0.65)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-4xl px-5 py-16 text-center md:px-8">
          <h2 className="text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
            Ready to see what&rsquo;s in stock?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)]">
            Browse the live catalog, or reach out if you&rsquo;re a farm looking to list.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary text-[var(--color-abyss)]">
              Browse the catalog
            </Link>
            <Link
              to="/contact"
              className="btn-outline border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]"
            >
              Partner your farm
            </Link>
          </div>
        </section>
      </main>
      <Bubbole count={16} />
    </>
  );
}
