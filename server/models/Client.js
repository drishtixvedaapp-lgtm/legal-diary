const mongoose = require("mongoose");
 
const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    occupation: {
      type: String,
    },
    notes: {
      type: String,
    },
    // Which lawyer created this client
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
 
module.exports = mongoose.model("Client", clientSchema);