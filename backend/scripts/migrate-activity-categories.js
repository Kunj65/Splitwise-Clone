import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Expense from "../models/Expense.js";
import dotenv from "dotenv";

dotenv.config();

const migrateActivities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/splitwise");
    console.log("✅ Connected to MongoDB");

    // Find all activities without category
    const activities = await Activity.find({ 
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: "" }
      ]
    });
    
    console.log(`📊 Found ${activities.length} activities without category`);

    if (activities.length === 0) {
      console.log("✅ All activities already have categories!");
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;

    for (const activity of activities) {
      try {
        // Check if activity has a group
        if (!activity.group) {
          console.log(`⚠️ Activity ${activity._id} has no group - skipping`);
          // Set category anyway
          activity.category = "other";
          await activity.save();
          updated++;
          continue;
        }

        // Try to find related expense
        let category = "other";
        
        // Method 1: Try to find by description in message
        const match = activity.message.match(/added an expense: (.+?)(?: \(|\s*$|$)/);
        if (match) {
          const description = match[1].trim();
          const expense = await Expense.findOne({ 
            description: description,
            group: activity.group 
          }).sort({ createdAt: -1 });

          if (expense && expense.category) {
            category = expense.category;
            console.log(`✅ Found category "${category}" for activity: "${activity.message}"`);
          }
        }

        // Method 2: If no expense found, try to find by amount
        if (category === "other" && activity.amount) {
          const expense = await Expense.findOne({ 
            amount: activity.amount,
            group: activity.group 
          }).sort({ createdAt: -1 });

          if (expense && expense.category) {
            category = expense.category;
            console.log(`✅ Found category "${category}" by amount for activity: "${activity.message}"`);
          }
        }

        // Update activity with category
        activity.category = category;
        await activity.save();
        updated++;
        console.log(`📝 Updated activity ${activity._id} with category: ${category}`);
        
      } catch (err) {
        console.log(`❌ Error updating activity ${activity._id}:`, err.message);
        skipped++;
        // Try to set category anyway
        try {
          activity.category = "other";
          // Remove validation for this specific save
          await Activity.updateOne(
            { _id: activity._id },
            { $set: { category: "other" } }
          );
          updated++;
        } catch (updateErr) {
          console.log(`❌ Failed to update activity ${activity._id}:`, updateErr.message);
          skipped++;
        }
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Updated ${updated} activities with categories`);
    console.log(`⚠️ Skipped ${skipped} activities`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

migrateActivities();