const express =
require("express");

const router =
express.Router();

const {

  uploadDocument,

  getDocuments,

  deleteDocument,

} = require(
  "../controllers/caseDocumentController"
);

const upload =
require(
  "../middleware/uploadMiddleware"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

router.post(
  "/",
  protect,
  upload.single("file"),
  uploadDocument
);

router.get(
  "/:caseId",
  protect,
  getDocuments
);

router.delete(
  "/:id",
  protect,
  deleteDocument
);

module.exports =
router;