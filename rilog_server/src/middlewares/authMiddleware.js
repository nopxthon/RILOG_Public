const jwt = require("jsonwebtoken");
const { User, Bisnis, Superadmin } = require("../models");

const authMiddleware = async (req, res, next) => {
  // console.log("\n🛑 --- START AUTH CHECK ---"); 
  // (Log opsional, boleh dimatikan biar terminal bersih)

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // console.log("❌ GAGAL: Header Authorization kosong");
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET || 'supersecretkey';

    const decoded = jwt.verify(token, secretKey);
    // console.log("✅ Token OK. Role:", decoded.role);

    let user = null;
    let isSuperadmin = false;

    // 1. Cek User di Database
    if (decoded.role === 'superadmin') {
      isSuperadmin = true; 
      // console.log(`🔎 Mencari Superadmin ID: ${decoded.id}`);
      user = await Superadmin.findByPk(decoded.id);
    } else {
      // console.log(`🔎 Mencari User ID: ${decoded.id}`);
      user = await User.findByPk(decoded.id, {
        include: [{ model: Bisnis, as: "bisnis" }],
      });
    }

    // 2. Jika User Tidak Ditemukan
    if (!user) {
      // console.log("❌ User tidak ada di DB");
      return res.status(401).json({ message: "User tidak ditemukan di database" });
    }

    // 3. 🔥 LOGIC BARU: CEK STATUS SUSPEND (HANYA UNTUK USER BIASA/STAFF) 🔥
    if (!isSuperadmin) {
        // Jika status bukan 'active' (misal: 'suspended' atau 'pending'), tolak akses!
        if (user.status !== 'active') {
            console.log(`❌ AKSES DITOLAK: Status user adalah '${user.status}'`);
            return res.status(403).json({ 
                message: "Akun Anda telah dibekukan (Suspended) atau belum aktif. Silakan hubungi Admin." 
            });
        }
    }

    // 4. Set User ke Request Object
    if (isSuperadmin) {
      req.user = { 
        id: user.id, 
        username: user.username, 
        role: 'superadmin',
        isSuperadmin: true 
      };
    } else {
      req.user = { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        // 🔥 PENTING: Masukkan bisnis_id ke req.user agar controller bisa pakai langsung
        bisnis_id: user.bisnis_id, 
        status: user.status,
        isSuperadmin: false 
      };
    }
    
    // Simpan instance lengkap jika controller butuh method sequelize
    req.userInstance = user;
    
    // console.log("✅ AUTH SUKSES. User:", req.user.username || req.user.name);
    next();

  } catch (error) {
    console.error("❌ ERROR AUTH:", error.message);
    return res.status(401).json({ message: "Token Invalid atau Kedaluwarsa." });
  }
};

// HELPER ROLE
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized." });
    
    // console.log(`👮 Cek Role: User [${req.user.role}] vs Allowed [${allowedRoles}]`);
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ DITOLAK: Role ${req.user.role} tidak diizinkan.`);
      return res.status(403).json({ message: "Akses Ditolak. Role tidak sesuai." });
    }
    next();
  };
};

authMiddleware.checkRole = checkRole;
module.exports = authMiddleware;