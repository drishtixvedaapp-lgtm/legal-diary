const Case         = require("../models/Case");
const Client       = require("../models/Client");
const Notification = require("../models/Notification");

const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    // Filter by logged-in user unless admin
    const userFilter  = isAdmin ? {} : { createdBy: req.user._id };
    const lawyerFilter = isAdmin ? {} : { assignedLawyer: req.user._id };

    const totalClients = await Client.countDocuments(userFilter);
    const totalCases   = await Case.countDocuments(lawyerFilter);
    const activeCases  = await Case.countDocuments({ ...lawyerFilter, status: "Active" });
    const closedCases  = await Case.countDocuments({ ...lawyerFilter, status: "Closed" });

    // Today's hearings
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);
    const todayHearings = await Case.countDocuments({
      ...lawyerFilter,
      nextHearing: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: "Closed" },
    });

    const totalNotifications = await Notification.countDocuments();
    const totalDocuments     = 0; // extend if you add a Document model count

    res.status(200).json({
      totalClients,
      totalCases,
      activeCases,
      closedCases,
      todayHearings,
      totalNotifications,
      totalDocuments,
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
