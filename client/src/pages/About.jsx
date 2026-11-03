import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../api/axios.js";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap.js";
import RequestForm from "../components/RequestForm.jsx";
import Reveal from "../components/Reveal.jsx";
import { FARM } from "../config.js";

const highlights = [
  { icon: "🐟", title: "Healthy fish", text: "Every fish is raised with care and checked before it leaves the farm." },
  { icon: "📦", title: "Safe delivery", text: "Fish are packed with oxygen and delivered carefully to your door." },
  { icon: "💬", title: "Friendly advice", text: "Ask us anything about feeding, tanks and keeping your fish happy." },
];

export default function About() {
  const [whatsappLink, setWhatsappLink] = useState(null);
  const [fb, setFb] = useState({ name: "", message: "", anonymous: false });
  const [sending, setSending] = useState(false);
  const root = useRef(null);

  // WhatsApp link comes from the backend .env (ADMIN_WHATSAPP_NUMBER)
  useEffect(() => {
    api
      .get("/contact/info")
      .then((res) => setWhatsappLink(res.data.whatsappLink))
      .catch(() => {});
  }, []);

  // Small loops. They run again when the WhatsApp button appears.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // The three icons float, one after another
      gsap.to(".about-icon", {
        y: -8,
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { each: 0.35, from: "start" },
      });

      // The WhatsApp button pops in, then breathes softly
      if (whatsappLink) {
        gsap.from(".wa-btn", { scale: 0.6, opacity: 0, duration: 0.8, ease: "back.out(2)" });
        gsap.to(".wa-btn", { scale: 1.05, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 });
      }
    },
    { scope: root, dependencies: [whatsappLink] }
  );

  const sendFeedback = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/feedback", {
        // no name means "Anonymous" on the server
        name: fb.anonymous ? undefined : fb.name.trim() || undefined,
        message: fb.message.trim(),
      });
      toast.success("Thank you for your feedback!");
      setFb({ name: "", message: "", anonymous: false });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={root} className="page-container space-y-12">
      {/* 1. Send a request or problem */}
      <Reveal as="section" className="glass-panel p-6 sm:p-8">
        <h1 className="section-title mb-2">Send us a request or problem</h1>
        <p className="mb-6 text-white/60">Tell us what you need and our team will reply to you.</p>
        <RequestForm endpoint="/requests" buttonText="Send request" />
      </Reveal>

      {/* 2. Farm details */}
      <section>
        <Reveal>
          <h2 className="section-title mb-4">About {FARM.name}</h2>
          <p className="max-w-3xl text-white/80">
            We are an ornamental fish farm in Sri Lanka. We sell a small selection of beautiful, healthy fish straight from our
            farm to your home. Because we keep only a few types, we know each one well and can give you honest advice. Stock is
            counted carefully, so what you see on the website is what we really have.
          </p>
        </Reveal>

        {/* The three cards appear one after another */}
        <Reveal stagger={0.15} y={50} className="mt-8 grid gap-5 sm:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="glass-card p-5">
              <p className="about-icon inline-block text-3xl">{h.icon}</p>
              <h3 className="mt-2 font-semibold">{h.title}</h3>
              <p className="mt-1 text-sm text-white/70">{h.text}</p>
            </div>
          ))}
        </Reveal>

        {whatsappLink && (
          <a
            href={`${whatsappLink}?text=${encodeURIComponent("Hello! I have a question about your fish.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-btn btn-primary mt-8 !from-emerald-500 !to-emerald-400 px-8 py-3"
          >
            💬 Chat with us on WhatsApp
          </a>
        )}
      </section>

      {/* 3. Feedback */}
      <Reveal as="section" className="glass-panel p-6 sm:p-8">
        <h2 className="section-title mb-2">Share your feedback</h2>
        <p className="mb-6 text-white/60">Your message will be shown on our Home page. You can stay anonymous.</p>

        <form onSubmit={sendFeedback} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={fb.name}
            onChange={(e) => setFb({ ...fb, name: e.target.value })}
            disabled={fb.anonymous}
            maxLength={50}
            className="input-field disabled:opacity-40"
          />
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={fb.anonymous} onChange={(e) => setFb({ ...fb, anonymous: e.target.checked })} className="accent-aqua-400" />
            Send anonymously
          </label>
          <textarea
            placeholder="Write your feedback..."
            rows={4}
            value={fb.message}
            onChange={(e) => setFb({ ...fb, message: e.target.value })}
            maxLength={500}
            className="input-field"
            required
          />
          <button type="submit" disabled={sending} className="btn-primary px-8">
            {sending ? "Sending..." : "Send feedback"}
          </button>
        </form>
      </Reveal>
    </div>
  );
}