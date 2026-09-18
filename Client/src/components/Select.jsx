const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
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

    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default Select;
