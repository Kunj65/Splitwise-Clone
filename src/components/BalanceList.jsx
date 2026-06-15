import { calculateBalancesWithDetails } from "../utils/splitLogic";
import ExpenseComments from "./ExpenseComments";

const BalanceList = ({ expenses, members }) => {
  const balances = calculateBalancesWithDetails(expenses, members);

  return (
    <div className="space-y-4">

      {/* BALANCES */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-semibold mb-4">Balances</h3>
        {Object.entries(balances).map(([person, data]) => (
          <div key={person} className="bg-black/30 rounded-xl p-4 mb-3 flex justify-between">
            <span>{data.name || person}</span>
            <span className={data.total >= 0 ? "text-green-400" : "text-red-400"}>
              ₹{Math.abs(data.total).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* EXPENSES LIST */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-semibold mb-4">Expenses</h3>
        {expenses.length === 0 && (
          <p className="text-slate-400 text-sm">No expenses yet.</p>
        )}
        {expenses.map((expense) => (
          <div key={expense._id} className="bg-black/30 rounded-xl p-4 mb-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-xs text-slate-400">
                  Paid by {expense.paidBy?.name || expense.paidBy}
                </p>
              </div>
              <p className="text-emerald-400 font-bold">₹{Number(expense.amount).toFixed(2)}</p>
            </div>
            <ExpenseComments expenseId={expense._id} />
          </div>
        ))}
      </div>

    </div>
  );
};

export default BalanceList;