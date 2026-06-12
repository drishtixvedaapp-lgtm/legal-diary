const mongoose = require("mongoose");

const precedentSchema = new mongoose.Schema(
  {
    caseTitle: {
      type: String,
      required: true,
    },

    courtName: {
      type: String,
    },

    caseNumber: {
      type: String,
    },

    judgmentDate: {
      type: Date,
    },

    legalPrinciple: {
      type: String,
      required: true,
    },

    category: {
      type: String,
    },

    relevantSections: {
      type: String,
    },

    citation: {
      type: String,
    },

    keyPoints: {
      type: String,
    },

    applicableFor: {
      type: String,
    },

    tags: [
      {
        type: String,
      },
    ],

    documentPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Precedent", precedentSchema);