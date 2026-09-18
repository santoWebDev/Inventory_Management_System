import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, getMyOrders, createOrder } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Button from "../../components/Button";

const Orders = () => {
  const { isAdmin, isEmployee } = useAuth();
  const [orders, setOrders] = useState([]),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1),
    [meta, setMeta] = useState({ pages: 1 }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [modal, setModal] = useState(false),
    [products, setProducts] = useState([]),
    [items, setItems] = useState([{ productId: "", quantity: 1 }]),
    [saving, setSaving] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = isAdmin
        ? await getOrders({ status, page, limit: 10 })
        : await getMyOrders();
      setOrders(r.data || []);
      setMeta(r);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [page, status, isAdmin]);
  const openCreate = async () => {
    try {
      const r = await getProducts({ status: "active", limit: 100 });
      setProducts(r.data || []);
      setItems([{ productId: "", quantity: 1 }]);
      setModal(true);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load products");
    }
  };
  const updateItem = (i, k, v) =>
    setItems(items.map((x, index) => (index === i ? { ...x, [k]: v } : x)));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrder({
        items: items.map((x) => ({
          productId: x.productId,
          quantity: Number(x.quantity),
        })),
      });
      setModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? "Manage all orders" : "View and create orders"}
          </p>
        </div>
        {(isAdmin || isEmployee) && (
          <Button className="w-full sm:w-auto" onClick={openCreate}>+ Create Order</Button>
        )}
      </div>
      {isAdmin && (
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full min-w-0 rounded-lg border bg-white px-4 py-2.5 sm:w-auto"
        >
          <option value="">All status</option>
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      )}
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" message="No orders found." />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Date",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.user?.name || "-"}</td>
                  <td className="px-4 py-3">{o.items?.length || 0}</td>
                  <td className="px-4 py-3">
                    ₹{Number(o.totalAmount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Link
                      to={`/orders/${o._id}`}
                      className="inline-flex h-9 min-w-16 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}{" "}
      {isAdmin && (
        <Pagination page={page} pages={meta.pages} onPageChange={setPage} />
      )}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Create Order"
      >
        <form onSubmit={submit} className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <select
                required
                value={item.productId}
                onChange={(e) => updateItem(i, "productId", e.target.value)}
                className="w-full min-w-0 rounded-lg border px-3 py-2.5"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — stock {p.stock}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                required
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                className="w-full min-w-0 rounded-lg border px-3 py-2.5"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setItems(items.filter((_, index) => index !== i))
                  }
                  className="rounded-lg bg-red-50 px-3 text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems([...items, { productId: "", quantity: 1 }])}
            className="text-sm font-semibold text-blue-600"
          >
            + Add item
          </button>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Orders;
