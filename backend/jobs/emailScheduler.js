import cron from "node-cron";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import { sendMail } from "../utils/mailer.js";
import { currencySymbols } from "../utils/currencySymbols.js";

// Helper: group expenses by currency and sum amounts
const summarizeExpenses = (expenses) => {
  const map = {};
  expenses.forEach((e) => {
    const c = e.currency || "INR";
    map[c] = (map[c] || 0) + e.amount;
  });
  return map;
};

// ── Runs at 8:00 AM on the 1st of every month ──
cron.schedule("0 8 1 * *", async () => {
  console.log("[Scheduler] Running monthly email job...");

  try {
    const users = await User.find({});
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const monthName = lastMonth.toLocaleString("default", { month: "long", year: "numeric" });

    for (const user of users) {
      // Get all groups this user is in
      const groups = await Group.find({ owner: user._id });

      // Get expenses from last month
      const groupIds = groups.map((g) => g._id);
      const expenses = await Expense.find({
        group: { $in: groupIds },
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd },
      });

      if (expenses.length === 0) continue;

      const totals = summarizeExpenses(expenses);
      const sym = (c) => currencySymbols[c] || c + " ";

      const summaryRows = Object.entries(totals)
        .map(([c, amt]) => `<tr><td style="padding:8px 16px">${c}</td><td style="padding:8px 16px;font-weight:bold;color:#34d399">${sym(c)}${amt.toFixed(2)}</td></tr>`)
        .join("");

      // Calculate balances per group
      let balanceHTML = "";
      let hasUnsettled = false;

      for (const group of groups) {
        const groupExpenses = expenses.filter(
          (e) => e.group.toString() === group._id.toString()
        );
        if (groupExpenses.length === 0) continue;

        const memberBalances = {};
        groupExpenses.forEach((exp) => {
          const share = exp.amount / (exp.splitBetween.length || 1);
          exp.splitBetween.forEach((member) => {
            memberBalances[member] = (memberBalances[member] || 0) - share;
          });
          memberBalances[exp.paidBy] = (memberBalances[exp.paidBy] || 0) + exp.amount;
        });

        const unsettled = Object.entries(memberBalances).filter(([, v]) => Math.abs(v) > 0.01);
        if (unsettled.length > 0) {
          hasUnsettled = true;
          balanceHTML += `<p style="margin-top:16px;font-weight:bold;color:#94a3b8">${group.name}</p><ul>`;
          unsettled.forEach(([member, bal]) => {
            balanceHTML += `<li style="color:${bal < 0 ? "#f87171" : "#34d399"}">${member}: ${bal < 0 ? "owes" : "gets"} ${Math.abs(bal).toFixed(2)}</li>`;
          });
          balanceHTML += "</ul>";
        }
      }

      await sendMail({
        to: user.email,
        subject: `Your ${monthName} Expense Summary — Splitwise Clone`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#0f172a;color:#fff;border-radius:16px">
            <h2 style="color:#34d399">📊 ${monthName} Summary</h2>
            <p>Hi ${user.name}, here's your expense summary for last month:</p>

            <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#1e293b;border-radius:8px">
              <thead>
                <tr style="color:#94a3b8;border-bottom:1px solid #334155">
                  <th style="padding:8px 16px;text-align:left">Currency</th>
                  <th style="padding:8px 16px;text-align:left">Total Spent</th>
                </tr>
              </thead>
              <tbody>${summaryRows}</tbody>
            </table>

            ${hasUnsettled ? `
              <h3 style="color:#fbbf24;margin-top:24px">⚠️ Unsettled Balances</h3>
              <p style="color:#94a3b8">Please settle up with your group members:</p>
              ${balanceHTML}
            ` : `<p style="color:#34d399;margin-top:16px">✅ All balances are settled!</p>`}

            <p style="color:#64748b;margin-top:32px;font-size:12px">This is an automated email from Splitwise Clone.</p>
          </div>
        `,
      });

      console.log(`[Scheduler] Sent monthly summary to ${user.email}`);
    }
  } catch (err) {
    console.error("[Scheduler] Error in monthly email job:", err);
  }
});

console.log("[Scheduler] Monthly email job scheduled.");