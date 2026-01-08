// ======================
// 🌍 Load Environment Variables
// ======================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("./src/models");

// ======================
// 🚀 Initialize App
// ======================
const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

//CRON


// ======================
// 🔐 CORS Setup
// ======================
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ======================
// 🧩 Global Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Logging (dev only)
if (ENV === "development") {
  app.use(morgan("dev"));
}

// ======================
// 📁 Ensure Uploads Folder Exists
// ======================
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Folder 'uploads' dibuat otomatis.");
}

// 📁 Ensure Profile Upload Folder Exists
const profilePath = path.join(__dirname, "uploads/profile");
if (!fs.existsSync(profilePath)) {
  fs.mkdirSync(profilePath, { recursive: true });
  console.log("📂 Folder 'uploads/profile' dibuat otomatis.");
}

// ======================
// 🖼 Static Files (Foto Profil, Gambar, dll) - DENGAN CORS
// ======================
app.use(
  "/uploads",
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
  express.static(uploadsPath)
);

// ======================
// 📦 Import Routes
// ======================
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/gudang", require("./src/routes/gudang"));
app.use("/api/inventori", require("./src/routes/inventori"));
app.use("/api/item", require("./src/routes/item"));
app.use("/api/kategori", require("./src/routes/kategori"));
app.use("/api/staff", require("./src/routes/staff"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/password", require("./src/routes/password"));
app.use("/api/notifikasi", require("./src/routes/notifikasi"));
app.use('/api/laporan', require("./src/routes/laporan"));
app.use('/api/opname', require("./src/routes/opname"));
app.use('/api/dashboard', require("./src/routes/dashboard"));
app.use('/api/superadmin', require("./src/routes/superadmin_auth"));
app.use('/api/sub-plans', require("./src/routes/sub_plan"));
app.use('/api/payment', require("./src/routes/payment"));
app.use('/api/superadmin-langganan', require("./src/routes/superadmin_langganan"));
app.use('/api/superadmin', require("./src/routes/superadminProfile"));
app.use('/api/superadmin', require("./src/routes/dataPengguna"));
app.use('/api/superadmin', require("./src/routes/keamanan"));

app.use('/api/activity-logs', require("./src/routes/activityLog")); 

// ======================
// 🏁 Root Route
// ======================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "🚀 RILOG Backend running successfully",
    environment: ENV,
    uploads_path: uploadsPath,
  });
});

// ======================
// ⚠ 404 Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Endpoint ${req.originalUrl} tidak ditemukan`,
  });
});

// ======================
// ⚠ Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error("🔥 Internal Server Error:", err);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server",
    detail: ENV === "development" ? err.message : undefined,
  });
});

// ======================
// 🗄 Database & Server Boot
// ======================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    if (ENV === "development") {
      await sequelize.sync();
      console.log("🔄 Database synced (development mode).");
    }

    app.listen(PORT, () => {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`✅ Server running at: http://localhost:${PORT}`);
      console.log(`📁 Static files at: http://localhost:${PORT}/uploads`);
      console.log(`🌍 Environment: ${ENV}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
      // ======================
      // 🔔 Start Notifikasi Scheduler
      // ======================
      const { startNotifikasiScheduler } = require("./src/utils/notifikasiScheduler");
      startNotifikasiScheduler();
      console.log(""); // Spacing
      
      const { startScheduler } = require("./src/utils/subEndScheduler");
      startScheduler();
      console.log("");
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
})();