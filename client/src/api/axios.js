import axios from "axios";

// All requests go to /api (the Vite proxy sends them to the backend).
// withCredentials lets the browser send the login cookie.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export default api;

// ---------- Small helpers used on many pages ----------

// Fish images come from the backend as "/uploads/abc.jpg"
const SERVER = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

// Picture shown when a fish has no image
export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#0b4f8a'/><stop offset='1' stop-color='#0e8f9a'/>
      </linearGradient></defs>
      <rect width='600' height='450' fill='url(#g)'/>
      <text x='300' y='250' font-size='120' text-anchor='middle'>🐠</text>
    </svg>`
  );

export const imageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith("http")) return path;
  return SERVER + path;
};

// Price like: LKR 1,250.00
export const formatPrice = (value) =>
  "LKR " + Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Get a clean message from an axios error
export const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

// Send the buyer to PayHere checkout (PayHere needs a normal form POST)
export const goToPayHere = (checkoutUrl, fields) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

// Open the PayHere payment popup on our own page (no redirect)
export const openPayHerePopup = (data, { onCompleted, onDismissed, onError }) => {
  if (!window.payhere) {
    onError?.("The payment script did not load. Refresh the page and try again.");
    return;
  }
  // Called when the checkout closes. The result can still be a failure, so the server decides.
  window.payhere.onCompleted = () => onCompleted?.();
  // Called when the buyer closes the popup
  window.payhere.onDismissed = () => onDismissed?.();
  // Called when the values we sent are invalid
  window.payhere.onError = (error) => onError?.(String(error));

  window.payhere.startPayment({
    sandbox: data.checkoutUrl.includes("sandbox"), // true while testing
    ...data.fields, // merchant_id, order_id, amount, hash, delivery details...
  });
};