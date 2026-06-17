import { calculateBalancesWithDetails } from "../utils/splitLogic";
import ExpenseComments from "./ExpenseComments";

const BalanceList = ({ expenses, members }) => {
  const balances = calculateBalancesWithDetails(expenses, members);

  return (
    <div className="space-y-6">

      {/* BALANCES */}
      <div
        className="
          glass
          rounded-[32px]
          p-6
          border
          border-white/10
        "
      >
        <div className="mb-5">
          <h3 className="text-2xl font-bold">
            Balances
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Current balances for all group members
          </p>
        </div>

        {Object.entries(balances).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">
              No balance data available
            </p>
          </div>
        ) : (
          Object.entries(balances).map(([person, data]) => (
            <div
              key={data.id || person}
              className="
                flex
                items-center
                justify-between
                p-4
                mb-3
                rounded-2xl
                bg-white/[0.03]
                border
                border-white/5
                hover:border-cyan-400/20
                transition-all
              "
            >
              <div className="flex items-center gap-3">

                <div
                  className="
                    h-10
                    w-10
                    rounded-full
                    bg-gradient-to-r
                    from-cyan-400
                    to-emerald-400
                    text-black
                    font-bold
                    flex
                    items-center
                    justify-center
                  "
                >
                  {(data.name || person)?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <p className="font-medium">
                    {data.name || person}
                  </p>

                  <p className="text-xs text-slate-500">
                    Member
                  </p>
                </div>

              </div>

              <p
                className={`text-lg font-bold ${
                  data.total >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {data.total >= 0 ? "+" : "-"}₹
                {Math.abs(data.total).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* EXPENSES */}
      <div
        className="
          glass
          rounded-[32px]
          p-6
          border
          border-white/10
        "
      >
        <div className="mb-5">
          <h3 className="text-2xl font-bold">
            Recent Expenses
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Expense history for this group
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center">

            <p className="text-slate-400 text-lg">
              No expenses yet
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Add your first expense to start tracking balances
            </p>

          </div>
        ) : (
          expenses.map((expense, index) => (
            <div
              key={
                expense._id ||
                expense.id ||
                `${expense.description}-${expense.amount}-${index}`
              }
              className="
                rounded-3xl
                bg-white/[0.03]
                border
                border-white/5
                p-5
                mb-4
                hover:border-cyan-400/20
                transition-all
              "
            >
              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="font-semibold text-lg">
                    {expense.description}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Paid by{" "}
                    {expense.paidBy?.name ||
                      expense.paidBy ||
                      "Unknown"}
                  </p>

                </div>

                <p className="text-2xl font-bold text-emerald-400 whitespace-nowrap">
                  ₹{Number(expense.amount).toFixed(2)}
                </p>

              </div>

              <div className="mt-4">
                <ExpenseComments expenseId={expense._id} />
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default BalanceList;