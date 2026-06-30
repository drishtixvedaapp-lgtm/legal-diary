/**
 * Shows all users and all clients in your database
 * Run: node check-db.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // Show all users
    const users = await db.collection("users").find({}).toArray();
    console.log("═══════════════════════════════════════");
    console.log(`USERS (${users.length} found)`);
    console.log("═══════════════════════════════════════");
    users.forEach(u => {
      console.log(`  Name  : ${u.name}`);
      console.log(`  Email : ${u.email}`);
      console.log(`  Role  : ${u.role}`);
      console.log(`  _id   : ${u._id}`);
      console.log("───────────────────────────────────────");
    });

    // Show all clients
    const clients = await db.collection("clients").find({}).toArray();
    console.log(`\nCLIENTS (${clients.length} found)`);
    console.log("═══════════════════════════════════════");
    clients.forEach(c => {
      console.log(`  Name      : ${c.name}`);
      console.log(`  createdBy : ${c.createdBy ?? "❌ NOT SET"}`);
      console.log(`  _id       : ${c._id}`);
      console.log("───────────────────────────────────────");
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
