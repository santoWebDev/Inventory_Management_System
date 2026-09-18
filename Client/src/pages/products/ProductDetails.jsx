import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../../api/productApi";
import { stockIn, stockOut, stockAdjustment } from "../../api/inventoryApi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isEmployee } = useAuth();
  const [product, setProduct] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [modal, setModal] = useState(null),
    [saving, setSaving] = useState(false),
    [form, setForm] = useState({ quantity: "", newStock: "", reason: "" });
  const load = async () => {
    setLoading(true);
    try {
      const r = await getProduct(id);
      setProduct(r.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "in")
        await stockIn({
          productId: id,
          quantity: Number(form.quantity),
          reason: form.reason,
        });
      if (modal === "out")
        await stockOut({
          productId: id,
          quantity: Number(form.quantity),
          reason: form.reason,
        });
      if (modal === "adjust")
        await stockAdjustment({
          productId: id,
          newStock: Number(form.newStock),
          reason: form.reason,
        });
      setModal(null);
      setForm({ quantity: "", newStock: "", reason: "" });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Inventory update failed");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loader />;
  if (!product) return <ErrorMessage message={error || "Product not found"} />;
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/products" className="text-sm text-blue-600">
            ← Products
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
          {product.status}
        </span>
      </div>
      <ErrorMessage message={error} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Price</p>
          <p className="mt-2 text-2xl font-bold">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Current Stock</p>
          <p className="mt-2 text-2xl font-bold">{product.stock}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Category</p>
          <p className="mt-2 font-semibold">{product.category?.name || "-"}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Supplier</p>
          <p className="mt-2 font-semibold">{product.supplier?.name || "-"}</p>
        </div>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Inventory Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {(isAdmin || isEmployee) && (
            <>
              <Button onClick={() => setModal("in")}>Stock In</Button>
              <Button variant="secondary" onClick={() => setModal("out")}>
                Stock Out
              </Button>
            </>
          )}
          {isAdmin && (
            <Button variant="secondary" onClick={() => setModal("adjust")}>
              Adjustment
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate(`/inventory/${id}/history`)}
          >
            View History
          </Button>
        </div>
      </div>
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
          {modal === "adjust" ? (
            <input
              type="number"
              min="0"
              required
              value={form.newStock}
              onChange={(e) => setForm({ ...form, newStock: e.target.value })}
              placeholder="New stock"
              className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          ) : (
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="Quantity"
              className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          )}
          <textarea
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason"
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
export default ProductDetails;
