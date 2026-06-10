import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    archived: { type: Boolean, default: false },
    settled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;