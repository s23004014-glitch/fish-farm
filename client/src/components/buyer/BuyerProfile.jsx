import { useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import PasswordInput, { passwordChecks } from "../PasswordInput.jsx";

export default function BuyerProfile() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [changing, setChanging] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (profile.phone && !/^[0-9+\s-]{9,15}$/.test(profile.phone.trim())) return toast.error("Enter a valid phone number");

    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", {
        name: profile.name.trim(),
        phone: profile.phone.trim() || undefined,
        address: profile.address.trim(),
      });
      setUser(data); // update the navbar name too
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!passwordChecks(passwords.newPassword).every((c) => c.ok)) return toast.error("New password does not meet the rules");

    setChanging(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: passwords.currentPassword || undefined,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <form onSubmit={saveProfile} className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold">Profile</h2>

        <div>
          <label className="mb-1 block text-sm text-white/60">Email (cannot be changed)</label>
          <input type="email" value={user?.email || ""} disabled className="input-field opacity-60" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Name</label>
          <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Phone</label>
          <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Address</label>
          <textarea rows={3} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="input-field" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-8">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold">Change password</h2>

        <div>
          <label className="mb-1 block text-sm text-white/60">Current password (leave empty if you signed up with Google)</label>
          <PasswordInput
            id="current-password"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
            autoComplete="current-password"
            required={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">New password</label>
          <PasswordInput
            id="new-password"
            placeholder="New password"
            value={passwords.newPassword}
            onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
            autoComplete="new-password"
            showSuggest
            showRules
          />
        </div>

        <button type="submit" disabled={changing} className="btn-primary px-8">
          {changing ? "Changing..." : "Change password"}
        </button>
      </form>
    </div>
  );
}