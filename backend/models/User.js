import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true },
    email:            { type: String, required: true, unique: true, lowercase: true },
    password:         { type: String, required: true },
    otp:              { type: String, default: null },
    otpExpiresAt:     { type: Date,   default: null },
    resetToken:       { type: String, default: null },
    resetTokenExpiry: { type: Date,   default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;