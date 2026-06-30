/**
 * ONE-TIME MIGRATION — assigns all orphaned clients to a specific lawyer
 * Run: node migrate-clients.js <your-user-id>
 */
require("dotenv").config();
const mongoose = require("mongoose");

const lawyerId = process.argv[2];

if (!lawyerId) {
  console.error("❌  Usage: node migrate-clients.js <your-user-id>");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get the raw collection — bypass schema validation so we can update
    // documents that don't have createdBy yet
    const db = mongoose.connection.db;
    const result = await db.collection("clients").updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: new mongoose.Types.ObjectId(lawyerId) } }
    );

    console.log(`✅ Done — updated ${result.modifiedCount} client(s) → assigned to ${lawyerId}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
