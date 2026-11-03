import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/axios.js";
import PasswordInput, { passwordChecks } from "../components/PasswordInput.jsx";
import { FARM } from "../config.js";

export default function Login() {
  const { user, login, register, googleLogin } = useAuth();
  const location = useLocation();

  const [mode, setMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  // Already logged in (or just logged in): go back where the user came from
  if (user) {
    const target = user.role === "admin" ? "/admin" : location.state?.from || "/";
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "register") {
      if (form.name.trim().length < 2) return toast.error("Please enter your name");
      if (!/^[0-9+\s-]{9,15}$/.test(form.phone.trim())) return toast.error("Enter a valid phone number");
      if (!passwordChecks(form.password).every((c) => c.ok)) return toast.error("Password does not meet the rules");
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(form.email.trim(), form.password);
        toast.success("Welcome back!");
      } else {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });
        toast.success("Account created. Welcome!");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      toast.success("Logged in with Google");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const googleReady = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <div className="glass-panel w-full p-6 sm:p-8">
        <div className="mb-6 text-center">
          <span className="text-4xl">🐠</span>
          <h1 className="mt-2 text-2xl font-bold">{FARM.name}</h1>
          <p className="text-sm text-white/60">Log in to buy fish and track your orders</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-full bg-white/10 p-1">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full py-2 text-sm font-semibold transition ${
                mode === m ? "bg-gradient-to-r from-coral-500 to-coral-400 shadow" : "text-white/70 hover:text-white"
              }`}
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="input-field"
                autoComplete="name"
                required
              />
              <input
                type="tel"
                placeholder="Phone number (07X XXX XXXX)"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="input-field"
                autoComplete="tel"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className="input-field"
            autoComplete="email"
            required
          />

          <PasswordInput
            value={form.password}
            onChange={(v) => setField("password", v)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            showSuggest={mode === "register"}
            showRules={mode === "register"}
          />

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        {/* Google login (shown only when VITE_GOOGLE_CLIENT_ID is set) */}
        {googleReady && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-white/40">
              <span className="h-px flex-1 bg-white/20" /> OR <span className="h-px flex-1 bg-white/20" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error("Google login failed")} shape="pill" theme="filled_blue" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}