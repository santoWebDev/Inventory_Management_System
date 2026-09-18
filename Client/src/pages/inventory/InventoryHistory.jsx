import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../../api/productApi";
import { getInventoryHistory } from "../../api/inventoryApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";

const InventoryHistory = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null),
    [data, setData] = useState([]),
    [meta, setMeta] = useState({ pages: 1 }),
    [page, setPage] = useState(1),
    [type, setType] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const [p, h] = await Promise.all([
        getProduct(productId),
        getInventoryHistory(productId, { page, limit: 20, type }),
      ]);
      setProduct(p.data);
      setData(h.data || []);
      setMeta(h);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [productId, page, type]);
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div>
        <Link to={`/products/${productId}`} className="text-sm text-blue-600">
          ← Product
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Inventory History</h1>
        <p className="text-sm text-slate-500">{product?.name}</p>
      </div>
      <div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
        >
          <option value="">All transactions</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {[
                  "Date",
                  "Type",
                  "Quantity",
                  "Previous",
                  "New",
                  "Reason",
                  "Performed By",
                ].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((t) => (
                  <tr key={t._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold">{t.type}</td>
                    <td className="px-4 py-3">{t.quantity}</td>
                    <td className="px-4 py-3">{t.previousStock}</td>
                    <td className="px-4 py-3">{t.newStock}</td>
                    <td className="px-4 py-3">{t.reason}</td>
                    <td className="px-4 py-3">{t.performedBy?.name || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pages={meta.pages} onPageChange={setPage} />
    </div>
  );
};
export default InventoryHistory;
