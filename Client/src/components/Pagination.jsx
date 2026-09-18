const Pagination = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {Array.from({ length: pages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-lg px-3 py-2 text-sm ${
              pageNumber === page
                ? "bg-blue-600 text-white"
                : "border bg-white text-slate-700"
            }`}
          >
            {pageNumber}
          </button>
        ),
      )}

      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
