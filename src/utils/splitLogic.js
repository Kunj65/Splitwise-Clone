// members is now an array of objects: { _id, name, email }
// expenses.paidBy is now an object: { _id, name, email }
// expenses.splitBetween is now an array of objects: { _id, name, email }

export const calculateBalancesWithDetails = (expenses = [], members = []) => {
  const balances = {};

  // Initialize balance for each member using their _id as key
  members.forEach((m) => {
    const id = typeof m === "object" ? m._id?.toString() : m;
    balances[id] = { total: 0, breakdown: [], name: typeof m === "object" ? m.name : m };
  });

  expenses.forEach((expense) => {
    const { description, amount } = expense;

    // WHO PAID — paidBy is now a populated object { _id, name, email }
    const payerId = expense.paidBy?._id?.toString() || expense.paidBy?.toString();

    if (payerId && balances[payerId] !== undefined) {
      balances[payerId].total += Number(amount);
      balances[payerId].breakdown.push({
        description,
        amount: Number(amount),
        type: "paid",
      });
    }

    // WHO OWES — splitBetween is now an array of populated objects
    const splitBetween = expense.splitBetween || [];
    if (splitBetween.length > 0) {
      const share = Number(amount) / splitBetween.length;
      splitBetween.forEach((s) => {
        const sid = s?._id?.toString() || s?.toString();
        if (sid && balances[sid] !== undefined) {
          balances[sid].total -= share;
          balances[sid].breakdown.push({
            description,
            amount: -share,
            type: "owed",
          });
        }
      });
    } else {
      // Fallback equal split across all members
      const share = Number(amount) / members.length;
      members.forEach((m) => {
        const id = typeof m === "object" ? m._id?.toString() : m;
        if (balances[id] !== undefined) {
          balances[id].total -= share;
          balances[id].breakdown.push({
            description,
            amount: -share,
            type: "owed",
          });
        }
      });
    }
  });

  return balances;
};