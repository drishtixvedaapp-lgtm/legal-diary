const express = require("express");

const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  getClosedCases,
} = require("../controllers/caseController");

const {
  protect,
  lawyerOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE
router.post("/", protect,
  lawyerOnly, createCase);

// GET ALL
router.get("/", protect, getCases);

router.get(
  "/history/closed",
  protect,
  getClosedCases
);

// GET SINGLE
router.get("/:id", protect, getCaseById);

// UPDATE
router.put("/:id", protect,
  lawyerOnly, updateCase);

// DELETE
router.delete("/:id", protect,
  lawyerOnly,deleteCase);

module.exports = router;