import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

// endpoint "/requests" saves a request for the admin. endpoint "/contact" emails the admin.
export default function RequestForm({ endpoint = "/requests", buttonText = "Send", onSent }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  // Fill the name and email for logged-in users
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name || "", email: f.email || user.email || "" }));
    }
  }, [user]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post(endpoint, {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      toast.success(data.message || "Message sent");
      setForm((f) => ({ ...f, subject: "", message: "" })); // keep name and email
      onSent?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setField("name", e.target.value)} className="input-field" required />
        <input type="email" placeholder="Your email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="input-field" required />
      </div>
      <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} className="input-field" required />
      <textarea placeholder="Write your message..." rows={5} value={form.message} onChange={(e) => setField("message", e.target.value)} className="input-field" required />
      <button type="submit" disabled={sending} className="btn-primary px-8">
        {sending ? "Sending..." : buttonText}
      </button>
    </form>
  );
}