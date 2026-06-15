import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "monthly" },
    nextRun: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const RecurringExpense = mongoose.model("RecurringExpense", recurringSchema);
export default RecurringExpense;