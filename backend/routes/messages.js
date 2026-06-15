import express from "express";
import Message from "../models/Message.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/:groupId", async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 })
      .lean();
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load messages" });
  }
});

router.post("/:groupId", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Message is required" });

    const message = await Message.create({
      group: req.params.groupId,
      sender: req.user._id,
      text: text.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name email")
      .lean();

    // Emit to all group members via socket
    const io = req.app.get("io");
    io?.to(req.params.groupId).emit("message:new", populated);

    return res.status(201).json({ message: populated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;