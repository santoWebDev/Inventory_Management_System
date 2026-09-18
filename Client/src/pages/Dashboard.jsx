import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";

const statStyles = [
  {
    title: "Total Products",
    key: "products.total",
    icon: "▣",
    iconClass: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "Low Stock",
    key: "products.lowStock",
    icon: "⚠",
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    title: "Out of Stock",
    key: "products.outOfStock",
    icon: "□",
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    title: "Total Suppliers",
    key: "suppliers.total",
    icon: "♙",
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    title: "Total Orders",
    key: "orders.total",
    icon: "□",
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Delivered",
    key: "orders.delivered",
    icon: "✓",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Cancelled",
    key: "orders.cancelled",
    icon: "×",
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    title: "Total Sales",
    key: "sales.total",
    icon: "₹",
    iconClass: "bg-teal-50 text-teal-600",
  },
];

const getValue = (object, path) =>
  path.split(".").reduce((value, key) => value?.[key], object);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getDashboard();
        setDashboard(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  const recentOrders = dashboard?.recentOrders || [];
  const lowStockProducts = dashboard?.lowStockProducts || dashboard?.lowStockItems || [];

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-7">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your inventory system
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statStyles.map((card) => {
          const value = getValue(dashboard, card.key);

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${card.iconClass}`}
                >
                  {card.icon}
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {card.title === "Total Sales" ? `₹${value ?? 0}` : value ?? 0}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Orders
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest activity in your system
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Latest 5
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No recent orders found.
            </div>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between gap-4 rounded-xl border-b border-slate-100 px-2 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.user?.name || "Unknown user"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ₹{order.totalAmount}
                    </p>
                    <span className="mt-1 inline-block text-xs capitalize text-slate-500">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Low Stock</h2>
              <p className="mt-1 text-xs text-slate-500">
                Products that need attention
              </p>
            </div>

            <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              {lowStockProducts.length} item
              {lowStockProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-8 text-center text-sm font-medium text-emerald-700">
              All products have sufficient stock.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-100">
              <div className="grid grid-cols-[minmax(0,1fr)_96px] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Product</span>
                <span className="text-right">Quantity</span>
              </div>

              <div>
                {lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-3 border-t border-slate-100 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {product.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {product.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex min-w-16 justify-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
