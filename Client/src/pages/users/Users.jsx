import { useEffect, useState } from "react";
import { getUsers, updateUserStatus, updateUser } from "../../api/userApi";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const Users = () => {
  const [users, setUsers] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(null),
    [form, setForm] = useState({ name: "", email: "", password: "" }),
    [saving, setSaving] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await getUsers();
      setUsers(r.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const status = async (u) => {
    try {
      await updateUserStatus(
        u._id || u.id,
        u.status === "active" ? "inactive" : "active",
      );
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Status update failed");
    }
  };
  const edit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "" });
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name: form.name, email: form.email };
      if (form.password) data.password = form.password;
      await updateUser(editing._id || editing.id, data);
      setEditing(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-slate-500">Admin user management</p>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => edit(u)}>
                        Edit
                      </Button>
                      <Button
                        variant={u.status === "active" ? "danger" : "primary"}
                        onClick={() => status(u)}
                      >
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit User"
      >
        <form onSubmit={save} className="space-y-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            placeholder="Name"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            placeholder="Email"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            placeholder="New password (optional)"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
export default Users;
