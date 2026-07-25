const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── PROTECT — verify JWT token ────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized — no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(401).json({ message: "Not authorized — user no longer exists" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Contact admin." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired — please log in again" });
    }
    return res.status(401).json({ message: "Not authorized — invalid token" });
  }
};

// ── ADMIN ONLY ────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Access denied — admin only" });
};

// ── LAWYER OR ADMIN ───────────────────────────────────────────────────────────
const lawyerOnly = (req, res, next) => {
  if (req.user && (req.user.role === "lawyer" || req.user.role === "admin")) return next();
  return res.status(403).json({ message: "Access denied — lawyer only" });
};

// ── CLIENT ONLY ───────────────────────────────────────────────────────────────
const clientOnly = (req, res, next) => {
  if (req.user && req.user.role === "client") return next();
  return res.status(403).json({ message: "Access denied — client only" });
};

module.exports = { protect, adminOnly, lawyerOnly, clientOnly };
