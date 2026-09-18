import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus, cancelOrder } from "../../api/orderApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const OrderDetails = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getOrder(id);
      setOrder(response.data);
      setStatus(response.data.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const changeStatus = async () => {
    setSaving(true);
    setError("");
    try {
      await updateOrderStatus(id, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await cancelOrder(id, reason);
      setCancelOpen(false);
      setReason("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return <ErrorMessage message={error || "Order not found"} />;

  const canCancel = !["cancelled", "shipped", "delivered"].includes(order.status);

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            ← Back to Orders
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyles[order.status] || "bg-slate-50 text-slate-700"}`}>
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {canCancel && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancel Order
          </Button>
        )}
      </div>

      <ErrorMessage message={error} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">Order Items</h2>
            <p className="text-sm text-slate-500">Products included in this order</p>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.product} className="grid grid-cols-[1fr_auto] gap-4 px-6 py-5 sm:grid-cols-[1fr_100px_130px] sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="text-right text-sm text-slate-500 sm:text-center">
                  Qty {item.quantity}
                </p>
                <p className="text-right font-bold text-slate-900">
                  ₹{Number(item.subtotal).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5">
            <span className="font-semibold text-slate-600">Total</span>
            <span className="text-xl font-bold text-slate-900">
              ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
            <h2 className="mt-3 font-bold text-slate-900">{order.user?.name || "-"}</h2>
            <p className="mt-1 break-all text-sm text-slate-500">{order.user?.email || "-"}</p>
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Order Status</h2>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={["cancelled", "delivered"].includes(order.status)}
                className="mt-4 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100"
              >
                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <Button
                className="mt-3 w-full"
                disabled={saving || status === order.status || ["cancelled", "delivered"].includes(order.status)}
                onClick={changeStatus}
              >
                {saving ? "Updating..." : "Update Status"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Order"
      >
        <form onSubmit={cancel} className="space-y-4">
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Cancellation reason"
            className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Keep Order
            </Button>
            <Button variant="danger" type="submit" disabled={saving}>
              {saving ? "Cancelling..." : "Cancel Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetails;
