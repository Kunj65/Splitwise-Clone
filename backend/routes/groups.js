import express from "express";
import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  sendExpenseNotification,
  sendGroupInviteNotification,
} from "../utils/mailer.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    }).lean();

    const validGroups = groups.filter((group) =>
      group.members.every((m) => m.toString().length === 24)
    );

    const validGroupIds = validGroups.map((g) => g._id);

    const populatedGroups = await Group.find({ _id: { $in: validGroupIds } })
      .populate("members", "name email")
      .populate("owner", "name email")
      .lean();

    const expenses = await Expense.find({ group: { $in: validGroupIds } })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email")
      .lean();

    return res.json({ groups: populatedGroups, expenses });
  } catch (error) {
    console.error("Failed to load groups:", error);
    return res.status(500).json({ message: "Failed to load groups" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const allMemberIds = [
      req.user._id.toString(),
      ...(Array.isArray(memberIds) ? memberIds : []),
    ].filter((id, index, self) => self.indexOf(id) === index);

    const group = await Group.create({
      owner: req.user._id,
      name: name.trim(),
      members: allMemberIds,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("members", "name email")
      .populate("owner", "name email")
      .lean();

    const otherMembers = populatedGroup.members.filter(
      (m) => m._id.toString() !== req.user._id.toString()
    );

    for (const member of otherMembers) {
      sendGroupInviteNotification({
        toEmail: member.email,
        toName: member.name,
        groupName: name.trim(),
        invitedByName: req.user.name,
      });
    }

    const io = req.app.get("io");
    for (const member of otherMembers) {
      io?.to(member._id.toString()).emit("group:added", populatedGroup);
    }

    return res.status(201).json({ group: populatedGroup });
  } catch (error) {
    console.error("Failed to create group:", error);
    return res.status(500).json({ message: "Failed to create group" });
  }
});

router.get("/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "name email")
      .populate("owner", "name email")
      .lean();

    if (!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email")
      .lean();

    return res.json({ group, expenses });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load group" });
  }
});

router.patch("/:groupId", async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.groupId, owner: req.user._id },
      req.body,
      { new: true }
    ).populate("members", "name email");

    if (!group) return res.status(404).json({ message: "Group not found" });
    return res.json({ group });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update group" });
  }
});

router.post("/:groupId/expenses", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidById, splitBetweenIds } = req.body;

    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      paidBy: paidById || req.user._id,
      splitBetween: Array.isArray(splitBetweenIds) ? splitBetweenIds : [],
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email")
      .lean();

    const group = await Group.findById(groupId)
      .populate("members", "name email")
      .lean();

    const otherMembers = (group?.members || []).filter(
      (m) => m._id.toString() !== req.user._id.toString()
    );

    for (const member of otherMembers) {
      sendExpenseNotification({
        toEmail: member.email,
        toName: member.name,
        groupName: group.name,
        description,
        amount,
        paidByName: req.user.name,
      });
    }

    const io = req.app.get("io");
    for (const member of otherMembers) {
      io?.to(member._id.toString()).emit("expense:added", {
        groupId,
        expense: populatedExpense,
      });
    }

    return res.status(201).json({ expense: populatedExpense });
  } catch (error) {
    console.error("Failed to add expense:", error);
    return res.status(500).json({ message: "Failed to add expense" });
  }
});

export default router;