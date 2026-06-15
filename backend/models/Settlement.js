import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
    {
        group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
        paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        paidTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
    },
    { timestamps: true }
);

const Settlement = mongoose.model("Settlement", settlementSchema);
export default Settlement;