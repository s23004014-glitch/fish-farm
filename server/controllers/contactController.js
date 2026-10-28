import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail, escapeHtml } from "../utils/sendEmail.js";

// POST /api/contact sends the message to the admin email
export const sendContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    replyTo: email, 
    // admin can press Reply and answer the visitor
    subject: `Contact form: ${subject}`,
    html: `
      <p><b>From:</b> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p><b>Subject:</b> ${escapeHtml(subject)}</p>
      <p>${escapeHtml(message)}</p>
    `,
  });

  res.json({ message: "Thank you! Your message was sent." });
});

// GET /api/contact/info gives the WhatsApp link built from .env
export const getContactInfo = asyncHandler(async (req, res) => {
  const digits = String(process.env.ADMIN_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  
  
  res.json({ whatsappLink: digits.length >= 10 ? `https://wa.me/${digits}` : null });
});