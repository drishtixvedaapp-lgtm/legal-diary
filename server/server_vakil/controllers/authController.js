const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const User         = require("../models/User");
const { sendEmail, buildOtpEmail } = require("../utils/sendEmail");
 
// ── Generate 6-digit numeric OTP without external package ────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
 
// ── Token generator ───────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
 
// ── REGISTER (always lawyer) ──────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
 
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists with this email" });
 
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp            = generateOTP();
    const otpExpires     = new Date(Date.now() + 10 * 60 * 1000);
 
    const user = await User.create({
      name,
      email,
      password:   hashedPassword,
      role:       "lawyer",
      otp,
      otpExpires,
      isVerified: false,
    });
 
    // Fire-and-forget — email failure must never crash the response
    sendEmail(
      email,
      "VakilSummons — Verify Your Account",
      `Your OTP is: ${otp}. Expires in 10 minutes.`,
      buildOtpEmail({ name, otp, purpose: "registration" })
    );
 
    res.status(201).json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      message: "Account created. Please check your email for the OTP.",
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
 
// ── LOGIN ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });
 
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });
 
    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email first" });
 
    if (user.isActive === false)
      return res.status(403).json({ message: "Account deactivated. Contact admin." });
 
    const otp        = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
 
    user.otp        = otp;
    user.otpExpires = otpExpires;
    await user.save();
 
    sendEmail(
      user.email,
      "VakilSummons — Your Login OTP",
      `Your login OTP is: ${otp}. Expires in 10 minutes.`,
      buildOtpEmail({ name: user.name, otp, purpose: "login" })
    );
 
    res.status(200).json({
      message: "OTP sent to your email",
      email:   user.email,
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
 
// ── VERIFY REGISTRATION OTP ───────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
 
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });
 
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
 
    if (new Date() > user.otpExpires)
      return res.status(400).json({ message: "OTP expired. Please register again." });
 
    user.isVerified = true;
    user.otp        = null;
    user.otpExpires = null;
    await user.save();
 
    res.status(200).json({ message: "Account verified. You can now log in." });
  } catch (error) {
    console.error("❌ VerifyOtp error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
 
// ── VERIFY LOGIN OTP ──────────────────────────────────────────────────────────
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
 
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });
 
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
 
    if (new Date() > user.otpExpires)
      return res.status(400).json({ message: "OTP expired. Please log in again." });
 
    user.otp        = null;
    user.otpExpires = null;
    await user.save();
 
    res.status(200).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ VerifyLoginOtp error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
 
module.exports = { registerUser, loginUser, verifyOtp, verifyLoginOtp };