import { useEffect, useState } from "react";
import { getSalesReport } from "../../api/reportApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import Button from "../../components/Button";
import { downloadCsv } from "../../utils/downloadCsv";

const SalesReport = () => {
  const [filters, setFilters] = useState({ from: "", to: "", status: "" });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await getSalesReport(filters);
      setReport(r.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load sales report");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const change = (k, v) => setFilters({ ...filters, [k]: v });

  const downloadReport = () => {
    if (!report) return;

    const rows = [
      {
        Section: "Summary",
        Date: "",
        Product: "Total Orders",
        Orders: report.summary.totalOrders,
        Sales: report.summary.totalSales,
        Quantity: "",
        Revenue: "",
      },
      {
        Section: "Summary",
        Date: "",
        Product: "Cancelled Orders",
        Orders: report.summary.cancelledOrders,
        Sales: "",
        Quantity: "",
        Revenue: "",
      },
      ...report.salesByDay.map((day) => ({
        Section: "Sales By Day",
        Date: day._id,
        Product: "",
        Orders: day.orders,
        Sales: day.sales,
        Quantity: "",
        Revenue: "",
      })),
      ...report.topProducts.map((product) => ({
        Section: "Top Products",
        Date: "",
        Product: product.productName,
        Orders: "",
        Sales: "",
        Quantity: product.quantitySold,
        Revenue: product.revenue,
      })),
    ];

    downloadCsv("sales-report.csv", rows);
  };
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Sales Report</h1>
          <p className="mt-1 text-sm text-slate-500">Sales and order performance</p>
        </div>
        <Button variant="secondary" onClick={downloadReport} disabled={!report}>
          ↓ Download CSV
        </Button>
      </div>
      <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:grid-cols-4">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => change("from", e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => change("to", e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        <select
          value={filters.status}
          onChange={(e) => change("status", e.target.value)}
          className="rounded-lg border px-3 py-2"
        >
          <option value="">All statuses</option>
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
        <button
          onClick={load}
          className="rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Apply Filters
        </button>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        report && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="mt-2 text-2xl font-bold">
                  {report.summary.totalOrders}
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Sales</p>
                <p className="mt-2 text-2xl font-bold">
                  ₹{Number(report.summary.totalSales).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Cancelled Orders</p>
                <p className="mt-2 text-2xl font-bold">
                  {report.summary.cancelledOrders}
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold">Sales By Day</h2>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Orders</th>
                        <th className="px-3 py-2">Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.salesByDay.map((d) => (
                        <tr key={d._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                          <td className="px-3 py-2">{d._id}</td>
                          <td className="px-3 py-2">{d.orders}</td>
                          <td className="px-3 py-2">
                            ₹{Number(d.sales).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold">Top Products</h2>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2">Qty Sold</th>
                        <th className="px-3 py-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topProducts.map((p) => (
                        <tr key={p._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                          <td className="px-3 py-2">{p.productName}</td>
                          <td className="px-3 py-2">{p.quantitySold}</td>
                          <td className="px-3 py-2">
                            ₹{Number(p.revenue).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};
export default SalesReport;
