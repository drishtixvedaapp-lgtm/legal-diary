const express =
require("express");

const router =
express.Router();

const {
  createNote,
  getNotesByCase,
  deleteNote,
} = require(
  "../controllers/caseNoteController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

router.post(
  "/",
  protect,
  createNote
);

router.get(
  "/:caseId",
  protect,
  getNotesByCase
);

router.delete(
  "/:id",
  protect,
  deleteNote
);

module.exports =
router;