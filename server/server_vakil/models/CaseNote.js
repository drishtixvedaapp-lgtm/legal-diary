const mongoose = require("mongoose");

const caseNoteSchema =
new mongoose.Schema({

  caseId: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  createdBy: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

}, {
  timestamps: true,
});

module.exports =
mongoose.model(
  "CaseNote",
  caseNoteSchema
);