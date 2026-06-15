import express from "express";
import Settlement from "../models/Settlement.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/:groupId", async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate("paidBy", "name email")
      .populate("paidTo", "name email")
      .lean();
    return res.json({ settlements });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load settlements" });
  }
});

router.post("/:groupId", async (req, res) => {
  try {
    const { paidToId, amount } = req.body;
    const settlement = await Settlement.create({
      group: req.params.groupId,
      paidBy: req.user._id,
      paidTo: paidToId,
      amount,
    });
    const populated = await Settlement.findById(settlement._id)
      .populate("paidBy", "name email")
      .populate("paidTo", "name email")
      .lean();
    return res.status(201).json({ settlement: populated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to record settlement" });
  }
});

export default router;