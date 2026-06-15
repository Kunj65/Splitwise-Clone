import { useState, useEffect } from "react";
import { fetchJsonWithAuth } from "../api";
import useAuth from "../auth/useAuth";

const SettleUp = ({ group, expenses }) => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState([]);
  const [settling, setSettling] = useState(null);

  useEffect(() => {
    loadSettlements();
  }, [group.id]);

  const loadSettlements = async () => {
    try {
      const data = await fetchJsonWithAuth(`/api/settlements/${group.id || group._id}`);
      setSettlements(data.settlements || []);
    } catch (err) {
      console.error("Failed to load settlements:", err);
    }
  };

  // Calculate who owes who
  const balances = {};
  const members = group.members || [];

  members.forEach((m) => {
    const id = m._id?.toString() || m;
    balances[id] = { name: m.name || m, amount: 0 };
  });

  expenses.forEach((expense) => {
    const payerId = expense.paidBy?._id?.toString() || expense.paidBy?.toString();
    const split = expense.splitBetween || [];
    const share = Number(expense.amount) / (split.length || members.length);

    if (balances[payerId]) balances[payerId].amount += Number(expense.amount);

    const splitList = split.length > 0 ? split : members;
    splitList.forEach((m) => {
      const id = m._id?.toString() || m.toString();
      if (balances[id]) balances[id].amount -= share;
    });
  });

  // Add settlements
  settlements.forEach((s) => {
    const fromId = s.paidBy?._id?.toString();
    const toId = s.paidTo?._id?.toString();
    if (balances[fromId]) balances[fromId].amount += Number(s.amount);
    if (balances[toId]) balances[toId].amount -= Number(s.amount);
  });

  // Calculate simplified debts
  const debts = [];
  const bals = Object.entries(balances).map(([id, data]) => ({ id, ...data }));
  const creditors = bals.filter((b) => b.amount > 0.01).sort((a, b) => b.amount - a.amount);
  const debtors = bals.filter((b) => b.amount < -0.01).sort((a, b) => a.amount - b.amount);

  let i = 0, j = 0;
  const c = creditors.map((x) => ({ ...x }));
  const d = debtors.map((x) => ({ ...x }));

  while (i < c.length && j < d.length) {
    const amount = Math.min(c[i].amount, -d[j].amount);
    debts.push({ from: d[j], to: c[i], amount: Math.round(amount * 100) / 100 });
    c[i].amount -= amount;
    d[j].amount += amount;
    if (c[i].amount < 0.01) i++;
    if (d[j].amount > -0.01) j++;
  }

  const currentUserId = user?.id || user?._id;

  const handleSettle = async (debt) => {
    setSettling(debt.to.id);
    try {
      const data = await fetchJsonWithAuth(`/api/settlements/${group.id || group._id}`, {
        method: "POST",
        body: { paidToId: debt.to.id, amount: debt.amount },
      });
      setSettlements((prev) => [...prev, data.settlement]);
    } catch (err) {
      alert("Failed to record settlement");
    } finally {
      setSettling(null);
    }
  };

  if (debts.length === 0) {
    return (
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-semibold mb-2">Settle Up</h3>
        <p className="text-emerald-400 text-sm">✅ All settled up! No pending payments.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-xl font-semibold mb-4">Settle Up</h3>
      <div className="space-y-3">
        {debts.map((debt, i) => (
          <div key={i} className="flex items-center justify-between bg-black/30 rounded-xl p-4">
            <div>
              <p className="text-sm">
                <span className="text-red-400 font-medium">{debt.from.name}</span>
                <span className="text-slate-400 mx-2">owes</span>
                <span className="text-emerald-400 font-medium">{debt.to.name}</span>
              </p>
              <p className="text-lg font-bold mt-1">₹{debt.amount.toFixed(2)}</p>
            </div>
            {debt.from.id === currentUserId && (
              <button
                onClick={() => handleSettle(debt)}
                disabled={settling === debt.to.id}
                className="bg-emerald-400 text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-300 transition disabled:opacity-50"
              >
                {settling === debt.to.id ? "Settling..." : "Mark Settled"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettleUp;