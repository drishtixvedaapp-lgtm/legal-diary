/**
 * Reassigns all 4 clients from admin to Malayappan (lawyer)
 * Run: node fix-malayappan-clients.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;

    const adminId     = "6a05e2056da48bc94b1a0021"; // Maruvada Aasritha Padmini
    const malayappanId = "6a05f41f8ea6f2a0860a2f92"; // Malayappan (lawyer)

    const result = await db.collection("clients").updateMany(
      { createdBy: new mongoose.Types.ObjectId(adminId) },
      { $set: { createdBy: new mongoose.Types.ObjectId(malayappanId) } }
    );

    console.log(`✅ Reassigned ${result.modifiedCount} client(s) → now belong to Malayappan`);
    console.log("\nClients now visible when Malayappan logs in.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
