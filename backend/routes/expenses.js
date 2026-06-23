import express from "express";
import Expense from "../models/Expense.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ GET all expenses for a group
router.get("/:groupId/expenses", async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ ADD expense with category
router.post("/:groupId/expenses", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidById, splitBetweenIds, category, receiptUrl } = req.body;

    // Validate
    if (!amount || !paidById || !splitBetweenIds) {
      return res.status(400).json({ 
        error: "Missing required fields"
      });
    }

    // Create expense with category
    const expense = new Expense({
      group: groupId,
      description: description || "",
      amount: Number(amount),
      paidBy: paidById,
      splitBetween: splitBetweenIds,
      category: category || "other",
      receiptUrl: receiptUrl || null,
    });

    await expense.save();

    // Populate
    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email");

    // Create activity with category
    try {
      const payer = await User.findById(paidById);
      
      const activity = new Activity({
        group: groupId,
        user: paidById,
        type: "expense_added",
        message: `${payer?.name || "Someone"} added an expense: ${description || "Untitled"}`,
        amount: Number(amount),
        currency: "INR",
        category: category || "other",
        createdAt: new Date(),
      });
      await activity.save();
    } catch (activityError) {
      console.error("Error creating activity:", activityError.message);
    }

    res.status(201).json({ 
      success: true,
      expense: populatedExpense 
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE expense
router.delete("/:groupId/expenses/:expenseId", async (req, res) => {
  try {
    const { expenseId } = req.params;
    
    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router; // ✅ This should be on its own line