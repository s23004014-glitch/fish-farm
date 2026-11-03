import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap.js";
import { ScrollTrigger } from "../lib/gsap.js";

if (typeof window !== "undefined") {
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// <Reveal><h2>Title</h2></Reveal>                  fades the block in
// <Reveal stagger={0.1} className="grid ...">      fades the children in one by one
export default function Reveal({ as: Tag = "div", stagger = 0, y = 40, className = "", children }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const targets = stagger ? ref.current.children : ref.current;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}