import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../api/productApi";
import { stockIn, stockOut, stockAdjustment } from "../../api/inventoryApi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const Inventory = () => {
  const { isAdmin, isEmployee } = useAuth();
  const [products, setProducts] = useState([]),
    [search, setSearch] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [modal, setModal] = useState(null),
    [product, setProduct] = useState(null),
    [saving, setSaving] = useState(false),
    [form, setForm] = useState({ quantity: "", newStock: "", reason: "" });
  const load = async () => {
    setLoading(true);
    try {
      const r = await getProducts({ search, limit: 100, status: "active" });
      setProducts(r.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);
  const open = (type, p) => {
    setModal(type);
    setProduct(p);
    setForm({ quantity: "", newStock: p.stock, reason: "" });
  };
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { productId: product._id, reason: form.reason };
      if (modal === "in")
        await stockIn({ ...data, quantity: Number(form.quantity) });
      if (modal === "out")
        await stockOut({ ...data, quantity: Number(form.quantity) });
      if (modal === "adjust")
        await stockAdjustment({ ...data, newStock: Number(form.newStock) });
      setModal(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Inventory update failed");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-slate-500">Manage stock movements</p>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search product..."
        className="block w-full min-w-0 max-w-full rounded-lg border bg-white px-4 py-2.5"
      />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState title="No products" />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {["Product", "Stock", "Threshold", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <Link
                      className="font-semibold text-blue-600"
                      to={`/products/${p._id}`}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.stock}</td>
                  <td className="px-4 py-3">{p.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    {p.stock === 0 ? (
                      <span className="text-red-600">Out of stock</span>
                    ) : p.stock <= p.lowStockThreshold ? (
                      <span className="text-amber-600">Low stock</span>
                    ) : (
                      <span className="text-green-600">In stock</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-15">
                      {(isAdmin || isEmployee) && (
                        <>
                          <Button onClick={() => open("in", p)}>
                            Stock In
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => open("out", p)}
                          >
                            Stock Out
                          </Button>
                        </>
                      )}
                      {isAdmin && (
                        <Button
                          variant="secondary"
                          onClick={() => open("adjust", p)}
                        >
                          Adjust
                        </Button>
                      )}
                      <Link
                        to={`/inventory/${p._id}/history`}
                        className="rounded-lg bg-slate-100 px-4 py-2 font-medium"
                      >
                        History
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={Boolean(modal)}
        onClose={() => setModal(null)}
        title={
          modal === "in"
            ? "Stock In"
            : modal === "out"
              ? "Stock Out"
              : "Stock Adjustment"
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <p className="font-semibold">{product?.name}</p>
          {modal === "adjust" ? (
            <input
              type="number"
              min="0"
              required
              value={form.newStock}
              onChange={(e) => setForm({ ...form, newStock: e.target.value })}
              className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              placeholder="New stock"
            />
          ) : (
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              placeholder="Quantity"
            />
          )}
          <textarea
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            placeholder="Reason"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
export default Inventory;
