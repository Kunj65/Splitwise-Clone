import { useState, useEffect } from "react";
import { fetchJsonWithAuth } from "../api";
import useAuth from "../auth/useAuth";

const SettleUp = ({ group, expenses }) => {
  const { user } = useAuth();

  const [settlements, setSettlements] = useState([]);
  const [settling, setSettling] = useState(null);

  const currentUserId = (
    user?.id || user?._id
  )?.toString();

  useEffect(() => {
    loadSettlements();
  }, [group.id]);

  const loadSettlements = async () => {
    try {
      const data = await fetchJsonWithAuth(
        `/api/settlements/${group.id || group._id}`
      );

      setSettlements(
        data.settlements || []
      );
    } catch {
      console.error(
        "Failed to load settlements"
      );
    }
  };

  const members =
    group.members || [];

  const balances = {};

  members.forEach((m) => {
    const id = (
      m._id || m
    )?.toString();

    const name =
      typeof m === "object"
        ? id === currentUserId
          ? `${m.name} (You)`
          : m.name
        : m;

    balances[id] = {
      name,
      amount: 0,
      id,
    };
  });

  expenses.forEach((expense) => {
    const payerId = (
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

    if (balances[payerId]) {
      balances[payerId].amount +=
        Number(expense.amount);
    }

    splitList.forEach((m) => {
      const id = (
        m?._id || m
      )?.toString();

      if (balances[id]) {
        balances[id].amount -= share;
      }
    });
  });

  settlements.forEach((s) => {
    const fromId = (
      s.paidBy?._id ||
      s.paidBy
    )?.toString();

    const toId = (
      s.paidTo?._id ||
      s.paidTo
    )?.toString();

    if (balances[fromId]) {
      balances[fromId].amount +=
        Number(s.amount);
    }

    if (balances[toId]) {
      balances[toId].amount -=
        Number(s.amount);
    }
  });

  const bals =
    Object.values(balances);

  const creditors = bals
    .filter((b) => b.amount > 0.01)
    .sort(
      (a, b) =>
        b.amount - a.amount
    )
    .map((x) => ({ ...x }));

  const debtors = bals
    .filter((b) => b.amount < -0.01)
    .sort(
      (a, b) =>
        a.amount - b.amount
    )
    .map((x) => ({ ...x }));

  const debts = [];

  let i = 0;
  let j = 0;

  while (
    i < creditors.length &&
    j < debtors.length
  ) {
    if (
      creditors[i].id !==
      debtors[j].id
    ) {
      const amount = Math.min(
        creditors[i].amount,
        -debtors[j].amount
      );

      debts.push({
        from: debtors[j],
        to: creditors[i],
        amount:
          Math.round(
            amount * 100
          ) / 100,
      });

      creditors[i].amount -=
        amount;

      debtors[j].amount +=
        amount;
    }

    if (
      creditors[i].amount <
      0.01
    )
      i++;

    if (
      debtors[j].amount >
      -0.01
    )
      j++;
  }

  const handleSettle = async (
    debt
  ) => {
    setSettling(debt.to.id);

    try {
      const data =
        await fetchJsonWithAuth(
          `/api/settlements/${group.id || group._id}`,
          {
            method: "POST",
            body: {
              paidToId:
                debt.to.id,
              amount:
                debt.amount,
            },
          }
        );

      setSettlements((prev) => [
        ...prev,
        data.settlement,
      ]);
    } catch {
      alert(
        "Failed to record settlement"
      );
    } finally {
      setSettling(null);
    }
  };

  if (debts.length === 0) {
    return (
      <div
        className="
          glass
          rounded-[32px]
          p-8
          border
          border-white/10
          text-center
        "
      >
        <div
          className="
            h-20
            w-20
            mx-auto
            rounded-full
            bg-emerald-400/10
            flex
            items-center
            justify-center
            text-4xl
          "
        >
          ✅
        </div>

        <h3 className="text-2xl font-bold mt-5">
          All Settled Up
        </h3>

        <p className="text-slate-400 mt-2">
          There are no pending
          payments in this group.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        glass
        rounded-[32px]
        p-8
        border
        border-white/10
      "
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold">
          Settlement Suggestions
        </h3>

        <p className="text-slate-400 text-sm mt-1">
          Simplified payment
          recommendations
        </p>
      </div>

      <div className="space-y-4">
        {debts.map(
          (debt, idx) => {
            const isMe =
              debt.from.id ===
              currentUserId;

            return (
              <div
                key={idx}
                className="
                  rounded-3xl
                  bg-white/[0.03]
                  border
                  border-white/5
                  p-5
                  hover:border-cyan-400/20
                  transition-all
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-5
                  "
                >
                  <div className="flex items-center gap-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          h-12
                          w-12
                          rounded-full
                          bg-red-400/20
                          text-red-400
                          flex
                          items-center
                          justify-center
                          font-bold
                        "
                      >
                        {debt.from.name?.charAt(
                          0
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Pays
                        </p>

                        <p className="font-medium">
                          {debt.from.name}
                        </p>
                      </div>

                    </div>

                    <div className="text-slate-500 text-xl">
                      →
                    </div>

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          h-12
                          w-12
                          rounded-full
                          bg-emerald-400/20
                          text-emerald-400
                          flex
                          items-center
                          justify-center
                          font-bold
                        "
                      >
                        {debt.to.name?.charAt(
                          0
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Receives
                        </p>

                        <p className="font-medium">
                          {debt.to.name}
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Amount
                      </p>

                      <p className="text-2xl font-bold text-emerald-400">
                        ₹
                        {debt.amount.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    {isMe && (
                      <button
                        onClick={() =>
                          handleSettle(
                            debt
                          )
                        }
                        disabled={
                          !!settling
                        }
                        className="
                          px-5
                          py-3
                          rounded-2xl
                          bg-gradient-to-r
                          from-cyan-400
                          to-emerald-400
                          text-black
                          font-semibold
                          transition-all
                          hover:scale-[1.02]
                          disabled:opacity-50
                        "
                      >
                        {settling
                          ? "Settling..."
                          : "Mark Settled"}
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default SettleUp;