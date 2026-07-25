const mongoose = require("mongoose");

const timelineEventSchema =
new mongoose.Schema({

  caseId: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
  },

  eventType: {
    type: String,
    enum: [
      "NOTE",
      "DOCUMENT",
      "HEARING_OUTCOME",
      "STATUS"
    ],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

}, {
  timestamps: true,
});

module.exports =
mongoose.model(
  "TimelineEvent",
  timelineEventSchema
);