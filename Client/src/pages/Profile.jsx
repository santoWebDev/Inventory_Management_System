import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMe } from "../api/userApi";
import Button from "../components/Button";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const response = await updateMe(payload);

      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser?.(response.data);
      }

      setForm((current) => ({ ...current, password: "" }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal account details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500 text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2 className="mt-5 text-xl font-bold">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          <div className="mt-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-indigo-200">
            {user?.role}
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Account status: <span className="capitalize text-slate-300">{user?.status}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your name, email or password.
            </p>
          </div>

          <ErrorMessage message={error} />

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Full Name</span>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">New Password</span>
              <input
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep your current password"
                className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              />
            </label>

            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
