export const exportExpensesToCSV = (expenses, groupName) => {
  if (!expenses || expenses.length === 0) {
    alert("No expenses to export");
    return;
  }

  const headers = [
    "Description",
    "Amount",
    "Paid By",
    "Date",
  ];

  const rows = expenses.map((e) => [
    e.description,
    e.amount,
    Object.keys(e.paidBy || {}).join(", "),
    e.createdAt || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${groupName}-expenses.csv`;
  link.click();

  URL.revokeObjectURL(url);
};
