const express = require("express");

const {
  registerUser,
  loginUser,
  verifyOtp,
  verifyLoginOtp,
} = require("../controllers/authController");

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

router.post(
  "/verify-otp",
  verifyOtp
);
router.post(
  "/verify-login-otp",
  verifyLoginOtp
);

module.exports = router;