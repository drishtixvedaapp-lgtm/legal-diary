const express =
require("express");

const router =
express.Router();

const {
  getNotifications,
  createReminder,
} = require(
  "../controllers/notificationController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

router.get(
  "/",
  protect,
  getNotifications
);
router.post(
  "/reminder",
  protect,
  createReminder
);

module.exports =
router;