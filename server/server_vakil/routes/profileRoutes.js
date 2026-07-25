const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(  "/",                protect, getProfile);
router.put(  "/",                protect, updateProfile);
router.patch("/change-password", protect, changePassword);

module.exports = router;
