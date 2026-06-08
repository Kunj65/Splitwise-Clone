import { useState } from "react";

const ExpenseForm = ({ members, onAddExpense }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [currency, setCurrency] = useState("INR");

  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState({});
  const [shares, setShares] = useState({});
  const [payments, setPayments] = useState({});

  const updateSplit = (m, v) =>
    setSplits((p) => ({ ...p, [m]: Number(v) }));

  const updateShares = (m, v) =>
    setShares((p) => ({ ...p, [m]: Number(v) }));

  const updatePayment = (m, v) =>
    setPayments((p) => ({ ...p, [m]: Number(v) }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !amount) return;

    const total = Number(amount);

    /* ---------- VALIDATE PAYMENTS ---------- */

    const paidTotal = Object.values(payments).reduce(
      (a, b) => a + b,
      0
    );

    if (paidTotal !== total) {
      alert("Total paid must equal expense amount");
      return;
    }

    let finalSplits = {};

    /* ---------- EQUAL ---------- */

    if (splitType === "equal") {
      const share = total / members.length;

      members.forEach((m) => {
        finalSplits[m] = share;
      });
    }

    /* ---------- EXACT ---------- */

    if (splitType === "exact") {
      const sum = Object.values(splits).reduce(
        (a, b) => a + b,
        0
      );

      if (sum !== total) {
        alert("Exact amounts must match total");
        return;
      }

      finalSplits = splits;
    }

    /* ---------- PERCENTAGE ---------- */

    if (splitType === "percentage") {
      const sum = Object.values(splits).reduce(
        (a, b) => a + b,
        0
      );

      if (sum !== 100) {
        alert("Percentages must total 100%");
        return;
      }

      members.forEach((m) => {
        finalSplits[m] =
          ((splits[m] || 0) / 100) * total;
      });
    }

    /* ---------- SHARES ---------- */

    if (splitType === "shares") {
      const totalShares = Object.values(shares).reduce(
        (a, b) => a + b,
        0
      );

      if (!totalShares) {
        alert("Enter shares");
        return;
      }

      const perShare = total / totalShares;

      members.forEach((m) => {
        finalSplits[m] =
          (shares[m] || 0) * perShare;
      });
    }

    try {
      await onAddExpense({
        description,
        amount: total,
        currency,
        splitType,
        paidBy:
          Object.keys(payments).find(
            (key) => payments[key] > 0
          ) || members[0],
        splitBetween: Object.keys(finalSplits),
      });

      setDescription("");
      setAmount("");
      setCurrency("INR");
      setSplits({});
      setShares({});
      setPayments({});
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-3xl p-6 space-y-4 fade-up"
    >
      <h3 className="text-xl font-semibold">
        Add Expense
      </h3>

      <input
        className="w-full bg-black/40 rounded-xl p-3"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <input
        type="number"
        className="w-full bg-black/40 rounded-xl p-3"
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
      />

      {/* SPLIT TYPE + CURRENCY */}

      <div className="grid md:grid-cols-2 gap-4">
        <select
          className="w-full bg-black/40 rounded-xl p-3"
          value={splitType}
          onChange={(e) =>
            setSplitType(e.target.value)
          }
        >
          <option value="equal">Equal</option>
          <option value="exact">Exact</option>
          <option value="percentage">Percentage</option>
          <option value="shares">Shares</option>
        </select>

        <select
          className="w-full bg-black/40 rounded-xl p-3"
          value={currency}
          onChange={(e) =>
            setCurrency(e.target.value)
          }
        >
          <option value="INR">🇮🇳 INR (₹)</option>
          <option value="USD">🇺🇸 USD ($)</option>
          <option value="EUR">🇪🇺 EUR (€)</option>
          <option value="GBP">🇬🇧 GBP (£)</option>
          <option value="JPY">🇯🇵 JPY (¥)</option>
          <option value="AUD">🇦🇺 AUD (A$)</option>
          <option value="CAD">🇨🇦 CAD (C$)</option>
          <option value="SGD">🇸🇬 SGD (S$)</option>
          <option value="AED">🇦🇪 AED</option>
          <option value="CNY">🇨🇳 CNY (¥)</option>
          <option value="CHF">🇨🇭 CHF</option>
          <option value="NZD">🇳🇿 NZD</option>
        </select>
      </div>

      {/* SPLITS */}

      {(splitType === "exact" ||
        splitType === "percentage") &&
        members.map((m) => (
          <input
            key={m}
            type="number"
            className="w-full bg-black/30 rounded-xl p-2"
            placeholder={
              splitType === "percentage"
                ? `${m} %`
                : `${m} amount`
            }
            onChange={(e) =>
              updateSplit(m, e.target.value)
            }
          />
        ))}

      {splitType === "shares" &&
        members.map((m) => (
          <input
            key={m}
            type="number"
            className="w-full bg-black/30 rounded-xl p-2"
            placeholder={`${m} shares`}
            onChange={(e) =>
              updateShares(m, e.target.value)
            }
          />
        ))}

      {/* PAYMENTS */}

      <div className="pt-4 border-t border-white/20">
        <h4 className="text-sm text-gray-300 mb-2">
          Who paid?
        </h4>

        {members.map((m) => (
          <input
            key={m}
            type="number"
            className="w-full bg-black/30 rounded-xl p-2 mb-2"
            placeholder={`${m} paid`}
            onChange={(e) =>
              updatePayment(m, e.target.value)
            }
          />
        ))}
      </div>

      <button
        className="
          w-full
          py-3
          rounded-xl
          bg-gradient-to-r
          from-emerald-400
          to-cyan-400
          text-black
          font-semibold
          hover:scale-105
          transition
        "
      >
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;