const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 sm:p-4">
      <div className="my-auto w-full min-w-0 max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <h2 className="min-w-0 truncate text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        <div className="max-h-[80vh] min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
