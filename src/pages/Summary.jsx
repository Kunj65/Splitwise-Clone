import { useState } from "react";
import AnimatedPage from "../components/AnimatedPage";
import useGroups from "../context/useGroups";
import { calculateBalancesWithDetails } from "../utils/splitLogic";
import { currencySymbols } from "../utils/currencySymbols";

const Summary = () => {
  const data = useGroups();
  const groups = data?.groups ?? [];
  const expensesByGroup = data?.expensesByGroup ?? {};

  // Collect all currencies present in expenses
  const allCurrencies = [
    ...new Set(
      groups.flatMap((group) =>
        (expensesByGroup[group.id] || [])
          .filter((e) => !e.deleted)
          .map((e) => e.currency || "INR")
      )
    ),
  ].sort();

  const [selectedCurrency, setSelectedCurrency] = useState(allCurrencies[0] || "INR");

  // Calculate totals for selected currency only
  let totalYouOwe = 0;
  let totalYouGet = 0;

  groups.forEach((group) => {
    const expenses = (expensesByGroup[group.id] || [])
      .filter((e) => !e.deleted && (e.currency || "INR") === selectedCurrency);

    expenses.forEach((expense) => {
      const balances = calculateBalancesWithDetails([expense], group.members);
      const you = balances?.["You"];
      if (!you) return;

      if (you.total < 0) {
        totalYouOwe += Math.abs(you.total);
      } else {
        totalYouGet += you.total;
      }
    });
  });

  const net = totalYouGet - totalYouOwe;
  const sym = currencySymbols[selectedCurrency] || selectedCurrency + " ";

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-8">

          <h1 className="text-3xl font-bold text-center">Summary</h1>

          {/* Currency Dropdown */}
          <div className="flex justify-center">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-black/40 border border-white/20 text-white rounded-xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {allCurrencies.map((c) => (
                <option key={c} value={c}>
                  {currencySymbols[c]} {c}
                </option>
              ))}
            </select>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 text-center">
              <p className="text-gray-400 mb-2">You Owe</p>
              <p className="text-3xl font-bold text-red-400">
                {sym}{totalYouOwe.toFixed(2)}
              </p>
            </div>
            <div className="glass rounded-3xl p-6 text-center">
              <p className="text-gray-400 mb-2">You Get</p>
              <p className="text-3xl font-bold text-emerald-400">
                {sym}{totalYouGet.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-gray-400 mb-2">Net Balance</p>
            <p className={`text-2xl font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {sym}{Math.abs(net).toFixed(2)}
              <span className="text-base ml-2 font-normal text-gray-400">
                {net >= 0 ? "in your favour" : "you owe"}
              </span>
            </p>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default Summary;