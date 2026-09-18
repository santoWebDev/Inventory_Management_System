const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}) => {
  const styles = {
    primary:
      "bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus:ring-teal-100",
    danger:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-100",
    secondary:
      "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
