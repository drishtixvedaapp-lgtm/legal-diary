const Client         = require("../models/Client");
const Case           = require("../models/Case");
const CaseNote       = require("../models/CaseNote");
const CaseDocument   = require("../models/CaseDocument");
const HearingOutcome = require("../models/HearingOutcome");
const Notification   = require("../models/Notification");
const TimelineEvent  = require("../models/TimelineEvent");

// ── CREATE CLIENT ─────────────────────────────────────────────────────────────
const createClient = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET CLIENTS ───────────────────────────────────────────────────────────────
const getClients = async (req, res) => {
  try {
    // Admin sees all clients
    // Lawyer sees only their own clients (where createdBy matches)
    const filter = req.user.role === "admin"
      ? {}
      : { createdBy: req.user._id };

    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET SINGLE CLIENT ─────────────────────────────────────────────────────────
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    if (req.user.role !== "admin" &&
        client.createdBy?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to view this client" });

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE CLIENT ─────────────────────────────────────────────────────────────
const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    if (req.user.role !== "admin" &&
        client.createdBy?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to update this client" });

    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE CLIENT + CASCADE ───────────────────────────────────────────────────
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    if (req.user.role !== "admin" &&
        client.createdBy?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to delete this client" });

    const cases   = await Case.find({ client: req.params.id });
    const caseIds = cases.map((c) => c._id);

    if (caseIds.length > 0) {
      await Promise.all([
        CaseNote.deleteMany(      { caseId: { $in: caseIds } }),
        CaseDocument.deleteMany(  { caseId: { $in: caseIds } }),
        HearingOutcome.deleteMany({ caseId: { $in: caseIds } }),
        Notification.deleteMany(  { case:   { $in: caseIds } }),
        TimelineEvent.deleteMany( { caseId: { $in: caseIds } }),
        Case.deleteMany(          { client: req.params.id   }),
      ]);
    }

    await client.deleteOne();
    res.status(200).json({ message: "Client and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClient, getClients, getClientById, updateClient, deleteClient };
