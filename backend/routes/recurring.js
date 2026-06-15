import express from "express";
import RecurringExpense from "../models/RecurringExpense.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/:groupId", async (req, res) => {
  try {
    const recurring = await RecurringExpense.find({
      group: req.params.groupId,
      active: true,
    }).lean();
    return res.json({ recurring });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load recurring expenses" });
  }
});

router.post("/:groupId", async (req, res) => {
  try {
    const { description, amount, frequency } = req.body;

    const nextRun = new Date();
    if (frequency === "daily") nextRun.setDate(nextRun.getDate() + 1);
    else if (frequency === "weekly") nextRun.setDate(nextRun.getDate() + 7);
    else nextRun.setMonth(nextRun.getMonth() + 1);

    const recurring = await RecurringExpense.create({
      group: req.params.groupId,
      createdBy: req.user._id,
      description,
      amount,
      frequency: frequency || "monthly",
      nextRun,
    });

    return res.status(201).json({ recurring });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create recurring expense" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await RecurringExpense.findByIdAndUpdate(req.params.id, { active: false });
    return res.json({ message: "Recurring expense cancelled" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to cancel" });
  }
});

export default router;