import cron from "node-cron";
import RecurringExpense from "./models/RecurringExpense.js";
import Expense from "./models/Expense.js";
import Group from "./models/Group.js";

export const startCronJobs = () => {

  // Run every hour to check for due recurring expenses
  cron.schedule("0 * * * *", async () => {
    console.log("Checking recurring expenses...");
    try {
      const due = await RecurringExpense.find({
        active: true,
        nextRun: { $lte: new Date() },
      }).populate("group");

      for (const recurring of due) {
        // Create the expense
        await Expense.create({
          group: recurring.group._id,
          description: `${recurring.description} (recurring)`,
          amount: recurring.amount,
          paidBy: recurring.createdBy,
          splitBetween: recurring.group.members,
        });

        // Set next run date
        const next = new Date(recurring.nextRun);
        if (recurring.frequency === "daily") next.setDate(next.getDate() + 1);
        if (recurring.frequency === "weekly") next.setDate(next.getDate() + 7);
        if (recurring.frequency === "monthly") next.setMonth(next.getMonth() + 1);

        await RecurringExpense.findByIdAndUpdate(recurring._id, { nextRun: next });

        console.log(`Recurring expense created: ${recurring.description}`);
      }
    } catch (err) {
      console.error("Cron error:", err);
    }
  });

};