import { useState } from "react";

const ExpenseSearch = ({ expenses, onResults }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (q) => {
    setQuery(q);
    if (!q.trim()) {
      onResults(null);
      return;
    }
    const filtered = expenses.filter(
      (e) =>
        e.description?.toLowerCase().includes(q.toLowerCase()) ||
        String(e.amount).includes(q)
    );
    onResults(filtered);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="🔍 Search expenses..."
        className="w-full bg-black/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-emerald-400"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); onResults(null); }}
          className="absolute right-3 top-3 text-slate-400 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ExpenseSearch;