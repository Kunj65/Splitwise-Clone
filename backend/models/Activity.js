import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:     { type: String, required: true },
    message:  { type: String, required: true },
    amount:   { type: Number, default: null },   // ✅ FIX: added
    currency: { type: String, default: null },   // ✅ FIX: added
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;