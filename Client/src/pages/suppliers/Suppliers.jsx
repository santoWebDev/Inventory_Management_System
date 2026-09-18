import { useEffect, useState } from "react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../api/supplierApi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";

const emptyForm = { name: "", email: "", number: "", status: "active" };

const Suppliers = () => {
  const { isAdmin, isEmployee } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSuppliers({ search, status, page, limit: 10 });
      setSuppliers(res.data || []);
      setMeta(res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [page, status]);
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await updateSupplier(editing._id, form);
      else await createSupplier(form);
      setModal(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };
  const edit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || "",
      email: s.email || "",
      number: s.number || "",
      status: s.status || "active",
    });
    setModal(true);
  };
  const remove = async (id) => {
    if (!window.confirm("Delete/deactivate this supplier?")) return;
    try {
      await deleteSupplier(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-sm text-slate-500">Manage suppliers</p>
        </div>
        {isAdmin && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setModal(true);
            }}
          >
            + Add Supplier
          </Button>
        )}
      </div>
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email or phone..."
          className="block w-full min-w-0 flex-1 rounded-lg border bg-white px-4 py-2.5 outline-none focus:border-teal-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 sm:w-auto"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="No suppliers"
          message="No suppliers match your filters."
        />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {["Name", "Email", "Phone", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.number}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(isAdmin || isEmployee) && (
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => edit(s)}>
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="danger"
                            onClick={() => remove(s._id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pages={meta.pages} onPageChange={setPage} />
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Supplier" : "Add Supplier"}
      >
        <form onSubmit={submit} className="space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Supplier name"
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="Email"
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          />
          <input
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            required
            placeholder="Phone number"
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
export default Suppliers;
