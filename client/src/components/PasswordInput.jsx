import { useState } from "react";
import toast from "react-hot-toast";

// The password rules (same as the backend)
export const passwordChecks = (pw) => [
  { label: "At least 8 characters", ok: pw.length >= 8 },
  { label: "A letter", ok: /[A-Za-z]/.test(pw) },
  { label: "A number", ok: /[0-9]/.test(pw) },
  { label: "A symbol (like @ # $ !)", ok: /[^A-Za-z0-9]/.test(pw) },
];

// Make a random strong password in the browser (uses secure random numbers)
const randomIndex = (max) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
};
const pick = (text) => text[randomIndex(text.length)];

const generatePassword = () => {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%^*?-_";
  const all = lower + upper + digits + symbols;

  // At least one of each kind, then fill up to 14 characters
  const chars = [pick(lower), pick(upper), pick(digits), pick(symbols)];
  while (chars.length < 14) chars.push(pick(all));

  // Shuffle so the pattern is not always the same
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

// onChange receives the new text (not the event)
export default function PasswordInput({
  value,
  onChange,
  id = "password",
  placeholder = "Password",
  autoComplete = "current-password",
  showSuggest = false,
  showRules = false,
  required = true,
}) {
  const [show, setShow] = useState(false);
  const [suggested, setSuggested] = useState(false);

  const handleSuggest = () => {
    onChange(generatePassword());
    setShow(true); // show it so the user can see and copy it
    setSuggested(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Password copied");
    } catch {
      toast.error("Could not copy. Please copy it by hand.");
    }
  };

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSuggested(false);
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input-field pr-16"
          required = {required}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-aqua-400 hover:text-aqua-300"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {showSuggest && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={handleSuggest} className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">
            ✨ Suggest strong password
          </button>
          {suggested && (
            <button type="button" onClick={handleCopy} className="rounded-full bg-aqua-400/20 px-3 py-1 text-xs text-aqua-300 hover:bg-aqua-400/30">
              Copy
            </button>
          )}
        </div>
      )}

      {showRules && value.length > 0 && (
        <ul className="mt-2 grid grid-cols-2 gap-x-3 text-xs">
          {passwordChecks(value).map((c) => (
            <li key={c.label} className={c.ok ? "text-emerald-300" : "text-white/50"}>
              {c.ok ? "✓" : "○"} {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}