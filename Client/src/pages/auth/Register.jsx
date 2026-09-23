import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
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
          <div className="mx-30 mb-4 flex h-10 w-auto items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <span className="text-xl font-bold">Register</span>
          </div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Register for Inventory Management
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
          className="w-full space-y-4"
        >
          {/* Name */}
          <div className="w-full">
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>

            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Enter your full name"
              className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Email */}
          <div className="w-full">
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="register-email"
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
              htmlFor="register-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="register-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Create a password"
              className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Confirm Password */}
          <div className="w-full">
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-7 text-center text-sm text-slate-500">
          Already have an account?
          <Link
            to="/login"
            className="ml-1 font-semibold text-teal-600 hover:text-teal-700"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;