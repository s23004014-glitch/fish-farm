import { useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage, formatPrice } from "../api/axios.js";

// Demo only: the server accepts only these test cards
const TEST_CARDS = [
  { label: "Visa · approved", number: "4242424242424242" },
  { label: "Mastercard · approved", number: "5555555555554444" },
  { label: "Visa · declined", number: "4000000000000002" },
  { label: "Visa · no funds", number: "4000000000009995" },
];

const group = (digits) => digits.replace(/(.{4})/g, "$1 ").trim();

const brandOf = (digits) =>
  digits.startsWith("4") ? "VISA" : /^(5[1-5]|2[2-7])/.test(digits) ? "MASTERCARD" : "CARD";

// Luhn check: catches typing mistakes
const luhnOk = (digits) => {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
};

const expiryOk = (value) => {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!m) return false;
  return new Date(2000 + Number(m[2]), Number(m[1]), 0, 23, 59, 59) >= new Date();
};

export default function CardPaymentForm({ order, onPaid, onClose }) {
  const [number, setNumber] = useState(""); // digits only
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [busy, setBusy] = useState(false);

  const handleExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (number.length < 13 || !luhnOk(number)) return toast.error("Card number is not valid");
    if (!TEST_CARDS.some((c) => c.number === number)) {
      return toast.error("Demo mode accepts only the test cards listed below. Never enter a real card.");
    }
    if (name.trim().length < 2) return toast.error("Enter the name on the card");
    if (!expiryOk(expiry)) return toast.error("Expiry date is not valid");
    if (!/^\d{3,4}$/.test(cvv)) return toast.error("Enter a valid CVV");

    setBusy(true);
    try {
      const { data } = await api.post("/payments/test-card/pay", {
        orderId: order._id,
        cardNumber: number,
        cardName: name.trim(),
        expiry,
        cvv,
      });
      toast.success(`Payment approved (${data.brand} •••• ${data.last4})`);
      onPaid();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
      setCvv(""); // never keep the CVV longer than needed
    }
  };

  const brand = brandOf(number);
  const shownNumber = group(number.padEnd(16, "•").slice(0, 16));

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy-900/80 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="glass-panel w-full max-w-lg p-6 sm:p-8">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Pay by card</h2>
              <p className="text-sm text-white/60">Order #{order._id.slice(-6).toUpperCase()}</p>
            </div>
            <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
              ✕
            </button>
          </div>

          {/* Demo warning */}
          <div className="mb-5 rounded-xl border border-amber-400/40 bg-amber-500/15 p-3 text-sm text-amber-200">
            ⚠️ <b>DEMO MODE.</b> This is a practice payment with a fake processor. Use only the test cards below and never enter a real card.
          </div>

          {/* Live card preview */}
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-ocean-500 via-lagoon-500 to-navy-700 p-5 shadow-[0_16px_40px_rgba(34,211,238,0.25)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" />
              <span className="text-sm font-bold tracking-widest">{brand}</span>
            </div>
            <p className="mt-6 font-mono text-xl tracking-widest sm:text-2xl">{shownNumber}</p>
            <div className="mt-5 flex items-end justify-between text-xs uppercase">
              <div>
                <p className="text-white/60">Card holder</p>
                <p className="max-w-[200px] truncate text-sm font-semibold">{name || "YOUR NAME"}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60">Expires</p>
                <p className="text-sm font-semibold">{expiry || "MM/YY"}</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" autoComplete="on">
            <div>
              <label className="mb-1 block text-sm text-white/60">Card number</label>
              <input
                type="text"
                inputMode="numeric"
                name="cardnumber"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                value={group(number)}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
                className="input-field font-mono tracking-wider"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/60">Name on card</label>
              <input type="text" name="ccname" autoComplete="cc-name" placeholder="Cardholder name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className="input-field" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-white/60">Expiry (MM/YY)</label>
                <input type="text" inputMode="numeric" name="cc-exp" autoComplete="cc-exp" placeholder="MM/YY" value={expiry} onChange={(e) => handleExpiry(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/60">CVV</label>
                <input type="password" inputMode="numeric" name="cvc" autoComplete="cc-csc" placeholder="•••" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="input-field" required />
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full py-3 text-lg">
              {busy ? "Processing..." : `🔒 Pay ${formatPrice(order.totalAmount)}`}
            </button>
          </form>

          {/* Test cards */}
          <div className="mt-5 rounded-xl bg-white/10 p-3">
            <p className="mb-2 text-xs text-white/60">Click a test card to fill the number (any name, any future expiry, any 3-digit CVV):</p>
            <div className="flex flex-wrap gap-2">
              {TEST_CARDS.map((c) => (
                <button key={c.number} type="button" onClick={() => setNumber(c.number)} className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}