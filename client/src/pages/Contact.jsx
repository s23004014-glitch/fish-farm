import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap.js";
import RequestForm from "../components/RequestForm.jsx";
import { FARM } from "../config.js";

const info = [
  { icon: "📍", label: "Address", value: FARM.address },
  { icon: "📞", label: "Phone", value: FARM.phone },
  { icon: "✉️", label: "Email", value: FARM.email },
];

export default function Contact() {
  const root = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Title drops in, the form slides from the left, the info cards slide from the right
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".c-title", { opacity: 0, y: -30, duration: 0.8 })
        .from(".c-form", { opacity: 0, x: -70, duration: 0.9 }, "-=0.5")
        .from(".c-info", { opacity: 0, x: 70, duration: 0.8, stagger: 0.15 }, "-=0.7");

      // The map block grows in when you scroll to it
      gsap.from(".c-map", {
        opacity: 0,
        scale: 0.9,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".c-map", start: "top 92%", once: true },
      });

      // The pin on the map placeholder bounces
      gsap.to(".c-pin", { y: -8, duration: 0.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
    },
    { scope: root }
  );

  // The icon wiggles when the mouse enters an info card
  const wiggle = contextSafe((e) => {
    if (prefersReducedMotion()) return;
    const icon = e.currentTarget.querySelector(".c-icon");
    gsap.fromTo(icon, { rotation: -20, scale: 1.25 }, { rotation: 0, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.3)" });
  });

  return (
    <div ref={root} className="page-container">
      <h1 className="c-title section-title mb-8 text-center">Contact Us</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form (this one sends an email to the admin) */}
        <section className="c-form glass-panel p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-semibold">Send us a message</h2>
          <RequestForm endpoint="/contact" buttonText="Send message" />
        </section>

        {/* Details and map */}
        <section className="space-y-5">
          {info.map((i) => (
            <div key={i.label} onMouseEnter={wiggle} className="c-info glass-panel flex items-center gap-4 p-5">
              <span className="c-icon inline-block text-3xl">{i.icon}</span>
              <div>
                <p className="text-sm text-white/50">{i.label}</p>
                <p className="font-semibold">{i.value}</p>
              </div>
            </div>
          ))}

          {/* Map placeholder. Later paste your Google Maps embed here. */}
          <div className="c-map glass-panel flex h-64 items-center justify-center text-center text-white/50">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126587.49817504479!2d80.27537716911748!3d7.480782913168335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3398ab06be8b9%3A0x1f90e4e71e885052!2sKurunegala!5e0!3m2!1sen!2slk!4v1792779408654!5m2!1sen!2slk" className="h-full w-full rounded-2xl" loading="lazy" title="Farm location" />
          </div>
        </section>
      </div>
    </div>
  );
}