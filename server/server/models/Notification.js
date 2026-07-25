const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },

    type: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },

    scheduledFor: {
      type: Date,
      required: true,
    },

    sent: {
      type: Boolean,
      default: false,
    },

    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);