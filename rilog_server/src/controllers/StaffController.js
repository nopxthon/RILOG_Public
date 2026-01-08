const {
  User,
  Otp_verify,
  Bisnis,
  Gudang,
  Sub_plan, // Pastikan model Sub_plan diimport
  User_gudang_access,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const staffInviteTemplate = require("../templates/staffInviteTemplate");

module.exports = {
  // ========================================================
  // 1️⃣ ADMIN UNDANG STAFF (MULTI GUDANG) — CEK LIMIT PAKET
  // ========================================================
  inviteStaff: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { username, email, gudangIds } = req.body;
      const adminId = req.user?.id; // Admin yang mengundang

      if (!username || !email || !Array.isArray(gudangIds)) {
        await t.rollback();
        return res.status(400).json({
          message: "Nama, email, dan daftar gudang wajib diisi.",
        });
      }

      // 1. Ambil Data Bisnis & Paket Admin
      const admin = await User.findByPk(adminId, {
        include: [{ 
            model: Bisnis, 
            as: 'bisnis',
            include: [{ model: Sub_plan, as: 'subPlan' }] 
        }],
        transaction: t
      });

      if (!admin || !admin.bisnis) {
        await t.rollback();
        return res.status(404).json({ message: "Data bisnis tidak ditemukan." });
      }

      const bisnis_id = admin.bisnis.id;
      const currentPlan = admin.bisnis.subPlan;
      const LIMIT_STAFF = currentPlan ? currentPlan.limit_staff : 3; // Default 3

      // 2. Hitung Staff yang Memakai Slot (Active + Pending)
      const usedSlots = await User.count({
        where: {
          bisnis_id: bisnis_id,
          role: 'staff',
          status: { [Op.in]: ['active', 'pending'] } // Hitung active & pending
        },
        transaction: t
      });

      // 🔥 3. CEK LIMIT 🔥
      if (usedSlots >= LIMIT_STAFF) {
        await t.rollback();
        return res.status(403).json({
          message: `Kuota Staff Penuh (${usedSlots}/${LIMIT_STAFF}). Upgrade paket atau nonaktifkan (suspend) staff lama.`
        });
      }

      // 4. Cek Email Duplikat
      const existing = await User.findOne({ where: { email }, transaction: t });
      if (existing) {
        await t.rollback();
        if (existing.status === "pending") {
          return res.status(400).json({ message: "Email sudah diundang dan menunggu aktivasi." });
        }
        return res.status(400).json({ message: "Email sudah digunakan oleh akun lain." });
      }

      // 5. Validasi Gudang
      if (gudangIds.length > 0) {
          const validGudangs = await Gudang.findAll({
            where: { id: gudangIds, bisnis_id },
            attributes: ["id"],
            transaction: t,
          });

          if (validGudangs.length !== gudangIds.length) {
            await t.rollback();
            return res.status(400).json({ message: "Ada gudang yang bukan milik bisnis ini." });
          }
      }

      // 6. Buat User Pending
      const inviteToken = crypto.randomBytes(24).toString("hex");
      const newUser = await User.create(
        {
          name: username,
          email,
          password: "-", // Password sementara
          role: "staff",
          status: "pending", // Default pending
          bisnis_id,
          invite_token: inviteToken,
        },
        { transaction: t }
      );

      // 7. Akses Gudang
      if (gudangIds.length > 0) {
          const userAccess = gudangIds.map((gid) => ({
            user_id: newUser.id,
            gudang_id: gid,
            role: "staff_gudang",
            status: "aktif",
          }));
          await User_gudang_access.bulkCreate(userAccess, { transaction: t });
      }

      // 8. Token Aktivasi & Email
      const token = crypto.randomBytes(32).toString("hex");
      await Otp_verify.create(
        {
          user_id: newUser.id,
          email,
          activation_token: token,
          tipe: "activation",
          expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Jam
          verified: false,
        },
        { transaction: t }
      );

      const activationLink = `${process.env.FRONTEND_URL}/activate?token=${token}`;

      try {
        await sendEmail(
          email,
          `Undangan Staff — ${admin.bisnis.nama_bisnis}`,
          staffInviteTemplate(username, "Staff Gudang", activationLink, admin.bisnis.nama_bisnis)
        );
      } catch (emailError) {
        console.error("❌ SEND EMAIL FAILED:", emailError);
        await t.rollback();
        return res.status(500).json({
          message: "Gagal mengirim email undangan. Periksa SMTP.",
          error: emailError.message,
        });
      }

      await t.commit();

      return res.status(201).json({
        message: "Staff berhasil diundang. Email aktivasi telah dikirim.",
      });

    } catch (error) {
      console.error("❌ inviteStaff Error:", error);
      await t.rollback();
      return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  },

  // ========================================================
  // 2️⃣ TOGGLE STATUS STAFF (SUSPEND / ACTIVATE)
  // ========================================================
  toggleStatusStaff: async (req, res) => {
    try {
      // 1. Defensive Check: Pastikan req.user ada
      if (!req.user || !req.user.id) {
         return res.status(401).json({ message: "Unauthorized. Silakan login ulang." });
      }

      const { id } = req.params;
      const { is_active } = req.body;
      const adminId = req.user.id;

      // 2. Ambil Admin + Plan untuk cek limit
      const admin = await User.findByPk(adminId, {
          include: [{ 
              model: Bisnis, 
              as: 'bisnis',
              include: [{ model: Sub_plan, as: 'subPlan' }]
          }]
      });

      if (!admin || !admin.bisnis) {
          return res.status(404).json({ message: "Data admin/bisnis tidak valid." });
      }

      // 3. Ambil Staff Target
      const staff = await User.findByPk(id);
      if (!staff) return res.status(404).json({ message: "Staff tidak ditemukan" });

      // Validasi Kepemilikan (Penting!)
      if (String(staff.bisnis_id) !== String(admin.bisnis_id)) {
          return res.status(403).json({ message: "Akses Ditolak. Ini bukan staff Anda." });
      }

      // ============================================
      // LOGIC MENGAKTIFKAN
      // ============================================
      if (is_active === true) {
          if (staff.status === 'active' || staff.status === 'pending') {
              return res.json({ message: "Staff sudah aktif." });
          }

          // Cek Limit
          const currentPlan = admin.bisnis?.subPlan;
          const LIMIT_STAFF = currentPlan ? currentPlan.limit_staff : 3;

          const usedSlots = await User.count({
              where: {
                  bisnis_id: admin.bisnis_id,
                  role: 'staff',
                  status: { [Op.in]: ['active', 'pending'] }
              }
          });

          if (usedSlots >= LIMIT_STAFF) {
              return res.status(403).json({
                  message: `Gagal Mengaktifkan. Kuota Staff Penuh (${usedSlots}/${LIMIT_STAFF}).`
              });
          }

          await staff.update({ status: 'active' });
      } 
      // ============================================
      // LOGIC SUSPEND
      // ============================================
      else {
          await staff.update({ status: 'suspended' });
      }

      return res.json({ 
          message: `Status staff berhasil diubah menjadi ${is_active ? 'Active' : 'Suspended'}.` 
      });

    } catch (error) {
      console.error("❌ toggleStatusStaff Error:", error);
      res.status(500).json({ message: "Server Error saat mengubah status staff." });
    }
  },

  // ========================================================
  // 3️⃣ VALIDASI TOKEN AKTIVASI (Tanpa Perubahan Signifikan)
  // ========================================================
  validateToken: async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).json({ message: "Token tidak ditemukan." });

      const otpData = await Otp_verify.findOne({
        where: { activation_token: token, tipe: "activation" },
      });

      if (!otpData) return res.status(400).json({ message: "Token tidak valid." });
      if (otpData.verified) return res.status(400).json({ message: "Token sudah digunakan." });
      if (new Date() > otpData.expired_at) {
        await otpData.destroy();
        return res.status(400).json({ message: "Token sudah kedaluwarsa." });
      }

      const user = await User.findOne({ where: { id: otpData.user_id }, attributes: ["name", "email"] });
      if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

      return res.json({ message: "Token valid.", staffName: user.name, email: user.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  },

  // ========================================================
  // 4️⃣ AKTIVASI STAFF (Set Password)
  // ========================================================
  activateStaff: async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "Token dan password wajib diisi." });

      const otpData = await Otp_verify.findOne({
        where: { activation_token: token, tipe: "activation" },
      });

      if (!otpData) return res.status(400).json({ message: "Token tidak valid." });
      if (new Date() > otpData.expired_at) return res.status(400).json({ message: "Token kadaluwarsa." });

      const hashedPassword = await bcrypt.hash(password, 10);

      // Ubah status jadi 'active'
      await User.update(
        { password: hashedPassword, status: "active" },
        { where: { id: otpData.user_id } }
      );

      otpData.verified = true;
      await otpData.save();

      const user = await User.findOne({
        where: { id: otpData.user_id },
        attributes: ["id", "name", "email", "role", "status", "bisnis_id"],
        include: [{ model: Bisnis, as: "bisnis", attributes: ["id", "nama_bisnis"] }],
      });

      return res.json({ message: "Akun berhasil diaktifkan.", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  },

  // ========================================================
  // 5️⃣ GET SEMUA STAFF
  // ========================================================
  getAllStaff: async (req, res) => {
    try {
      const adminId = req.user?.id; // ID Admin yg login

      // 1. Ambil info Admin terbaru dari DB (untuk memastikan bisnis_id valid)
      const admin = await User.findByPk(adminId);
      
      if (!admin || !admin.bisnis_id) {
        console.log("⚠️ Admin tidak punya bisnis_id:", adminId);
        return res.json([]); 
      }

      console.log(`🔍 Fetching staff for Bisnis ID: ${admin.bisnis_id}`);

      // 2. Cari Staff berdasarkan bisnis_id admin
      const staff = await User.findAll({
        where: { 
            role: "staff", 
            bisnis_id: admin.bisnis_id 
        },
        attributes: ["id", "name", "email", "status", "bisnis_id"],
        include: [
          { model: Bisnis, as: "bisnis", attributes: ["id", "nama_bisnis"] },
          {
            model: Gudang,
            as: "gudangs",
            through: { attributes: [] },
            attributes: ["id", "nama_gudang"],
          },
        ],
        order: [["id", "DESC"]], // Staff baru paling atas
      });

      return res.json(staff || []);

    } catch (error) {
      console.error("❌ getAllStaff Error:", error);
      return res.status(500).json({ message: "Gagal mengambil data staff." });
    }
  },

  // ========================================================
  // 6️⃣ UPDATE AKSES STAFF
  // ========================================================
  updateAccess: async (req, res) => {
    try {
      const adminId = req.user?.id; // Gunakan ID dari token
      const { staffId, gudangIds } = req.body;

      // 1. Ambil Data Admin untuk dapatkan bisnis_id yang valid
      const admin = await User.findByPk(adminId);
      if (!admin || !admin.bisnis_id) {
         return res.status(404).json({ message: "Data admin/bisnis tidak valid." });
      }
      const bisnis_id = admin.bisnis_id;

      if (!staffId || !Array.isArray(gudangIds)) {
        return res.status(400).json({ message: "Data tidak lengkap." });
      }

      // 2. Cari Staff berdasarkan bisnis_id admin
      const user = await User.findOne({ 
          where: { id: staffId, bisnis_id, role: "staff" } 
      });
      
      if (!user) return res.status(404).json({ message: "Staff tidak ditemukan di bisnis ini." });

      // 3. Validasi Gudang
      if (gudangIds.length > 0) {
        const validGudangs = await Gudang.findAll({ 
            where: { id: gudangIds, bisnis_id }, 
            attributes: ["id"] 
        });
        if (validGudangs.length !== gudangIds.length) {
            return res.status(400).json({ message: "Beberapa gudang tidak valid/bukan milik bisnis ini." });
        }
      }

      // 4. Update Akses
      await User_gudang_access.destroy({ where: { user_id: staffId } });

      if (gudangIds.length > 0) {
        const newAccess = gudangIds.map((gid) => ({
            user_id: staffId,
            gudang_id: gid,
            role: "staff_gudang",
            status: "aktif",
        }));
        await User_gudang_access.bulkCreate(newAccess);
      }

      return res.json({ message: "Akses staff berhasil diperbarui." });
    } catch (error) {
      console.error("❌ updateAccess Error:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server saat update akses." });
    }
  },

  // ========================================================
  // 7️⃣ DELETE STAFF (Hapus Permanen)
  // ========================================================
  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id; // Gunakan ID dari token

      // 1. Ambil Data Admin untuk dapatkan bisnis_id yang valid
      const admin = await User.findByPk(adminId);
      if (!admin || !admin.bisnis_id) {
         return res.status(404).json({ message: "Data admin/bisnis tidak valid." });
      }
      const bisnis_id = admin.bisnis_id;

      if (!id) return res.status(400).json({ message: "ID staff wajib diisi." });

      // 2. Cari Staff dengan bisnis_id yang valid
      const staff = await User.findOne({ 
          where: { id, bisnis_id, role: "staff" } 
      });

      if (!staff) return res.status(404).json({ message: "Staff tidak ditemukan atau bukan milik bisnis Anda." });

      // 3. Hapus Data
      // Hapus akses gudang dulu (jika database tidak cascade)
      await User_gudang_access.destroy({ where: { user_id: id } });
      
      // Hapus User Staff
      await staff.destroy();

      return res.json({ message: "Staff berhasil dihapus." });
    } catch (error) {
      console.error("❌ deleteStaff Error:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server saat menghapus staff." });
    }
  },
};