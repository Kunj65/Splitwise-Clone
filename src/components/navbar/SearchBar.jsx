import SearchSuggestions from "./SearchSuggestions";

const SearchBar = ({
  query,
  setQuery,
  placeholder,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  handleSearch,
  handleSuggestionClick,
  currentPage,
}) => {
  return (
    <div className="relative hidden md:block">
      <div className="flex items-center gap-2">

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="
            w-[320px]
            h-11
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-4
            text-sm
            text-white
            placeholder:text-slate-500
            outline-none
            focus:border-cyan-400/40
          "
        />

        <button
          onClick={handleSearch}
          className="
            h-11
            px-5
            rounded-xl
            bg-gradient-to-r
            from-cyan-400
            to-emerald-400
            text-black
            font-semibold
          "
        >
          Search
        </button>

      </div>

      {showSuggestions && query && (
        <SearchSuggestions
          suggestions={suggestions}
          currentPage={currentPage}
          onSelect={handleSuggestionClick}
        />
      )}
    </div>
  );
};

export default SearchBar;