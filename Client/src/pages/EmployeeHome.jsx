import { Link } from "react-router-dom";

const EmployeeHome = () => {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your assigned inventory operations.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/orders"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Orders
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create and view orders.
          </p>
          <p className="mt-4 text-sm font-semibold text-indigo-600">
            Go to Orders →
          </p>
        </Link>

        <Link
          to="/products"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Products
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            View products and available stock.
          </p>
          <p className="mt-4 text-sm font-semibold text-indigo-600">
            Go to Products →
          </p>  
        </Link>

        <Link
          to="/inventory"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Inventory
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage permitted inventory operations.
          </p>
          <p className="mt-4 text-sm font-semibold text-indigo-600">
            Go to Inventory →
          </p>
        </Link>
      </div>
    </div>
  );
};

export default EmployeeHome;