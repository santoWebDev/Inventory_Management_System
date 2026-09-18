const EmptyState = ({
  title = "No data found",
  message = "There are no records to display.",
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
        📦
      </div>

      <h3 className="font-semibold text-slate-800">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
};

export default EmptyState;
