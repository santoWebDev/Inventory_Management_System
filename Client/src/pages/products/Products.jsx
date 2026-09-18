import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getSuppliers } from "../../api/supplierApi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";

const empty = {
  name: "",
  description: "",
  price: "",
  category: "",
  supplier: "",
  stock: "0",
  lowStockThreshold: "10",
  status: "active", 
};

const Products = () => {
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]),
    [categories, setCategories] = useState([]),
    [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1),
    [meta, setMeta] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState(null),
    [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [p, c, s] = await Promise.all([
        getProducts({ search, category, status, page, limit: 10 }),
        getCategories(),
        getSuppliers({ status: "active", limit: 100 }),
      ]);
      setProducts(p.data || []);
      setMeta(p);
      setCategories(c.data || []);
      setSuppliers(s.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [page, category, status]);
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
      const data = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
      };
      if (editing) {
        delete data.stock;
        await updateProduct(editing._id, data);
      } else await createProduct(data);
      setModal(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };
  const edit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price ?? "",
      category: p.category?._id || p.category || "",
      supplier: p.supplier?._id || p.supplier || "",
      stock: p.stock ?? 0,
      lowStockThreshold: p.lowStockThreshold ?? 10,
      status: p.status || "active",
    });
    setModal(true);
  };  
  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-500">
            Manage products and stock information
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditing(null);
              setForm(empty);
              setModal(true);
            }}
          >
            + Add Product
          </Button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product..."
          className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products"
          message="No products match your filters."
        />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Supplier",
                  "Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <Link
                      to={`/products/${p._id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="max-w-xs truncate text-xs text-slate-500">
                      {p.description}
                    </p>
                  </td>
                  <td className="px-4 py-3">{p.category?.name || "-"}</td>
                  <td className="px-4 py-3">{p.supplier?.name || "-"}</td>
                  <td className="px-4 py-3">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.stock === 0
                          ? "font-semibold text-red-600"
                          : p.stock <= p.lowStockThreshold
                            ? "font-semibold text-amber-600"
                            : ""
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(isAdmin || isEmployee) && (
                        <Button variant="secondary" onClick={() => edit(p)}>
                          Edit
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="danger" onClick={() => remove(p._id)}>
                          Delete
                        </Button>
                      )}
                    </div>
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
        title={editing ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <input
            className="w-full min-w-0 rounded-lg border px-4 py-2.5 sm:col-span-2"
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <textarea
            className="w-full min-w-0 rounded-lg border px-4 py-2.5 sm:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full min-w-0 rounded-lg border px-4 py-2.5"
            placeholder="Price"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
          <input
            type="number"
            min="0"
            disabled={Boolean(editing)}
            className="w-full min-w-0 rounded-lg border px-4 py-2.5 disabled:bg-slate-100"
            placeholder="Opening stock"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
          <select
            required
            className="w-full min-w-0 rounded-lg border px-4 py-2.5"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category</option>
            {categories
              .filter((c) => c.status === "active")
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
          <select
            required
            className="w-full min-w-0 rounded-lg border px-4 py-2.5"
            value={form.supplier}
            onChange={(e) => set("supplier", e.target.value)}
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            className="w-full min-w-0 rounded-lg border px-4 py-2.5"
            placeholder="Low stock threshold"
            value={form.lowStockThreshold}
            onChange={(e) => set("lowStockThreshold", e.target.value)}
          />
          <select
            className="w-full min-w-0 rounded-lg border px-4 py-2.5"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Products;
