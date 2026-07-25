/**
 * Reset any user's password
 * Run: node reset-password.js <email> <newpassword>
 *
 * Example:
 *   node reset-password.js malayappanapm@gmail.com MyNewPassword123
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const email       = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("❌  Usage: node reset-password.js <email> <newpassword>");
  console.error("    Example: node reset-password.js malayappanapm@gmail.com MyNewPass123");
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error("❌  Password must be at least 6 characters.");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db   = mongoose.connection.db;
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      console.error(`❌  No user found with email: ${email}`);
      console.log("\nAvailable accounts:");
      const all = await db.collection("users").find({}).toArray();
      all.forEach(u => console.log(`   ${u.email}  (${u.role})`));
      process.exit(1);
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await db.collection("users").updateOne(
      { email },
      { $set: { password: hashed, otp: null, otpExpires: null } }
    );

    console.log(`✅ Password reset successfully!`);
    console.log(`   Account : ${user.name}`);
    console.log(`   Email   : ${email}`);
    console.log(`   Role    : ${user.role}`);
    console.log(`\n   You can now log in with your new password.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
