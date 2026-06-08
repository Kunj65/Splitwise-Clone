import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  sendMail,
  forgotPasswordTemplate,
  otpTemplate,
} from "../utils/mailer.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in environment");

const createToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

// ─── SIGNUP ───────────────────────────────────────────────
router.post("/signup", async (req, res) => {
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
});

// ─── LOGIN (password) ─────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid email or password" });

  const token = createToken(user);
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  });
});

// ─── SEND OTP (for OTP login) ─────────────────────────────
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "No account found with this email" });

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await User.findByIdAndUpdate(user._id, { otp, otpExpiresAt });

  await sendMail({
    to: user.email,
    subject: "Your Login OTP — Splitwise App",
    html: otpTemplate({
      name: user.name,
      otp,
    }),
  });

  return res.json({ message: "OTP sent to your email" });
});

// ─── VERIFY OTP ───────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  if (new Date() > user.otpExpiresAt)
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });

  // Clear OTP after use
  await User.findByIdAndUpdate(user._id, { otp: null, otpExpiresAt: null });

  const token = createToken(user);
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  });
});

// ─── FORGOT PASSWORD ──────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return success to prevent email enumeration
  if (!user) return res.json({ message: "If this email exists, a reset link has been sent." });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.findByIdAndUpdate(user._id, { resetToken, resetTokenExpiry });

  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${user.email}`;

  await sendMail({
    to: user.email,
    subject: "Reset Your Password — Splitwise App",
    html: forgotPasswordTemplate({
      name: user.name,
      resetLink,
    }),
  });

  return res.json({ message: "If this email exists, a reset link has been sent." });
});

// ─── RESET PASSWORD ───────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.resetToken !== token)
    return res.status(400).json({ message: "Invalid or expired reset link" });

  if (new Date() > user.resetTokenExpiry)
    return res.status(400).json({ message: "Reset link has expired. Please request a new one." });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return res.json({ message: "Password reset successful. You can now log in." });
});

// ─── PROFILE ──────────────────────────────────────────────
router.get("/profile", authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

router.patch("/profile", authMiddleware, async (req, res) => {
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
});

export default router;