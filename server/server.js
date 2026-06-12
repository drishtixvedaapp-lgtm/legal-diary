// ── Load env FIRST before anything else ──────────────────────────────────────
require("dotenv").config();
require("dns").setDefaultResultOrder("ipv4first");

const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const connectDB               = require("./config/db");
const startHearingReminder    = require("./scheduler/hearingReminder");

const authRoutes              = require("./routes/authRoutes");
const clientRoutes            = require("./routes/clientRoutes");
const caseRoutes              = require("./routes/caseRoutes");
const caseNoteRoutes          = require("./routes/caseNoteRoutes");
const caseDocumentRoutes      = require("./routes/caseDocumentRoutes");
const notificationRoutes      = require("./routes/notificationRoutes");
const hearingOutcomeRoutes    = require("./routes/hearingOutcomeRoutes");
const dashboardRoutes         = require("./routes/dashboardRoutes");
const adminRoutes             = require("./routes/adminRoutes");
const timelineRoutes          = require("./routes/timelineRoutes");

// ── Connect DB & start scheduler ──────────────────────────────────────────────
connectDB();
startHearingReminder();

const app = express();

// ── CORS — only allow the configured frontend origin ──────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ── Serve uploaded files ──────────────────────────────────────────────────────
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

app.get("/", (req, res) => res.send("Legal Diary API Running"));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  // Only log actual server errors (5xx), not auth/permission errors (4xx)
  if (status >= 500) {
    console.error("❌ Server Error:", err.message);
  }
  res.status(status).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
