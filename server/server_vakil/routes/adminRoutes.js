const express = require("express");
const {
  getAdminAnalytics,
  getAllUsers,
  toggleUserActive,
  deleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(   "/analytics",           protect, adminOnly, getAdminAnalytics);
router.get(   "/users",               protect, adminOnly, getAllUsers);
router.patch( "/users/:id/toggle",    protect, adminOnly, toggleUserActive);
router.delete("/users/:id",           protect, adminOnly, deleteUser);

module.exports = router;
