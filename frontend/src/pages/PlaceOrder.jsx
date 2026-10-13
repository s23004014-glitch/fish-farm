import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import { fishData } from "../data/fish"; // adjust path if different

/* Same illustration style used across the app, kept local + static (no idle animation needed here) */
function FishIcon({ className = "", style }) {
  return (
    <svg style={style} viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M40,60 C40,30 90,15 130,25 C160,33 168,50 168,60 C168,70 160,87 130,95 C90,105 40,90 40,60 Z" fill="currentColor" />
      <path d="M166,60 L198,32 C186,48 186,72 198,88 L166,60 Z" fill="currentColor" opacity="0.85" />
      <path d="M92,24 C97,8 118,6 123,20 C112,27 101,27 92,24 Z" fill="currentColor" opacity="0.75" />
      <path d="M92,96 C97,112 116,113 121,99 C110,93 100,93 92,96 Z" fill="currentColor" opacity="0.75" />
      <circle cx="128" cy="50" r="5.5" fill="#0B2030" />
      <circle cx="129.5" cy="48.5" r="1.6" fill="#F5EFE1" />
    </svg>
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Local test seed — since there's no shared cart store yet, this page
// starts with a couple of sample items so the checkout flow is testable.
// Swap or clear this array as needed.
const initialCart = [
  { fishId: 1, qty: 1 },
  { fishId: 3, qty: 2 },
];

const steps = [
  { n: 1, label: "Cart" },
  { n: 2, label: "Shipping" },
  { n: 3, label: "Payment" },
  { n: 4, label: "Review" },
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[rgba(11,32,48,0.15)] bg-[rgba(245,239,225,0.4)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-reef)]";

export default function PlaceOrder() {
  const [cart, setCart] = useState(initialCart);
  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4 | "confirmation"
  const [maxStep, setMaxStep] = useState(1);
  const [shipping, setShipping] = useState({ name: "", address: "", city: "", region: "", postal: "", country: "United States", phone: "" });
  const [payment, setPayment] = useState({ cardName: "", cardNumber: "", expiry: "", cvc: "" });
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    document.title = "Checkout · AquaPulse";
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".checkout-fade", { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [step]);

  useEffect(() => {
    if (typeof step === "number") setMaxStep((m) => Math.max(m, step));
  }, [step]);

  // Simulated live stock validation — re-checks whenever the Review step
  // is (re)reached. No real request; just a short delay so the "checking"
  // state is visible, using whatever stock values are already in fishData.
  useEffect(() => {
    if (step !== 4) return;
    let cancelled = false;
    setValidating(true);
    setValidated(false);
    wait(600).then(() => {
      if (!cancelled) {
        setValidating(false);
        setValidated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [step]);

  const cartItems = cart
    .map((c) => ({ ...c, fish: fishData.find((f) => String(f.id) === String(c.fishId)) }))
    .filter((c) => c.fish);

  const subtotal = cartItems.reduce((sum, c) => sum + c.fish.price * c.qty, 0);
  const shippingCost = subtotal >= 50 || subtotal === 0 ? 0 : 5;
  const total = subtotal + shippingCost;
  const hasBlockingIssue = validated && cartItems.some((c) => c.fish.stock === "Sold out");

  const updateQty = (fishId, qty) => {
    setCart((prev) => prev.map((c) => (c.fishId === fishId ? { ...c, qty: Math.max(1, qty) } : c)));
  };
  const removeItem = (fishId) => {
    setCart((prev) => prev.filter((c) => c.fishId !== fishId));
  };
  const clearCart = () => setCart([]);

  const handleQty = (fishId, delta) => {
    const current = cart.find((c) => c.fishId === fishId);
    if (current) updateQty(fishId, current.qty + delta);
  };
  const handleRemove = (fishId) => removeItem(fishId);
  const goNext = () => typeof step === "number" && setStep((s) => Math.min(4, s + 1));
  const goBack = () => typeof step === "number" && setStep((s) => Math.max(1, s - 1));
  const handleShippingChange = (field) => (e) => setShipping((p) => ({ ...p, [field]: e.target.value }));
  const handlePaymentChange = (field) => (e) => setPayment((p) => ({ ...p, [field]: e.target.value }));

  const handlePlaceOrder = async () => {
    setPlaceError("");
    setPlacingOrder(true);

    // Simulated order placement — no backend call, just a short delay
    await wait(700);

    const fakeOrderNumber = `AQ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(fakeOrderNumber);
    setConfirmedTotal(total);
    clearCart();
    setPlacingOrder(false);
    setStep("confirmation");
  };

  return (
    <>
      <Navbar />
      <main ref={rootRef} className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        {step !== "confirmation" && (
          <div className="checkout-fade">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-reef)]">Checkout</span>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">Place your order</h1>
          </div>
        )}

        {/* ---------------- Empty cart ---------------- */}
        {step !== "confirmation" && cartItems.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[rgba(11,32,48,0.15)] bg-[rgba(255,255,255,0.6)] px-6 py-14 text-center">
            <p className="text-lg font-semibold text-[var(--color-ink)]">Your cart is empty</p>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Browse the catalog to find your next fish.</p>
            <Link to="/" className="btn-primary mt-6 inline-flex text-[var(--color-abyss)]">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <>
            {/* ---------------- Stepper ---------------- */}
            {step !== "confirmation" && (
              <div className="checkout-fade mt-8 flex items-center">
                {steps.map((s, i) => (
                  <div key={s.n} className="flex flex-1 items-center last:flex-none">
                    <button
                      type="button"
                      disabled={s.n > maxStep}
                      onClick={() => s.n <= maxStep && setStep(s.n)}
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
                        step === s.n
                          ? "bg-[var(--color-abyss)] text-[var(--color-sand)]"
                          : s.n < step
                          ? "bg-[var(--color-seafoam)] text-[#0f5c4a]"
                          : "bg-[rgba(11,32,48,0.08)] text-[var(--color-ink-soft)]"
                      } ${s.n <= maxStep ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                      {s.n < step ? "✓" : s.n}
                    </button>
                    <span className={`ml-2 hidden text-sm font-semibold sm:block ${step === s.n ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"}`}>
                      {s.label}
                    </span>
                    {i < steps.length - 1 && <div className="mx-3 h-px flex-1 bg-[rgba(11,32,48,0.12)]" />}
                  </div>
                ))}
              </div>
            )}

            <div ref={contentRef} className="mt-8">
              {/* ================= STEP 1: CART ================= */}
              {step === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goNext();
                  }}
                >
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.fishId} className="flex items-center gap-4 rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(7,27,43,0.04)]">
                          <FishIcon className="h-9 w-9" style={{ color: item.fish.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[var(--color-ink)]">{item.fish.name}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{item.fish.farm}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-[rgba(11,32,48,0.15)] px-2 py-1">
                          <button type="button" onClick={() => handleQty(item.fishId, -1)} className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors duration-200 hover:bg-[rgba(11,32,48,0.06)]">
                            −
                          </button>
                          <span className="w-5 text-center font-data text-sm font-semibold">{item.qty}</span>
                          <button type="button" onClick={() => handleQty(item.fishId, 1)} className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors duration-200 hover:bg-[rgba(11,32,48,0.06)]">
                            +
                          </button>
                        </div>
                        <p className="w-16 flex-shrink-0 text-right font-data text-sm font-semibold text-[var(--color-ink)]">
                          ${(item.fish.price * item.qty).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.fishId)}
                          aria-label={`Remove ${item.fish.name}`}
                          className="flex-shrink-0 text-[var(--color-ink-soft)] transition-colors duration-200 hover:text-[var(--color-coral)]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[rgba(11,32,48,0.08)] pt-5">
                    <span className="text-sm text-[var(--color-ink-soft)]">Subtotal</span>
                    <span className="font-data text-lg font-semibold text-[var(--color-ink)]">${subtotal.toFixed(2)}</span>
                  </div>
                  <button type="submit" className="btn-primary mt-5 w-full">
                    Continue to shipping
                  </button>
                </form>
              )}

              {/* ================= STEP 2: SHIPPING ================= */}
              {step === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goNext();
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="ship-name" className="text-sm font-semibold text-[var(--color-ink)]">Full name</label>
                    <input id="ship-name" required value={shipping.name} onChange={handleShippingChange("name")} placeholder="Jane Rivera" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="ship-address" className="text-sm font-semibold text-[var(--color-ink)]">Address</label>
                    <input id="ship-address" required value={shipping.address} onChange={handleShippingChange("address")} placeholder="123 Harbor Lane" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label htmlFor="ship-city" className="text-sm font-semibold text-[var(--color-ink)]">City</label>
                      <input id="ship-city" required value={shipping.city} onChange={handleShippingChange("city")} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="ship-region" className="text-sm font-semibold text-[var(--color-ink)]">State / Region</label>
                      <input id="ship-region" required value={shipping.region} onChange={handleShippingChange("region")} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="ship-postal" className="text-sm font-semibold text-[var(--color-ink)]">Postal code</label>
                      <input id="ship-postal" required value={shipping.postal} onChange={handleShippingChange("postal")} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ship-country" className="text-sm font-semibold text-[var(--color-ink)]">Country</label>
                      <select id="ship-country" value={shipping.country} onChange={handleShippingChange("country")} className={inputClass}>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Singapore</option>
                        <option>Australia</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ship-phone" className="text-sm font-semibold text-[var(--color-ink)]">Phone</label>
                      <input id="ship-phone" type="tel" required value={shipping.phone} onChange={handleShippingChange("phone")} placeholder="For delivery updates" className={inputClass} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={goBack} className="btn-outline flex-1 border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]">
                      Back
                    </button>
                    <button type="submit" className="btn-primary flex-1">
                      Continue to payment
                    </button>
                  </div>
                </form>
              )}

              {/* ================= STEP 3: PAYMENT ================= */}
              {step === 3 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goNext();
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="pay-name" className="text-sm font-semibold text-[var(--color-ink)]">Name on card</label>
                    <input id="pay-name" required value={payment.cardName} onChange={handlePaymentChange("cardName")} placeholder="Jane Rivera" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="pay-number" className="text-sm font-semibold text-[var(--color-ink)]">Card number</label>
                    <input
                      id="pay-number"
                      required
                      inputMode="numeric"
                      maxLength={19}
                      value={payment.cardNumber}
                      onChange={handlePaymentChange("cardNumber")}
                      placeholder="4242 4242 4242 4242"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="pay-expiry" className="text-sm font-semibold text-[var(--color-ink)]">Expiry (MM/YY)</label>
                      <input id="pay-expiry" required maxLength={5} value={payment.expiry} onChange={handlePaymentChange("expiry")} placeholder="09/28" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="pay-cvc" className="text-sm font-semibold text-[var(--color-ink)]">CVC</label>
                      <input id="pay-cvc" required inputMode="numeric" maxLength={4} value={payment.cvc} onChange={handlePaymentChange("cvc")} placeholder="123" className={inputClass} />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    This is a demo form — connect a real payment processor before going live.
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={goBack} className="btn-outline flex-1 border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]">
                      Back
                    </button>
                    <button type="submit" className="btn-primary flex-1">
                      Review order
                    </button>
                  </div>
                </form>
              )}

              {/* ================= STEP 4: REVIEW + STOCK VALIDATION ================= */}
              {step === 4 && (
                <div>
                  <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">Items</h3>
                    <div className="mt-3">
                      {cartItems.map((item) => (
                        <div key={item.fishId} className="flex items-center justify-between gap-3 border-b border-[rgba(11,32,48,0.06)] py-3 text-sm last:border-0">
                          <div>
                            <p className="font-semibold text-[var(--color-ink)]">
                              {item.fish.name} × {item.qty}
                            </p>
                            {!validating && item.fish.stock === "Low stock" && (
                              <p className="text-xs text-[var(--color-coral)]">Only a few left</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-data text-[var(--color-ink)]">${(item.fish.price * item.qty).toFixed(2)}</span>
                            {validating ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,92,102,0.1)] px-2.5 py-1 text-xs font-semibold text-[var(--color-reef)]">
                                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--color-reef)]" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-reef)]" />
                                </span>
                                Checking
                              </span>
                            ) : item.fish.stock === "Sold out" ? (
                              <span className="whitespace-nowrap rounded-full bg-[rgba(255,107,74,0.15)] px-2.5 py-1 text-xs font-semibold text-[var(--color-coral)]">
                                Unavailable
                              </span>
                            ) : (
                              <span className="whitespace-nowrap rounded-full bg-[rgba(127,217,196,0.25)] px-2.5 py-1 text-xs font-semibold text-[#0f5c4a]">
                                Confirmed
                              </span>
                            )}
                            {!validating && item.fish.stock === "Sold out" && (
                              <button type="button" onClick={() => handleRemove(item.fishId)} className="text-xs font-semibold text-[var(--color-ink-soft)] underline hover:text-[var(--color-coral)]">
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <dl className="mt-4 space-y-1.5 border-t border-[rgba(11,32,48,0.08)] pt-4 text-sm">
                      <div className="flex justify-between text-[var(--color-ink-soft)]">
                        <dt>Subtotal</dt>
                        <dd className="font-data">${subtotal.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between text-[var(--color-ink-soft)]">
                        <dt>Shipping</dt>
                        <dd className="font-data">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</dd>
                      </div>
                      <div className="flex justify-between border-t border-[rgba(11,32,48,0.08)] pt-2 text-base font-semibold text-[var(--color-ink)]">
                        <dt>Total</dt>
                        <dd className="font-data">${total.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">Shipping to</p>
                      <p className="mt-1.5 font-semibold text-[var(--color-ink)]">{shipping.name || "—"}</p>
                      <p className="text-[var(--color-ink-soft)]">
                        {shipping.address || "—"}
                        {shipping.city ? `, ${shipping.city}` : ""}
                        {shipping.region ? `, ${shipping.region}` : ""} {shipping.postal}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(11,32,48,0.08)] bg-white p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">Payment</p>
                      <p className="mt-1.5 font-semibold text-[var(--color-ink)]">{payment.cardName || "—"}</p>
                      <p className="font-data text-[var(--color-ink-soft)]">
                        {payment.cardNumber ? `•••• ${payment.cardNumber.slice(-4)}` : "—"}
                      </p>
                    </div>
                  </div>

                  {!validating && hasBlockingIssue && (
                    <div className="mt-5 rounded-xl bg-[rgba(255,107,74,0.1)] px-4 py-3 text-sm text-[var(--color-coral)]">
                      One or more items sold out since you added them. Remove them above to continue.
                    </div>
                  )}

                  {placeError && (
                    <div className="mt-5 rounded-xl bg-[rgba(255,107,74,0.1)] px-4 py-3 text-sm text-[var(--color-coral)]">
                      {placeError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-5">
                    <button type="button" onClick={goBack} className="btn-outline flex-1 border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]">
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={validating || hasBlockingIssue || placingOrder}
                      onClick={handlePlaceOrder}
                      className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {validating ? "Validating stock…" : placingOrder ? "Placing order…" : "Place order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= CONFIRMATION ================= */}
        {step === "confirmation" && (
          <div className="checkout-fade mx-auto max-w-lg py-10 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(127,217,196,0.25)] text-2xl text-[#0f5c4a]">
              ✓
            </span>
            <h1 className="mt-5 text-3xl font-semibold text-[var(--color-ink)]">Order placed!</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Confirmation <span className="font-data font-semibold text-[var(--color-ink)]">{orderNumber}</span> · $
              {confirmedTotal.toFixed(2)} charged
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Estimated delivery in 3–5 business days.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/buyer" className="btn-primary text-[var(--color-abyss)]">
                View my orders
              </Link>
              <Link to="/" className="btn-outline border-[rgba(15,92,102,0.3)] text-[var(--color-reef)] hover:border-[var(--color-reef)]">
                Back to catalog
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}