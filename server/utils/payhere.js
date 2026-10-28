import crypto from "crypto";

const md5 = (text) => crypto.createHash("md5").update(text).digest("hex").toUpperCase();

// Hash for the checkout form (made on the server, the secret never goes to the browser)
export const makePayhereHash = (orderId, amount, currency) => {
  const secret = md5(process.env.PAYHERE_MERCHANT_SECRET);
  return md5(process.env.PAYHERE_MERCHANT_ID + orderId + amount + currency + secret);
};

// The signature PayHere should send us in the notify (webhook) request
export const makeNotifySig = ({ merchant_id, order_id, payhere_amount, payhere_currency, status_code }) => {
  const secret = md5(process.env.PAYHERE_MERCHANT_SECRET);
  return md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secret);
};

// Compare two texts safely (stops timing attacks)
export const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export const checkoutUrl = () =>
  process.env.PAYHERE_SANDBOX === "true"
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";