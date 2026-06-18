import AnimatedPage from "../components/AnimatedPage";
import { useNavigate } from "react-router-dom";
import useGroups from "../context/useGroups";
import useAuth from "../auth/useAuth";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CATEGORY_COLORS = {
  food: "#10b981",
  travel: "#3b82f6",
  rent: "#f59e0b",
  utilities: "#8b5cf6",
  entertainment: "#ec4899",
  shopping: "#f97316",
  health: "#14b8a6",
  other: "#6b7280",
};

const CATEGORY_LABELS = {
  food: "🍔 Food",
  travel: "✈️ Travel",
  rent: "🏠 Rent",
  utilities: "💡 Utilities",
  entertainment: "🎬 Entertainment",
  shopping: "🛍️ Shopping",
  health: "💊 Health",
  other: "📦 Other",
};

const Summary = () => {
  const { user } = useAuth();
  const data = useGroups();
  const navigate = useNavigate();

  const groups = data?.groups ?? [];
  const expensesByGroup = data?.expensesByGroup ?? {};

  const currentUserId =
    (user?.id || user?._id)?.toString();

  let totalYouOwe = 0;
  let totalYouGet = 0;

  const categoryTotals = {};
  const monthlyTotals = {};

  const allExpenses = Object.values(
    expensesByGroup
  )
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    const recentExpenses = allExpenses.slice(0, 5);

  const totalSpent = allExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const averageExpense =
    allExpenses.length > 0
      ? totalSpent / allExpenses.length
      : 0;

  allExpenses.forEach((expense) => {
    const amount = Number(expense.amount);

    const category =
      expense.category || "other";

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      amount;

    const month = new Date(
      expense.createdAt
    ).toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });

    monthlyTotals[month] =
      (monthlyTotals[month] || 0) +
      amount;
  });

  groups.forEach((group) => {
    const expenses =
      expensesByGroup[group.id] ||
      expensesByGroup[group._id] ||
      [];

    const members = group.members || [];

    expenses.forEach((expense) => {
      const payerId =
        (
          expense.paidBy?._id ||
          expense.paidBy
        )?.toString();

      const split =
        expense.splitBetween || [];

      const splitList =
        split.length > 0
          ? split
          : members;

      const share =
        Number(expense.amount) /
        splitList.length;

      if (payerId === currentUserId) {
        totalYouGet +=
          Number(expense.amount) - share;
      } else {
        const iInSplit =
          splitList.some(
            (m) =>
              (m._id || m)?.toString() ===
              currentUserId
          );

        if (iInSplit) {
          totalYouOwe += share;
        }
      }
    });
  });

  const net =
    totalYouGet - totalYouOwe;

  const pieData = Object.entries(
    categoryTotals
  ).map(([key, value]) => ({
    name:
      CATEGORY_LABELS[key] || key,
    value: Math.round(value),
    color:
      CATEGORY_COLORS[key] ||
      "#6b7280",
  }));

  const barData = Object.entries(
    monthlyTotals
  )
    .slice(-6)
    .map(([month, total]) => ({
      month,
      total: Math.round(total),
    }));

  return (
    <AnimatedPage>
      <div className="min-h-screen text-white">

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">

          {/* Header */}

          <div>
            <h1 className="text-4xl font-bold">
              Financial Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Overview of balances,
              expenses and spending
              trends
            </p>
          </div>

          {/* Main Stats */}

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">

            <div className="glass rounded-[28px] p-5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Total Spending
              </p>

              <h3 className="text-2xl font-bold mt-2">
                ₹{totalSpent.toFixed(2)}
              </h3>
            </div>

            <div className="glass rounded-[28px] p-5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Average Expense
              </p>

              <h3 className="text-2xl font-bold mt-2">
                ₹{averageExpense.toFixed(2)}
              </h3>
            </div>

            <div className="glass rounded-[32px] p-6 border border-white/10">
              <div className="flex justify-between items-center">

                <div>
                  <p className="text-slate-400 text-sm">
                    You Owe
                  </p>

                  <h3 className="text-3xl font-bold text-red-400 mt-2">
                    ₹
                    {totalYouOwe.toFixed(
                      2
                    )}
                  </h3>
                </div>
              </div>
            </div>

            <div className="glass rounded-[32px] p-6 border border-white/10">
              <div className="flex justify-between items-center">

                <div>
                  <p className="text-slate-400 text-sm">
                    You Get
                  </p>

                  <h3 className="text-3xl font-bold text-emerald-400 mt-2">
                    ₹
                    {totalYouGet.toFixed(
                      2
                    )}
                  </h3>
                </div>
              </div>
            </div>

            <div className="glass rounded-[32px] p-6 border border-white/10">
              <div className="flex justify-between items-center">

                <div>
                  <p className="text-slate-400 text-sm">
                    Net Balance
                  </p>

                  <h3
                    className={`text-3xl font-bold mt-2 ${net >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                      }`}
                  >
                    ₹
                    {net.toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>

          </div>

          {/* Extra Stats */}

          <div className="grid md:grid-cols-3 gap-4">

            <div className="glass rounded-[28px] p-5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Total Groups
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {groups.length}
              </h3>
            </div>

            <div className="glass rounded-[28px] p-5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Total Expenses
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {allExpenses.length}
              </h3>
            </div>

            <div className="glass rounded-[28px] p-5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Categories Used
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {pieData.length}
              </h3>
            </div>

          </div>

          {/* Charts */}

          <div className="grid xl:grid-cols-2 gap-6">

            {pieData.length > 0 && (
              <div className="glass rounded-[32px] p-6 border border-white/10">

                <h2 className="text-xl font-bold mb-5">
                  Spending by Category
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={90}
                      cx="50%"
                      cy="50%"
                    >
                      {pieData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={index}
                            fill={
                              entry.color
                            }
                          />
                        )
                      )}
                    </Pie>
                    <Legend />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        `₹${value}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

              </div>
            )}

            {barData.length > 0 && (
              <div className="glass rounded-[32px] p-6 border border-white/10">

                <h2 className="text-xl font-bold mb-5">
                  Monthly Spending
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) => [
                          `₹${value}`,
                          "Total",
                        ]}
                      contentStyle={{
                        background:
                          "#0f172a",
                        border:
                          "1px solid #334155",
                        borderRadius:
                          "12px",
                      }}
                    />

                    <Bar
                      dataKey="total"
                      fill="#10b981"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            )}

          </div>
          <div className="glass rounded-[32px] p-6 border border-white/10">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Recent Expenses
                </h2>

                <p className="text-slate-400 text-sm">
                  Latest 5 expenses
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/activity?tab=expenses")
                }
                className="
        px-4
        py-2
        rounded-xl
        bg-cyan-500/10
        border
        border-cyan-500/20
        text-cyan-400
        hover:bg-cyan-500/20
        transition
      "
              >
                See More →
              </button>

            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-slate-400">
                No expenses found
              </p>
            ) : (
              <div className="space-y-2">

                {recentExpenses.map(
                  (expense) => (
                    <div
                      key={expense._id}
                      className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-white/10
              bg-white/[0.02]
              px-4
              py-2.5
            "
                    >
                      <div>
                        <p className="font-medium">
                          {expense.description}
                        </p>

                        <span
                          className="
    inline-block
    mt-1
    px-2
    py-1
    rounded-full
    text-[11px]
    bg-cyan-500/10
    text-cyan-400
  "
                        >
                          {expense.category || "Other"}
                        </span>
                      </div>

                      <div
                        className="
                text-emerald-400
                font-semibold
              "
                      >
                        ₹{expense.amount}
                      </div>
                    </div>
                  )
                )}

              </div>
            )}
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
};

export default Summary;