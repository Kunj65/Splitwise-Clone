import { useState, useEffect } from "react";
import { fetchJsonWithAuth } from "../api";

const RecurringExpenses = ({ groupId }) => {
  const [recurring, setRecurring] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "", frequency: "monthly" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadRecurring();
  }, [groupId]);

  const loadRecurring = async () => {
    try {
      const data = await fetchJsonWithAuth(`/api/recurring/${groupId}`);
      setRecurring(data.recurring || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const data = await fetchJsonWithAuth(`/api/recurring/${groupId}`, {
        method: "POST",
        body: form,
      });
      setRecurring((prev) => [...prev, data.recurring]);
      setForm({ description: "", amount: "", frequency: "monthly" });
    } catch (err) {
      alert("Failed to add recurring expense");
    } finally {
      setAdding(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await fetchJsonWithAuth(`/api/recurring/${id}`, { method: "DELETE" });
      setRecurring((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert("Failed to cancel");
    }
  };

  return (
    <div className="space-y-4">

      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-semibold mb-4">Add Recurring Expense</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            className="w-full bg-black/40 rounded-xl p-3 text-sm outline-none border border-white/10 focus:border-emerald-400"
            placeholder="Description (e.g. Monthly Rent)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full bg-black/40 rounded-xl p-3 text-sm outline-none border border-white/10 focus:border-emerald-400"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            className="w-full bg-black/40 rounded-xl p-3 text-sm outline-none border border-white/10"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-emerald-400 text-black py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add Recurring Expense"}
          </button>
        </form>
      </div>

      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-semibold mb-4">Active Recurring Expenses</h3>
        {recurring.length === 0 && (
          <p className="text-slate-400 text-sm">No recurring expenses set up.</p>
        )}
        {recurring.map((r) => (
          <div key={r._id} className="bg-black/30 rounded-xl p-4 mb-3 flex justify-between items-center">
            <div>
              <p className="font-medium">{r.description}</p>
              <p className="text-sm text-slate-400">
                ₹{r.amount} · {r.frequency} · Next: {new Date(r.nextRun).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleCancel(r._id)}
              className="text-red-400 text-sm hover:text-red-300"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RecurringExpenses;