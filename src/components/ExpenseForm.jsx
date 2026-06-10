import { useState } from "react";

const ExpenseForm = ({ members, onAddExpense }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState({});
  const [shares, setShares] = useState({});
  const [payments, setPayments] = useState({});

  // Helper — get display name from member (now an object)
  const getName = (m) => (typeof m === "object" ? m.name : m);
  const getId = (m) => (typeof m === "object" ? m._id : m);

  const updateSplit = (id, v) => setSplits((p) => ({ ...p, [id]: Number(v) }));
  const updateShares = (id, v) => setShares((p) => ({ ...p, [id]: Number(v) }));
  const updatePayment = (id, v) => setPayments((p) => ({ ...p, [id]: Number(v) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const total = Number(amount);

    const paidTotal = Object.values(payments).reduce((a, b) => a + b, 0);
    if (paidTotal !== total) {
      alert("Total paid must equal expense amount");
      return;
    }

    let finalSplits = {};

    if (splitType === "equal") {
      const share = total / members.length;
      members.forEach((m) => (finalSplits[getId(m)] = share));
    }

    if (splitType === "exact") {
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      if (sum !== total) {
        alert("Exact amounts must match total");
        return;
      }
      finalSplits = splits;
    }

    if (splitType === "percentage") {
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        alert("Percentages must total 100%");
        return;
      }
      members.forEach((m) => (finalSplits[getId(m)] = (splits[getId(m)] / 100) * total));
    }

    if (splitType === "shares") {
      const totalShares = Object.values(shares).reduce((a, b) => a + b, 0);
      if (!totalShares) {
        alert("Enter shares");
        return;
      }
      const perShare = total / totalShares;
      members.forEach((m) => (finalSplits[getId(m)] = (shares[getId(m)] || 0) * perShare));
    }

    // Who paid — find the member with payment > 0
    const paidById = Object.keys(payments).find((key) => payments[key] > 0) || getId(members[0]);
    const splitBetweenIds = Object.keys(finalSplits);

    try {
      await onAddExpense({
        description,
        amount: total,
        paidById,
        splitBetweenIds,
      });

      setDescription("");
      setAmount("");
      setSplits({});
      setShares({});
      setPayments({});
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4 fade-up">
      <h3 className="text-xl font-semibold">Add Expense</h3>

      <input
        className="w-full bg-black/40 rounded-xl p-3"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="number"
        className="w-full bg-black/40 rounded-xl p-3"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select
        className="w-full bg-black/40 rounded-xl p-3"
        value={splitType}
        onChange={(e) => setSplitType(e.target.value)}
      >
        <option value="equal">Equal</option>
        <option value="exact">Exact</option>
        <option value="percentage">Percentage</option>
        <option value="shares">Shares</option>
      </select>

      {/* SPLITS */}
      {(splitType === "exact" || splitType === "percentage") &&
        members.map((m) => (
          <input
            key={getId(m)}
            placeholder={splitType === "percentage" ? `${getName(m)} %` : `${getName(m)} amount`}
            type="number"
            className="w-full bg-black/30 rounded-xl p-2"
            onChange={(e) => updateSplit(getId(m), e.target.value)}
          />
        ))}

      {splitType === "shares" &&
        members.map((m) => (
          <input
            key={getId(m)}
            placeholder={`${getName(m)} shares`}
            type="number"
            className="w-full bg-black/30 rounded-xl p-2"
            onChange={(e) => updateShares(getId(m), e.target.value)}
          />
        ))}

      {/* PAYERS */}
      <div className="pt-4 border-t border-white/20">
        <h4 className="text-sm text-gray-300 mb-2">Who paid?</h4>
        {members.map((m) => (
          <input
            key={getId(m)}
            placeholder={`${getName(m)} paid`}
            type="number"
            className="w-full bg-black/30 rounded-xl p-2 mb-2"
            onChange={(e) => updatePayment(getId(m), e.target.value)}
          />
        ))}
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:scale-105 transition">
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;