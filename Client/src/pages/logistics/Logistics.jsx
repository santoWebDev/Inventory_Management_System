import { useEffect, useState } from "react";
import { getLogistics, createLogistics, updateLogistics } from "../../api/logisticsApi";
import { getOrders } from "../../api/orderApi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const empty = { orderId: "", carrier: "", trackingNumber: "", shippingAddress: "", status: "pending", estimatedDelivery: "" };

export default function Logistics() {
  const { isAdmin, isEmployee } = useAuth();
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [l, o] = await Promise.all([
        getLogistics(status ? { status } : {}),
        getOrders({ limit: 100 }),
      ]);
      setRows(l.data || []);
      setOrders(o.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load logistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        orderId: form.orderId,
        estimatedDelivery: form.estimatedDelivery || null,
      };
      if (editing) await updateLogistics(editing._id, payload);
      else await createLogistics(payload);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-teal-600">FULFILLMENT</p>
          <h1 className="text-3xl font-bold">Logistics</h1>
          <p className="text-sm text-slate-500">Track shipping, carriers and delivery status.</p>
        </div>
        {(isAdmin || isEmployee) && (
          <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}>
            + Add Shipment
          </Button>
        )}
      </div>

      <select className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-3" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {["pending", "shipped", "in_transit", "delivered", "cancelled"].map((x) => <option key={x} value={x}>{x}</option>)}
      </select>

      <ErrorMessage message={error} />

      {loading ? <Loader /> : rows.length === 0 ? (
        <EmptyState title="No shipments" message="No logistics records match your filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50"><tr>{["Order", "Carrier", "Tracking", "Address", "Status", "ETA", "Actions"].map((x) => <th className="px-4 py-3 text-left" key={x}>{x}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-t border-slate-100" key={r._id}>
                  <td className="px-4 py-3 font-semibold">#{r.order?.orderNumber || r.order?._id || "—"}</td>
                  <td className="px-4 py-3">{r.carrier || "—"}</td>
                  <td className="px-4 py-3">{r.trackingNumber || "—"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3">{r.shippingAddress || "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{r.status}</span></td>
                  <td className="px-4 py-3">{r.estimatedDelivery ? new Date(r.estimatedDelivery).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    {(isAdmin || isEmployee) && <Button variant="secondary" onClick={() => { setEditing(r); setForm({ orderId: r.order?._id || r.order || "", carrier: r.carrier || "", trackingNumber: r.trackingNumber || "", shippingAddress: r.shippingAddress || "", status: r.status || "pending", estimatedDelivery: r.estimatedDelivery ? new Date(r.estimatedDelivery).toISOString().slice(0, 16) : "" }); setModal(true); }}>Edit</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Update Shipment" : "Add Shipment"}>
        <form onSubmit={submit} className="space-y-4">
          {!editing && <select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full rounded-xl border px-4 py-3"><option value="">Select order</option>{orders.map((o) => <option key={o._id} value={o._id}>{o.orderNumber} — ₹{o.totalAmount}</option>)}</select>}
          <input placeholder="Carrier" value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} className="w-full rounded-xl border px-4 py-3" />
          <input placeholder="Tracking number" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} className="w-full rounded-xl border px-4 py-3" />
          <textarea placeholder="Shipping address" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} className="w-full rounded-xl border px-4 py-3" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border px-4 py-3">{["pending", "shipped", "in_transit", "delivered", "cancelled"].map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <input type="datetime-local" value={form.estimatedDelivery ? String(form.estimatedDelivery).slice(0, 16) : ""} onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} className="w-full rounded-xl border px-4 py-3" />
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
        </form>
      </Modal>
    </div>
  );
}
