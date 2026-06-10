import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Search users by email or name — used when adding members to a group
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Query too short" });
    }

    const users = await User.find({
      _id: { $ne: req.user._id }, // exclude self
      $or: [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ],
    })
      .select("_id name email")
      .limit(8)
      .lean();

    return res.json({ users });
  } catch (error) {
    console.error("User search failed:", error);
    return res.status(500).json({ message: "Search failed" });
  }
});

export default router;