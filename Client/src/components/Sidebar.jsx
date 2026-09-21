import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Icon = ({ children }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm text-slate-300 transition group-[.active]:bg-white/10 group-hover:text-white">
    {children}
  </span>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `group flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "active bg-teal-600 text-white shadow-sm shadow-teal-950/20"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const closeMobile = () => {
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-slate-900 text-white shadow-xl transition-transform duration-300 md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="min-w-0">
            <p className="text-base font-bold tracking-wide text-white">
              INVENTORY
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Control Center
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink to="/dashboard" className={linkClass} onClick={closeMobile}>
            <Icon>⌂</Icon>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={closeMobile}>
            <Icon>▣</Icon>
            Products
          </NavLink>
          <NavLink to="/categories" className={linkClass} onClick={closeMobile}>
            <Icon>◫</Icon>
            Categories
          </NavLink>
          <NavLink to="/suppliers" className={linkClass} onClick={closeMobile}>
            <Icon>♙</Icon>
            Suppliers
          </NavLink>
          <NavLink to="/inventory" className={linkClass} onClick={closeMobile}>
            <Icon>▤</Icon>
            Inventory
          </NavLink>
          <NavLink to="/orders" className={linkClass} onClick={closeMobile}>
            <Icon>□</Icon>
            Orders
          </NavLink>
          <NavLink to="/customers" className={linkClass} onClick={closeMobile}>
            <Icon>♙</Icon>
            Customers
          </NavLink>
          <NavLink to="/logistics" className={linkClass} onClick={closeMobile}>
            <Icon>⇢</Icon>
            Logistics
          </NavLink>

          <div className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </div>

          <NavLink to="/profile" className={linkClass} onClick={closeMobile}>
            <Icon>◉</Icon>
            My Profile
          </NavLink>

          {isAdmin && (
            <>
              <div className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Administration
              </div>
              <NavLink
                to="/reports/sales"
                className={linkClass}
                onClick={closeMobile}
              >
                <Icon>↗</Icon>
                Sales Report
              </NavLink>
              <NavLink
                to="/reports/inventory"
                className={linkClass}
                onClick={closeMobile}
              >
                <Icon>▥</Icon>
                Inventory Report
              </NavLink>
              <NavLink to="/users" className={linkClass} onClick={closeMobile}>
                <Icon>♟</Icon>
                Users
              </NavLink>
            </>
          )}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs capitalize text-slate-400">
                {user?.role || "user"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              ↪
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
