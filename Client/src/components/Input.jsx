const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) => (
  <div className="w-full min-w-0 space-y-1.5">
    {label && (
      <label
        htmlFor={name}
        className="block truncate text-sm font-medium text-slate-700"
      >
        {label}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`block w-full min-w-0 max-w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
        error
          ? "border-red-400 focus:ring-4 focus:ring-red-50"
          : "border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
      }`}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;
