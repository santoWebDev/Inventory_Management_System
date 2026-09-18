import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 border-b border-slate-200 bg-white">
      <div className="flex min-h-[72px] min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          >
            ☰
          </button>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600">
              Inventory
            </p>
            <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
              Management Console
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link
            to="/profile"
            className="flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-slate-50 sm:px-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] capitalize text-slate-500">
                {user?.role || "user"}
              </p>
            </div>
          </Link>

          <button
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            ↪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
