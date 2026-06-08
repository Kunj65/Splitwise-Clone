import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    group:        { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    description:  { type: String, default: "" },
    amount:       { type: Number, required: true },
    currency:     { type: String, default: "INR" }, // ✅ ADD THIS
    paidBy:       { type: String, required: true },
    splitBetween: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;