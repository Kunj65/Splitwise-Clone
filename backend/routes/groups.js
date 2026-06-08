import express from "express";
import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const groups = await Group.find({ owner: req.user._id }).lean();
    const groupIds = groups.map((g) => g._id);
    const expenses = await Expense.find({ group: { $in: groupIds } }).lean();
    return res.json({ groups, expenses });
  } catch (error) {
    console.error("Failed to load groups:", error);
    return res.status(500).json({ message: "Failed to load groups" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }
    const group = await Group.create({
      owner: req.user._id,
      name: name.trim(),
      members: Array.isArray(members) ? members : [],
    });
    return res.status(201).json({ group });
  } catch (error) {
    console.error("Failed to create group:", error);
    return res.status(500).json({ message: "Failed to create group" });
  }
});

router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).lean();
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    const expenses = await Expense.find({ group: groupId }).lean();
    return res.json({ group, expenses });
  } catch (error) {
    console.error("Failed to load group:", error);
    return res.status(500).json({ message: "Failed to load group" });
  }
});

router.patch("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const updates = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: groupId, owner: req.user._id },
      updates,
      { new: true }
    );
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.json({ group });
  } catch (error) {
    console.error("Failed to update group:", error);
    return res.status(500).json({ message: "Failed to update group" });
  }
});

router.post("/:groupId/expenses", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, currency, paidBy, splitBetween } = req.body; // ✅ currency extracted
    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      currency: currency || "INR", // ✅ currency saved
      paidBy,
      splitBetween: Array.isArray(splitBetween) ? splitBetween : [],
    });
    return res.status(201).json({ expense });
  } catch (error) {
    console.error("Failed to add expense:", error);
    return res.status(500).json({ message: "Failed to add expense" });
  }
});

export default router; // ✅ this line is critical — was missing