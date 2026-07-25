const User = require("../models/User");
const Case = require("../models/Case");

// ── ADMIN ANALYTICS ───────────────────────────────────────────────────────────
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers   = await User.countDocuments();
    const totalLawyers = await User.countDocuments({ role: "lawyer" });
    const totalClients = await User.countDocuments({ role: "client" });
    const totalCases   = await Case.countDocuments();
    const activeCases  = await Case.countDocuments({ status: "Active" });
    const totalNotifications = require("../models/Notification") ? await require("../models/Notification").countDocuments() : 0;

    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(); tomorrow.setHours(23,59,59,999);

    const urgentHearings = await Case.find({
      nextHearing: { $gte: today, $lte: tomorrow },
      status: { $ne: "Closed" },
    }).populate("client assignedLawyer");

    res.status(200).json({
      totalUsers, totalLawyers, totalClients,
      totalCases, activeCases, totalNotifications,
      urgentHearings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL USERS ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpires").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── TOGGLE USER ACTIVE / INACTIVE ─────────────────────────────────────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (req.params.id === req.user._id.toString())
      return res.status(403).json({ message: "You cannot deactivate your own account" });

    if (user.role === "admin")
      return res.status(403).json({ message: "Admin accounts cannot be deactivated" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE USER ───────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (req.params.id === req.user._id.toString())
      return res.status(403).json({ message: "You cannot delete your own account" });

    if (user.role === "admin")
      return res.status(403).json({ message: "Admin accounts cannot be deleted" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminAnalytics, getAllUsers, toggleUserActive, deleteUser };
