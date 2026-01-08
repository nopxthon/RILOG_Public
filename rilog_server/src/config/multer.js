const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder uploads/profile ada
const uploadDir = path.join(__dirname, "../../uploads/profile");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format: user_123_1234567890.jpg
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `user_${req.user.id}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// Filter file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan!"));
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Max 2MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;