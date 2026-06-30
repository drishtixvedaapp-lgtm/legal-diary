/**
 * ONE-TIME MIGRATION — fixes all clients with the fake example ID
 * Run: node migrate-clients.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // Replace the fake example ID with the real admin ID
    const fakeId  = "6651234abcd5678ef9012345";
    const realId  = "6a05e2056da48bc94b1a0021"; // Maruvada Aasritha Padmini (admin)

    const result = await db.collection("clients").updateMany(
      { createdBy: new mongoose.Types.ObjectId(fakeId) },
      { $set: { createdBy: new mongoose.Types.ObjectId(realId) } }
    );

    console.log(`✅ Fixed ${result.modifiedCount} client(s) → now assigned to admin account`);
    console.log("\nClients now visible for: Maruvada Aasritha Padmini (admin)");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
