// Usage: node scripts/simulate-payhere.js <orderId> <amount> [statusCode]
// Example: node scripts/simulate-payhere.js
import "dotenv/config";
import crypto from "crypto";

const [orderId, amount, statusCode = "2"] = process.argv.slice(2);
if (!orderId || !amount) {
  console.log("Usage: node scripts/simulate-payhere.js <orderId> <amount> [statusCode]");
  process.exit(1);
}

const md5 = (t) => crypto.createHash("md5").update(t).digest("hex").toUpperCase();
const merchantId = process.env.PAYHERE_MERCHANT_ID;
const secret = md5(process.env.PAYHERE_MERCHANT_SECRET);
const md5sig = md5(merchantId + orderId + amount + "LKR" + statusCode + secret);

const body = new URLSearchParams({
  merchant_id: merchantId,
  order_id: orderId,
  payment_id: "TEST" + Date.now(),
  payhere_amount: amount,
  payhere_currency: "LKR",
  status_code: statusCode,
  md5sig,
});

const res = await fetch(`http://localhost:${process.env.PORT || 5000}/api/payments/payhere/notify`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});
console.log(res.status, await res.text());