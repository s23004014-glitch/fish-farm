import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
// import { api, setToken } from "../lib/api";

/* ------------------------------------------------------------------ */
/* Small inline icons — consistent line style with the About page      */
/* ------------------------------------------------------------------ */
function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BuyerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
      <path d="M18 12l4-3v6l-4-3Z" />
      <circle cx="7" cy="11" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FarmIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 11l9-6 9 6" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

const trustPoints = [
  "Live stock validation on every order",
  "Direct from 48+ certified farms",
  "Separate buyer & farm-partner accounts",
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[rgba(11,32,48,0.15)] bg-[rgba(13,107,117,0.05)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const rootRef = useRef(null);
  const formPanelRef = useRef(null);
  const formContentRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".auth-brand > *", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from(formPanelRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.1,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Crossfade the form content whenever the mode toggles (skip on first mount).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (formContentRef.current) {
      gsap.fromTo(
        formContentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
    setError("");
  }, [mode]);

  const handleLoginChange = (field) => (e) =>
    setLoginForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleRegisterChange = (field) => (e) =>
    setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }));

  const redirectAfterAuth = (role) => {
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await api.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
      });
      setToken(data.token);
      redirectAfterAuth(data.user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post("/auth/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      setToken(data.token);
      redirectAfterAuth(data.user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main ref={rootRef} className="flex min-h-[calc(100vh-73px)] flex-col lg:flex-row">
        {/* ---------------- Brand panel (hidden on mobile) ---------------- */}
        <div className="relative hidden overflow-hidden bg-[var(--color-abyss)] px-10 py-12 text-[var(--color-sand)] lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
          <span
            className="pulse-ring pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[rgba(255,107,74,0.35)]"
            aria-hidden="true"
          />
          <div className="auth-brand relative">
            <Link to="/" className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--color-coral)]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-coral)]" />
              </span>
              <span className="text-xl font-semibold tracking-tight">AquaPulse</span>
            </Link>

            <h1 className="mt-10 max-w-sm text-3xl font-semibold leading-[1.15]">
              Real-time access to the world&rsquo;s aquaculture farms.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white">
              One account gets you a live catalog, validated stock, and orders shipped
              straight from the farm.
            </p>

            <ul className="mt-8 space-y-3">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-[rgba(245,239,225,0.85)]">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-seafoam)]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="auth-brand relative text-xs text-[rgba(245,239,225,0.5)]">
            Trusted by 48+ partner farms and their buyers.
          </p>
        </div>

        {/* ---------------- Form panel ---------------- */}
        <div className="flex flex-1 items-center justify-center bg-transparent px-5 py-12 sm:px-8">
          <div ref={formPanelRef} className="w-full max-w-md rounded-3xl border border-[rgba(11,32,48,0.08)] bg-white p-6 shadow-[0_25px_50px_rgba(13,107,117,0.15)] sm:p-8">
            {/* Sliding segmented toggle */}
            <div className="relative inline-flex w-full rounded-full bg-[rgba(13,107,117,0.08)] p-1">
              <span
                className={`absolute inset-y-1 w-1/2 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
                  mode === "register" ? "translate-x-full" : "translate-x-0"
                }`}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative z-10 w-1/2 rounded-full py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  mode === "login" ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`relative z-10 w-1/2 rounded-full py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  mode === "register" ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
                }`}
              >
                Create account
              </button>
            </div>

            <div ref={formContentRef} className="mt-8">
              {mode === "login" ? (
                <>
                  <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Welcome back</h2>
                  <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
                    Log in to track orders and see live stock.
                  </p>

                  <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="login-email" className="text-sm font-semibold text-[var(--color-ink)]">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={handleLoginChange("email")}
                        placeholder="jane@example.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-sm font-semibold text-[var(--color-ink)]">
                          Password
                        </label>
                        <a href="#" className="text-xs font-semibold text-[var(--color-reef)] hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={loginForm.password}
                        onChange={handleLoginChange("password")}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                      <input type="checkbox" className="h-4 w-4 rounded border-[rgba(11,32,48,0.3)] text-[var(--color-reef)] focus:ring-[var(--color-reef)]" />
                      Remember me
                    </label>
                    <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                      {submitting ? "Logging in…" : "Log in"}
                    </button>
                    {error && <p className="text-center text-xs font-semibold text-[var(--color-coral)]">{error}</p>}
                  </form>

                  <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
                    New to AquaPulse?{" "}
                    <button type="button" onClick={() => setMode("register")} className="font-semibold text-[var(--color-coral)] hover:underline">
                      Create an account
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Create your account</h2>
                  <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
                    Join as a buyer, or list your farm&rsquo;s stock.
                  </p>

                  <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-5">
                    {/* Account type selection */}
                    <div>
                      <span className="text-sm font-semibold text-[var(--color-ink)]">Account type</span>
                    </div>

                    <div>
                      <label htmlFor="register-name" className="text-sm font-semibold text-[var(--color-ink)]">
                        Full name
                      </label>
                      <input
                        id="register-name"
                        type="text"
                        required
                        value={registerForm.name}
                        onChange={handleRegisterChange("name")}
                        placeholder="Jane Rivera"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="register-email" className="text-sm font-semibold text-[var(--color-ink)]">
                        Email
                      </label>
                      <input
                        id="register-email"
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={handleRegisterChange("email")}
                        placeholder="jane@example.com"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="register-password" className="text-sm font-semibold text-[var(--color-ink)]">
                          Password
                        </label>
                        <input
                          id="register-password"
                          type="password"
                          required
                          minLength={8}
                          value={registerForm.password}
                          onChange={handleRegisterChange("password")}
                          placeholder="••••••••"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="register-confirm" className="text-sm font-semibold text-[var(--color-ink)]">
                          Confirm password
                        </label>
                        <input
                          id="register-confirm"
                          type="password"
                          required
                          value={registerForm.confirmPassword}
                          onChange={handleRegisterChange("confirmPassword")}
                          placeholder="••••••••"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <label className="flex items-start gap-2 text-sm text-[var(--color-ink-soft)]">
                      <input
                        type="checkbox"
                        required
                        className="mt-0.5 h-4 w-4 rounded border-[rgba(11,32,48,0.3)] text-[var(--color-reef)] focus:ring-[var(--color-reef)]"
                      />
                      I agree to the terms of service and privacy policy.
                    </label>
                    <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                      {submitting ? "Creating account…" : "Create account"}
                    </button>
                    {error && <p className="text-center text-xs font-semibold text-[var(--color-coral)]">{error}</p>}
                  </form>

                  <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("login")} className="font-semibold text-[var(--color-coral)] hover:underline">
                      Log in
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
