import { Link } from "react-router-dom";
import { FARM } from "../config.js";

const SocialIcon = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-aqua-400/30"
  >
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </a>
);

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-gradient-to-b from-navy-800 to-navy-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aqua-400 to-ocean-600 text-xl">🐠</span>
            <span className="text-lg font-bold">{FARM.name}</span>
          </div>
          <p className="mt-3 text-sm text-white/60">{FARM.tagline}</p>
        </div>

        {/* Links */}
        <div>
          <h3 className="mb-3 font-semibold text-aqua-400">Quick Links</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/fish" className="hover:text-white">All Fish</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/login" className="hover:text-white">Login / Register</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-3 font-semibold text-aqua-400">Contact</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>📍 {FARM.address}</li>
            <li>📞 {FARM.phone}</li>
            <li>✉️ {FARM.email}</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-3 font-semibold text-aqua-400">Follow Us</h3>
          <div className="flex gap-3">
            <SocialIcon href={FARM.facebook} label="Facebook">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </SocialIcon>
            <SocialIcon href={FARM.instagram} label="Instagram">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" />
            </SocialIcon>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {FARM.name}. All rights reserved.
      </div>
    </footer>
  );
}