const express  = require("express");
const router   = express.Router();
const { getTimeline } = require("../controllers/timelineController");
const { protect }     = require("../middleware/authMiddleware");

// Protected — requires valid JWT
router.get("/:caseId", protect, getTimeline);

module.exports = router;
