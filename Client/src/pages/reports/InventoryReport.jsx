import { useEffect, useState } from "react";
import { getInventoryReport } from "../../api/reportApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import Button from "../../components/Button";
import { downloadCsv } from "../../utils/downloadCsv";

const InventoryReport = () => {
  const [type, setType] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const r = await getInventoryReport(type ? { type } : {});
      setReport(r.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load inventory report");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [type]);

  const downloadReport = () => {
    if (!report) return;

    const rows = [
      ...report.transactionSummary.map((summary) => ({
        Section: "Transaction Summary",
        Product: summary._id,
        Category: "",
        Supplier: "",
        Price: "",
        Stock: "",
        Threshold: "",
        StockStatus: "",
        Status: `${summary.totalTransactions} transactions / ${summary.totalQuantity} units`,
      })),
      ...report.products.map((product) => ({
        Section: "Products",
        Product: product.name,
        Category: product.category?.name || "",
        Supplier: product.supplier?.name || "",
        Price: product.price,
        Stock: product.stock,
        Threshold: product.lowStockThreshold,
        StockStatus: product.stockStatus,
        Status: product.status,
      })),
    ];

    downloadCsv("inventory-report.csv", rows);
  };
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Inventory Report</h1>
          <p className="mt-1 text-sm text-slate-500">Current stock and inventory transactions</p>
        </div>
        <Button variant="secondary" onClick={downloadReport} disabled={!report}>
          ↓ Download CSV
        </Button>
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
      >
        <option value="">All transaction types</option>
        <option value="IN">Stock In</option>
        <option value="OUT">Stock Out</option>
        <option value="ADJUSTMENT">Adjustment</option>
      </select>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        report && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {["IN", "OUT", "ADJUSTMENT"].map((t) => {
                const x = report.transactionSummary.find((v) => v._id === t);
                return (
                  <div key={t} className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">{t}</p>
                    <p className="mt-2 text-2xl font-bold">
                      {x?.totalQuantity || 0}
                    </p>
                    <p className="text-xs text-slate-500">
                      {x?.totalTransactions || 0} transactions
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    {[
                      "Product",
                      "Category",
                      "Supplier",
                      "Price",
                      "Stock",
                      "Threshold",
                      "Stock Status",
                      "Status",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.products.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3">{p.category?.name || "-"}</td>
                      <td className="px-4 py-3">{p.supplier?.name || "-"}</td>
                      <td className="px-4 py-3">
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">{p.lowStockThreshold}</td>
                      <td className="px-4 py-3">{p.stockStatus}</td>
                      <td className="px-4 py-3">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
};
export default InventoryReport;
