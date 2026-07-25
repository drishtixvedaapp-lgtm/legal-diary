// ── Load env FIRST ────────────────────────────────────────────────────────────
require("dotenv").config();
require("dns").setDefaultResultOrder("ipv4first");

const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const fs       = require("fs");

const connectDB            = require("./config/db");
const startHearingReminder = require("./scheduler/hearingReminder");
const { startWhatsApp }    = require("./utils/whatsappClient");

const authRoutes           = require("./routes/authRoutes");
const clientRoutes         = require("./routes/clientRoutes");
const caseRoutes           = require("./routes/caseRoutes");
const caseNoteRoutes       = require("./routes/caseNoteRoutes");
const caseDocumentRoutes   = require("./routes/caseDocumentRoutes");
const notificationRoutes   = require("./routes/notificationRoutes");
const hearingOutcomeRoutes = require("./routes/hearingOutcomeRoutes");
const dashboardRoutes      = require("./routes/dashboardRoutes");
const adminRoutes          = require("./routes/adminRoutes");
const timelineRoutes       = require("./routes/timelineRoutes");
const profileRoutes        = require("./routes/profileRoutes");

// ── Auto-create uploads folder ───────────────────────────────────────────────
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
  console.log("📁 uploads/ folder created");
}

// ── Connect DB & start services ───────────────────────────────────────────────
connectDB();
startWhatsApp();
startHearingReminder();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ── Static files ──────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",             authRoutes);
app.use("/api/clients",          clientRoutes);
app.use("/api/cases",            caseRoutes);
app.use("/api/case-notes",       caseNoteRoutes);
app.use("/api/case-documents",   caseDocumentRoutes);
app.use("/api/notifications",    notificationRoutes);
app.use("/api/hearing-outcomes", hearingOutcomeRoutes);
app.use("/api/dashboard",        dashboardRoutes);
app.use("/api/admin",            adminRoutes);
app.use("/api/timeline",         timelineRoutes);
app.use("/api/profile",          profileRoutes);

app.get("/", (req, res) => res.send("VakilSummons API Running ⚖️"));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  if (status >= 500) console.error("❌ Server Error:", err.message);
  res.status(status).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ VakilSummons server running on port ${PORT}`));
