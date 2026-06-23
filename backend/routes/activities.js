import express from "express";
import Activity from "../models/Activity.js";

const router = express.Router();

// ✅ Get all activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("user", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get activities for a specific group
router.get("/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const activities = await Activity.find({ group: groupId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error("Error fetching group activities:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get activities by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const activities = await Activity.find({ 
      category: category.toLowerCase() 
    })
      .populate("user", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities by category:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get activity counts by category
router.get("/counts", async (req, res) => {
  try {
    const counts = await Activity.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const result = {
      total: await Activity.countDocuments(),
      categories: counts.reduce((acc, item) => {
        acc[item._id || "other"] = item.count;
        return acc;
      }, {})
    };
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching category counts:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST - Add a new activity (if needed)
router.post("/", async (req, res) => {
  try {
    const { group, user, type, message, amount, currency, category } = req.body;
    
    const activity = new Activity({
      group,
      user,
      type,
      message,
      amount: amount || 0,
      currency: currency || "INR",
      category: category || "other",
    });
    
    await activity.save();
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate("user", "name email")
      .populate("group", "name");
    
    res.status(201).json({ 
      success: true, 
      activity: populatedActivity 
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;