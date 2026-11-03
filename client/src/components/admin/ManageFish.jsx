import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage, imageUrl, formatPrice, FALLBACK_IMAGE } from "../../api/axios.js";
import Spinner from "../Spinner.jsx";

const emptyForm = { name: "", price: "", size: "", stock: "", description: "", careTips: "" };
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const stockBadge = {
  "In stock": "bg-emerald-500/80",
  "Low stock": "bg-amber-500/90",
  "Out of stock": "bg-red-500/80",
};

export default function ManageFish() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null); // null = form closed, "new" = adding, or a fish = editing
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/fish");
      setFish(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scrollToForm = () => setTimeout(() => document.getElementById("fish-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

  const openNew = () => {
    setForm(emptyForm);
    setFile(null);
    setPreview("");
    setEditing("new");
    scrollToForm();
  };

  const openEdit = (f) => {
    setForm({
      name: f.name,
      price: String(f.price),
      size: f.size || "",
      stock: String(f.stock),
      description: f.description || "",
      careTips: f.careTips || "",
    });
    setFile(null);
    setPreview(f.image ? imageUrl(f.image) : "");
    setEditing(f);
    scrollToForm();
  };

  const closeForm = () => setEditing(null);

  const setField = (name, value) => setForm((old) => ({ ...old, [name]: value }));

  // Check the image before uploading (the server checks again)
  const handleFile = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      e.target.value = "";
      return toast.error("Only JPG, PNG or WEBP images are allowed");
    }
    if (picked.size > 2 * 1024 * 1024) {
      e.target.value = "";
      return toast.error("Image must be smaller than 2MB");
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);
    if (form.name.trim().length < 2) return toast.error("Fish name is too short");
    if (!(price > 0)) return toast.error("Price must be more than 0");
    if (!Number.isInteger(stock) || stock < 0) return toast.error("Stock must be a whole number (0 or more)");

    // Images need FormData (not JSON)
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value).trim()));
    if (file) data.append("image", file);

    setSaving(true);
    try {
      if (editing === "new") {
        await api.post("/fish", data);
        toast.success("Fish added");
      } else {
        await api.put(`/fish/${editing._id}`, data);
        toast.success("Fish updated");
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f) => {
    if (!window.confirm(`Delete "${f.name}"? Old orders will keep their details.`)) return;
    try {
      await api.delete(`/fish/${f._id}`);
      toast.success("Fish deleted");
      setFish((list) => list.filter((x) => x._id !== f._id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Manage Fish ({fish.length})</h2>
        <button onClick={openNew} className="btn-primary !py-2">+ Add fish</button>
      </div>

      {/* Add / edit form */}
      {editing && (
        <form id="fish-form" onSubmit={handleSubmit} className="glass-panel space-y-4 p-6">
          <h3 className="text-xl font-semibold">{editing === "new" ? "Add new fish" : `Edit ${editing.name}`}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/60">Name</label>
              <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">Size (example: 5-8 cm)</label>
              <input type="text" value={form.size} onChange={(e) => setField("size", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">Price (LKR)</label>
              <input type="number" min="1" step="0.01" value={form.price} onChange={(e) => setField("price", e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">Stock</label>
              <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setField("stock", e.target.value)} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">Care tips</label>
            <textarea rows={3} value={form.careTips} onChange={(e) => setField("careTips", e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Image (JPG, PNG or WEBP, max 2MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-aqua-400/20 file:px-4 file:py-2 file:text-aqua-300 hover:file:bg-aqua-400/30" />
            {preview && <img src={preview} alt="Preview" className="mt-3 h-32 rounded-xl object-cover" />}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">{saving ? "Saving..." : "Save"}</button>
            <button type="button" onClick={closeForm} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="glass-panel overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-white/15 text-white/60">
            <tr>
              <th className="p-3">Fish</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {fish.map((f) => (
              <tr key={f._id}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={imageUrl(f.image)} alt="" onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-medium">{f.name}</span>
                  </div>
                </td>
                <td className="p-3">{formatPrice(f.price)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockBadge[f.stockStatus]}`}>{f.stock}</span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(f)} className="mr-2 rounded-full bg-white/10 px-3 py-1 hover:bg-white/20">Edit</button>
                  <button onClick={() => handleDelete(f)} className="rounded-full bg-coral-500/20 px-3 py-1 text-coral-400 hover:bg-coral-500/30">Delete</button>
                </td>
              </tr>
            ))}
            {fish.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/50">No fish yet. Click "Add fish".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}