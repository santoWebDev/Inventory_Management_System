import { useEffect, useState } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../api/customerApi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";

const empty = { name: "", email: "", phone: "", address: "", status: "active" };

export default function Customers() {
  const { isAdmin, isEmployee } = useAuth();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await getCustomers({ search, status, limit: 100 });
      setRows(r.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await updateCustomer(editing._id, form);
      else await createCustomer(form);
      setModal(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Deactivate customer?")) return;
    try {
      await deleteCustomer(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-teal-600">CUSTOMER MANAGEMENT</p>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer profiles and order relationships.</p>
        </div>
        {(isAdmin || isEmployee) && (
          <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}>
            + Add Customer
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          placeholder="Search name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loader /> : rows.length === 0 ? (
        <EmptyState title="No customers" message="No customers match your filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50">
              <tr>{["Customer", "Email", "Phone", "Address", "Status", "Actions"].map((x) => (
                <th className="px-4 py-3 text-left" key={x}>{x}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr className="border-t border-slate-100" key={c._id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="max-w-[260px] truncate px-4 py-3">{c.address || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(isAdmin || isEmployee) && (
                        <Button variant="secondary" onClick={() => { setEditing(c); setForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", address: c.address || "", status: c.status || "active" }); setModal(true); }}>
                          Edit
                        </Button>
                      )}
                      {isAdmin && <Button variant="danger" onClick={() => remove(c._id)}>Delete</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={submit} className="space-y-4">
          {[['name', 'Customer name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address']].map(([k, p]) => (
            <input
              key={k}
              type={k === "email" ? "email" : "text"}
              required={k !== "address"}
              placeholder={p}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          ))}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
        </form>
      </Modal>
    </div>
  );
}
