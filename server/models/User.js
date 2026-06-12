const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "lawyer",
      ],
      default: "lawyer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // EMAIL VERIFIED

    isVerified: {
      type: Boolean,
      default: false,
    },

    // OTP CODE

    otp: {
      type: String,
    },

    // OTP EXPIRY

    otpExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "User",
    userSchema
  );