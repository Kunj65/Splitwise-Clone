import mongoose from "mongoose";

// models/Activity.js
const activitySchema = new mongoose.Schema(
  {
    group: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Group",
      // Remove required: true if you want it optional
      // required: true 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      // required: true 
    },
    type: { 
      type: String, 
      enum: ["expense_added", "group_created", "group_deleted", "group_invite"],
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    amount: { 
      type: Number, 
      default: 0 
    },
    currency: { 
      type: String, 
      default: "INR" 
    },
    category: { 
      type: String,
      enum: ["food", "travel", "rent", "utilities", "entertainment", "shopping", "health", "education", "transportation", "insurance", "other"],
      default: "other"
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;  