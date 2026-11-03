import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios.js";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap.js";
import SearchBar from "../components/SearchBar.jsx";
import FishCard from "../components/FishCard.jsx";
import FeedbackList from "../components/FeedbackList.jsx";
import Reveal from "../components/Reveal.jsx";
import Spinner from "../components/Spinner.jsx";
import { FARM } from "../config.js";

// Bubble sizes and positions (fixed values, so React renders the same every time)
const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 8 + ((i * 7) % 22),
  left: 4 + ((i * 53) % 92),
}));

export default function Home() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const heroRef = useRef(null);
  const videoWrapRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    api
      .get("/fish")
      .then((res) => setFish(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // The page gets taller after the fish load, so scroll positions must be measured again
  useEffect(() => {
    if (!loading) ScrollTrigger.refresh();
  }, [loading]);

  // Hero animations
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const hero = heroRef.current;

      // 1. Intro: video zooms out slowly, headline words rise, text and buttons fade in
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".hero-video", { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
        .from(".hero-word", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.2)
        .from(".hero-fade", { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.4");

      // 2. Scrolling down: the video moves slower than the page, the text fades away
      gsap.to(videoWrapRef.current, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(contentRef.current, {
        yPercent: -12,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      // 3. Bubbles rise from the bottom, each one with its own speed and wobble
      hero.querySelectorAll(".hero-bubble").forEach((bubble) => {
        const duration = gsap.utils.random(7, 14);
        gsap
          .timeline({ repeat: -1, delay: gsap.utils.random(0, 8) })
          .fromTo(bubble, { y: 0, opacity: 0 }, { opacity: 0.6, duration: duration * 0.15, ease: "none" }, 0)
          .to(bubble, { y: () => -hero.offsetHeight, duration, ease: "none" }, 0)
          .to(bubble, { x: gsap.utils.random(-30, 30), duration: duration / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
          .to(bubble, { opacity: 0, duration: duration * 0.2, ease: "none" }, duration * 0.8);
      });

      // 4. The small arrow at the bottom bounces
      gsap.to(".hero-cue", { y: 10, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut" });
    },
    { scope: heroRef }
  );

  const scrollToFish = () => document.getElementById("fish")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      {/* 1. Hero with background video */}
      <section
        ref={heroRef}
        className="relative flex h-screen min-h-[600px] items-center justify-center overflow-hidden bg-gradient-to-br from-navy-900 via-ocean-700 to-lagoon-600"
      >
        {/* The wrapper is taller than the hero so the parallax never shows an empty edge */}
        <div ref={videoWrapRef} className="absolute inset-x-0 -top-[10%] h-[120%]">
          <video className="hero-video h-full w-full object-cover" src="/hero-video.mp4" autoPlay muted loop playsInline />
        </div>

        {/* Dark overlay so the text is easy to read */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/40 to-navy-900" />

        {/* Bubbles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {BUBBLES.map((b) => (
            <span
              key={b.id}
              className="hero-bubble absolute bottom-0 rounded-full border border-white/40 bg-white/10 opacity-0"
              style={{ width: b.size, height: b.size, left: `${b.left}%` }}
            />
          ))}
        </div>

        <div ref={contentRef} className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <span className="hero-word inline-block">Bring the</span>
            </span>{" "}
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <span className="hero-word inline-block bg-gradient-to-r from-aqua-300 to-lagoon-400 bg-clip-text text-transparent">Ocean</span>
            </span>{" "}
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <span className="hero-word inline-block">Home</span>
            </span>
          </h1>

          <p className="hero-fade mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            {FARM.tagline}. Healthy fish, safe delivery and friendly advice, straight from our farm.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button onClick={scrollToFish} className="hero-fade btn-primary px-8 py-3 text-lg">
              Shop Fish
            </button>
            <Link to="/about" className="hero-fade btn-outline px-8 py-3 text-lg">
              About Us
            </Link>
          </div>
        </div>

        <div className="hero-fade absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs tracking-widest text-white/60">
          <p>SCROLL</p>
          <p className="hero-cue text-lg">↓</p>
        </div>
      </section>

      {/* 2. Search bar (live results, fuzzy) */}
      <SearchBar fishList={fish} focusKey={location.state?.focusSearch} />

      {/* 3. Fish cards (first 9). Each card animates by itself. */}
      <section id="fish" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="section-title mb-8 text-center">Our Fish</h2>
        </Reveal>

        {loading ? (
          <Spinner text="Loading fish..." />
        ) : error ? (
          <p className="text-center text-red-300">{error}</p>
        ) : fish.length === 0 ? (
          <p className="text-center text-white/60">No fish available right now.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fish.slice(0, 9).map((f) => (
                <FishCard key={f._id} fish={f} />
              ))}
            </div>
            {fish.length > 9 && (
              <div className="mt-10 text-center">
                <Link to="/fish" className="btn-primary px-8 py-3">
                  View More
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. Feedback */}
      <FeedbackList />
    </div>
  );
}