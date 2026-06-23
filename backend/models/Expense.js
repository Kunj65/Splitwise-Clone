import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    receiptUrl: { type: String, default: null },
    category: { 
      type: String,
      enum: ["food", "travel", "rent", "utilities", "entertainment", "shopping", "health", "education", "transportation", "insurance", "other"],
      default: "other"
    },
    type: { type: String },
  },
  { timestamps: true } // 👈 This is correct syntax
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;