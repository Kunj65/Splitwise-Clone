export const simplifyDebts = (balances) => {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([person, data]) => {
    const amount = data.total;

    if (amount < 0) {
      debtors.push({ person, amount: -amount });
    } else if (amount > 0) {
      creditors.push({ person, amount });
    }
  });

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payAmount = Math.min(
      debtors[i].amount,
      creditors[j].amount
    );

    settlements.push({
      from: debtors[i].person,
      to: creditors[j].person,
      amount: payAmount,
    });

    debtors[i].amount -= payAmount;
    creditors[j].amount -= payAmount;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return settlements;
};
