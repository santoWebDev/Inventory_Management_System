import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-slate-100 px-3 py-6 sm:px-6 sm:py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">

        {/* Header */}
        <div className="mb-7 text-center sm:mb-8">
          <div className="mx-30 mb-4 flex h-12 w-auto items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <span className="text-xl font-bold">Login</span>
          </div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Inventory Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 w-full break-words rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5"
        >
          {/* Email */}
          <div className="w-full">
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Password */}
          <div className="w-full">
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-7 text-center text-sm text-slate-500">
          Don't have an account?
          <Link
            to="/register"
            className="ml-1 font-semibold text-teal-600 hover:text-teal-700"
          >
            Register
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;