const mongoose = require("mongoose");

const caseDocumentSchema =
new mongoose.Schema({

  caseId: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
  },

  fileName: {
    type: String,
    required: true,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  uploadedBy: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

}, {
  timestamps: true,
});

module.exports =
mongoose.model(
  "CaseDocument",
  caseDocumentSchema
);