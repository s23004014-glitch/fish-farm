import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navLinks = [
  { label: "Catalog", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-abyss)] text-[var(--color-sand)] shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--color-coral)]" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-coral)]" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">AquaPulse</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--color-coral)]"
                    : "text-[rgba(245,239,225,0.8)] hover:text-[var(--color-sand)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/auth" className="btn-primary">
            Login / Register
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-[var(--color-sand)] transition-transform duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-[var(--color-sand)] transition-opacity duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-[var(--color-sand)] transition-transform duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer — CSS transition on max-height/opacity, no JS animation library */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-5 pb-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-[rgba(255,255,255,0.1)] text-[var(--color-coral)]"
                    : "text-[rgba(245,239,225,0.85)] hover:bg-[rgba(255,255,255,0.05)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="btn-primary mt-2 text-center"
          >
            Login / Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
