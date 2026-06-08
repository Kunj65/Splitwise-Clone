export const calculateBalancesWithDetails = (
  expenses = [],
  members = []
) => {
  const balances = {};

  // initialize structure
  members.forEach((m) => {
    balances[m] = {
      total: 0,
      breakdown: [],
    };
  });

  expenses.forEach((expense) => {
    const { description, amount } = expense;

    /* ---------- CREDIT (WHO PAID) ---------- */

    // Multi-payer
    if (expense.paidBy && typeof expense.paidBy === "object") {
      Object.entries(expense.paidBy).forEach(([payer, value]) => {
        balances[payer].total += value;
        balances[payer].breakdown.push({
          description,
          amount: +value,
          type: "paid",
        });
      });
    }

    // Single payer (old data)
    else if (typeof expense.paidBy === "string") {
      balances[expense.paidBy].total += amount;
      balances[expense.paidBy].breakdown.push({
        description,
        amount,
        type: "paid",
      });
    }

    /* ---------- DEBIT (WHO OWES) ---------- */

    if (expense.splits && typeof expense.splits === "object") {
      Object.entries(expense.splits).forEach(([member, value]) => {
        balances[member].total -= value;
        balances[member].breakdown.push({
          description,
          amount: -value,
          type: "owed",
        });
      });
    }

    // Fallback: equal split
    else {
      const equal = amount / members.length;
      members.forEach((m) => {
        balances[m].total -= equal;
        balances[m].breakdown.push({
          description,
          amount: -equal,
          type: "owed",
        });
      });
    }
  });

  return balances;
};
