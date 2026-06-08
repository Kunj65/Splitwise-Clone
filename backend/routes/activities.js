import express from "express";
import Activity from "../models/Activity.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ activities });
  } catch (error) {
    console.error("Failed to load activities:", error);
    return res.status(500).json({ message: "Failed to load activities" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, message, amount, currency } = req.body; // ✅ FIX: read amount & currency
    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }
    const activity = await Activity.create({
      user: req.user._id,
      type,
      message,
      amount: amount ?? null,     // ✅ FIX: save amount
      currency: currency ?? null, // ✅ FIX: save currency
    });
    return res.status(201).json({ activity });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return res.status(500).json({ message: "Failed to create activity" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Activity.deleteMany({ user: req.user._id });
    return res.json({ message: "Activities cleared" });
  } catch (error) {
    console.error("Failed to clear activities:", error);
    return res.status(500).json({ message: "Failed to clear activities" });
  }
});

export default router;