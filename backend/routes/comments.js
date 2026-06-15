import express from "express";
import Comment from "../models/Comment.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/:expenseId", async (req, res) => {
  try {
    const comments = await Comment.find({ expense: req.params.expenseId })
      .populate("author", "name")
      .sort({ createdAt: 1 })
      .lean();
    return res.json({ comments });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load comments" });
  }
});

router.post("/:expenseId", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment is required" });

    const comment = await Comment.create({
      expense: req.params.expenseId,
      author: req.user._id,
      text: text.trim(),
    });

    const populated = await Comment.findById(comment._id)
      .populate("author", "name")
      .lean();

    return res.status(201).json({ comment: populated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to add comment" });
  }
});

export default router;