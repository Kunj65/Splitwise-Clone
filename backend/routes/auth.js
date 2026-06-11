import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { sendMail, forgotPasswordTemplate, otpTemplate } from "../utils/mailer.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in environment");

const createToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });
    const token = createToken(user);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = createToken(user);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();

    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString())
        return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    return res.json({ user: updatedUser });
  } catch (err) {
    return res.status(500).json({ message: "Profile update failed" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: "If this email exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, { resetToken, resetTokenExpiry });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your Splitwise password",
      html: forgotPasswordTemplate({ name: user.name, resetLink }),
    });

    return res.json({ message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Failed to send reset email" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password are required" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset link" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

// SEND OTP — user enters email, gets 6-digit OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "No account found with this email" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    await sendMail({
      to: user.email,
      subject: "Your Splitwise Login Code",
      html: otpTemplate({ name: user.name, otp }),
    });

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

// VERIFY OTP — user enters OTP, gets logged in
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({
      email: email.toLowerCase(),
      otp,
      otpExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    // Clear OTP after successful use
    await User.findByIdAndUpdate(user._id, { otp: null, otpExpiry: null });

    const token = createToken(user);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "OTP verification failed" });
  }
});

export default router;