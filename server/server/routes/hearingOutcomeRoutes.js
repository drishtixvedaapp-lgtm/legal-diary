const express =
require("express");

const router =
express.Router();

const {

  createOutcome,

  getOutcomesByCase,

} = require(
  "../controllers/hearingOutcomeController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

router.post(
  "/",
  protect,
  createOutcome
);

router.get(
  "/:caseId",
  protect,
  getOutcomesByCase
);

module.exports =
router;