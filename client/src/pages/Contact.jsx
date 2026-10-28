import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

const topics = ["General question", "I'm a buyer", "I'm a farm / partner"];

const faqs = [
  {
    q: "How does stock validation work?",
    a: "When you place an order, we ping the farm's current inventory before confirming — so you never pay for a fish that's already sold.",
  },
  {
    q: "Can I order as a business?",
    a: "Yes. Select \"I'm a buyer\" below and mention your business in the message — we'll set you up with volume pricing where it applies.",
  },
  {
    q: "What are typical delivery times?",
    a: "Most orders ship within 1–2 business days of stock validation, with transit time depending on your region and the species ordered.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-[rgba(11,32,48,0.1)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[var(--color-ink)]">{item.q}</span>
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(11,32,48,0.15)] text-[var(--color-reef)] transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="pb-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">{item.a}</p>
      </div>
    </div>
  );
}

export default function Contact() {
  const bannerRef = useRef(null);
  const successRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", topic: topics[0], message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-eyebrow", { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" });
      gsap.from(".contact-heading", { opacity: 0, y: 24, duration: 0.6, ease: "power3.out", delay: 0.1 });
      gsap.from(".contact-subtext", { opacity: 0, y: 16, duration: 0.5, ease: "power3.out", delay: 0.25 });
    }, bannerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (submitted && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [submitted]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend wired up yet — this just confirms the message locally.
    setSubmitted(true);
  };

  const handleNewMessage = () => {
    setForm({ name: "", email: "", topic: topics[0], message: "" });
    setSubmitted(false);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* ---------------- Banner ---------------- */}
        <section ref={bannerRef} className="bg-[var(--color-abyss)] py-16 text-[var(--color-sand)] md:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
            <span className="contact-eyebrow text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-coral)]">
              Get in touch
            </span>
            <h1 className="contact-heading mt-4 text-4xl font-semibold leading-[1.1] md:text-5xl">
              We&rsquo;re here to help.
            </h1>
            <p className="contact-subtext mt-5 text-base leading-relaxed text-[rgba(245,239,225,0.75)] md:text-lg">
              Question about an order, a species, or partnering your farm with us? Send a
              message and a real person will get back to you.
            </p>
          </div>
        </section>

        {/* ---------------- Form + info ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
            {/* Form */}
            <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-6 shadow-[0_20px_35px_rgba(15,92,102,0.08)] sm:p-8">
              {submitted ? (
                <div ref={successRef}>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(127,217,196,0.25)] text-[#0f5c4a]">
                    ✓
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-[var(--color-ink)]">Message sent</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                    Thanks, {form.name || "there"} — we&rsquo;ve got your message and will reply at{" "}
                    {form.email || "the address you gave us"} within one business day.
                  </p>
                  <button type="button" onClick={handleNewMessage} className="btn-outline mt-6 border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="text-sm font-semibold text-[var(--color-ink)]">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange("name")}
                        placeholder="Jane Rivera"
                        className="mt-1.5 w-full rounded-xl border border-[rgba(11,32,48,0.15)] bg-[rgba(13,107,117,0.05)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-semibold text-[var(--color-ink)]">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="jane@example.com"
                        className="mt-1.5 w-full rounded-xl border border-[rgba(11,32,48,0.15)] bg-[rgba(13,107,117,0.05)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="topic" className="text-sm font-semibold text-[var(--color-ink)]">
                      I am a...
                    </label>
                    <select
                      id="topic"
                      value={form.topic}
                      onChange={handleChange("topic")}
                      className="mt-1.5 w-full rounded-xl border border-[rgba(11,32,48,0.15)] bg-[rgba(13,107,117,0.05)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
                    >
                      {topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-semibold text-[var(--color-ink)]">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange("message")}
                      placeholder="Tell us what's on your mind..."
                      className="mt-1.5 w-full resize-none rounded-xl border border-[rgba(11,32,48,0.15)] bg-[rgba(13,107,117,0.05)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    Send message
                  </button>
                </form>
              )}
            </div>

            {/* Info + FAQ */}
            <div className="flex flex-col gap-8">
              <div className="rounded-2xl bg-[var(--color-abyss)] p-6 text-[var(--color-sand)]">
                <h3 className="text-lg font-semibold">Talk to us directly</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-[rgba(245,239,225,0.6)]">Buyer support</dt>
                    <dd className="font-data mt-0.5">support@aquapulse.example</dd>
                  </div>
                  <div>
                    <dt className="text-[rgba(245,239,225,0.6)]">Farm partnerships</dt>
                    <dd className="font-data mt-0.5">partners@aquapulse.example</dd>
                  </div>
                  <div>
                    <dt className="text-[rgba(245,239,225,0.6)]">Response time</dt>
                    <dd className="mt-0.5">Within one business day</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">Common questions</h3>
                <div className="mt-3">
                  {faqs.map((item, i) => (
                    <FaqItem
                      key={item.q}
                      item={item}
                      isOpen={openFaq === i}
                      onToggle={() => setOpenFaq((prev) => (prev === i ? -1 : i))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
