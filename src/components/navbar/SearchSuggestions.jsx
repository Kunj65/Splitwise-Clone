const SearchSuggestions = ({
  suggestions,
  currentPage,
  onSelect,
}) => {
  if (!suggestions.length) return null;

  return (
    <div
      className="
        absolute
        top-14
        left-0
        w-full
        rounded-2xl
        border
        border-white/10
        bg-slate-950
        overflow-hidden
        z-50
        shadow-2xl
      "
    >
      {suggestions.map((item, index) => (
        <button
          key={item._id || item.id || index}
          onClick={() => onSelect(item)}
          className="
            w-full
            px-4
            py-3
            text-left
            hover:bg-white/[0.05]
            border-b
            border-white/5
            transition-all
          "
        >
          {/* GROUPS */}
          {currentPage === "groups" && (
            <div>
              <p className="font-medium text-white">
                {item.name}
              </p>

              <p className="text-xs text-slate-400">
                Group
              </p>
            </div>
          )}

          {/* FRIENDS */}
          {currentPage === "friends" && (
            <div>
              <p className="font-medium text-white">
                {item.name}
              </p>

              <p className="text-xs text-slate-400">
                {item.email}
              </p>
            </div>
          )}

          {/* ACTIVITY */}
          {currentPage === "activity" && (
            <div>
              <p className="text-sm text-white">
                {item.message}
              </p>

              {item.createdAt && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* SUMMARY */}
          {currentPage === "summary" && (
            <div>
              <p className="font-medium text-white">
                {item.description || "Expense"}
              </p>

              <p className="text-xs text-slate-400">
                ₹{item.amount || 0}
              </p>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;