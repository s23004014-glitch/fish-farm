import nodemailer from "nodemailer";

// Stop HTML tricks in text we put inside emails
export const escapeHtml = (text = "") =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Send one email. If email is not set up or fails, we only log a short message
// and the order still works.
export const sendEmail = async ({ to, subject, html, replyTo }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email is not set up in .env, skipping email");
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, replyTo });
  } catch (error) {
    console.error("Email failed:", error.message);
  }
};

// Thank-you email with fish and order details
export const sendOrderEmail = (to, order) => {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>LKR ${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <h2>Thank you for your order!</h2>
    <p>Hi ${escapeHtml(order.delivery.name)}, we received your order.</p>
    <p><b>Order ID:</b> ${order._id}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Fish</th><th>Qty</th><th>Price</th></tr>
      ${rows}
    </table>
    <p><b>Total:</b> LKR ${order.totalAmount.toFixed(2)}</p>
    <p><b>Payment:</b> ${order.paymentMethod === "COD" ? "Cash on Delivery" : "Card (paid)"}</p>
    <p><b>Delivery to:</b> ${escapeHtml(order.delivery.address)}<br/>Phone: ${escapeHtml(order.delivery.phone)}</p>
  `;

  // We do not wait for this, the buyer gets the response faster
  return sendEmail({ to, subject: "Your fish order is confirmed", html });
};