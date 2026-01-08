const { User, Gudang, Bisnis, Sub_plan, User_gudang_access, Item, ItemBatch, Transaction, sequelize } = require("../models");
const { Op } = require("sequelize");

// ======================================================================
// 🔹 GET: Ambil semua gudang
// ======================================================================
exports.getAllGudang = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { bisnis_id } = req.query;

    if (!userId) return res.status(401).json({ status: "error", message: "Unauthorized" });

    let gudangList = [];

    // --- LOGIC ADMIN ---
    if (role === "admin") {
      let whereGudang = {};
      const user = await User.findByPk(userId);
      
      // Admin Bisnis melihat gudang miliknya sendiri
      if (user.bisnis_id) {
          whereGudang.bisnis_id = user.bisnis_id;
      } else if (bisnis_id) {
          whereGudang.bisnis_id = bisnis_id;
      }

      gudangList = await Gudang.findAll({
        where: whereGudang,
        include: [
          {
            model: Bisnis,
            as: "bisnis",
            attributes: ["id", "nama_bisnis"],
          },
        ],
        // Urutkan: Yang Aktif di atas, lalu berdasarkan waktu buat
        order: [
             ['is_active', 'DESC'], 
             ["createdAt", "DESC"]
        ],
      });
    }
    // --- LOGIC STAFF ---
    else {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Gudang,
            as: "gudangs",
            attributes: ["id", "nama_gudang", "tipe_gudang", "alamat_gudang", "bisnis_id", "is_active"],
            include: [{ model: Bisnis, as: "bisnis", attributes: ["id", "nama_bisnis"] }],
          },
        ],
      });
      gudangList = user?.gudangs || [];
    }

    return res.status(200).json({
      status: "success",
      message: "Daftar gudang berhasil diambil",
      data: gudangList,
    });
  } catch (error) {
    console.error("🔥 ERROR GET /gudang:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil data gudang", detail: error.message });
  }
};

// ======================================================================
// 🔹 POST: Tambah Gudang (Default Non-Aktif)
// ======================================================================
exports.createGudang = async (req, res) => {
  try {
    const { nama_gudang, tipe_gudang, alamat_gudang } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;
    
    const user = await User.findByPk(userId);
    const bisnis_id = user.bisnis_id; 

    if (!nama_gudang || !tipe_gudang || !alamat_gudang) {
      return res.status(400).json({ status: "error", message: "Semua field wajib diisi" });
    }

    if (role !== "admin") {
      return res.status(403).json({ status: "error", message: "Hanya admin yang boleh membuat gudang" });
    }

    // 1. Cek Duplikat Nama
    const exists = await Gudang.findOne({ where: { nama_gudang, bisnis_id } });
    if (exists) {
      return res.status(400).json({ status: "error", message: `Gudang dengan nama "${nama_gudang}" sudah ada.` });
    }

    // 2. Buat Gudang (SELALU NON-AKTIF DI AWAL)
    // User harus mengaktifkan manual di menu list gudang agar kita bisa cek limit saat itu.
    const newGudang = await Gudang.create({
      nama_gudang,
      tipe_gudang,
      alamat_gudang,
      bisnis_id,
      is_active: false // 🔴 Default False
    });

    return res.status(201).json({
      status: "success",
      message: "Gudang berhasil dibuat (Status: Non-Aktif). Silakan aktifkan manual (klik centang) jika ingin digunakan.",
      data: newGudang,
    });

  } catch (error) {
    return res.status(500).json({ status: "error", message: "Gagal menambah gudang", detail: error.message });
  }
};

// ======================================================================
// 🔹 PATCH: Toggle Status (Aktivasi dengan Cek Limit Paket)
// ======================================================================
exports.toggleStatusGudang = async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body; // true = mau aktifkan, false = mau matikan
      const userId = req.user.id;
      
      // 1. Ambil Data User + Paket Langganan (SubPlan)
      const user = await User.findByPk(userId, {
          include: [{ 
              model: Bisnis, 
              as: 'bisnis',
              include: [{ model: Sub_plan, as: 'subPlan' }] // Pastikan nama model 'Sub_plan' sesuai import
          }]
      });
  
      if (!user.bisnis) return res.status(404).json({ msg: "Bisnis tidak ditemukan" });

      const gudang = await Gudang.findByPk(id);
      if (!gudang) return res.status(404).json({ status: "error", message: "Gudang tidak ditemukan" });
      
      // Validasi Kepemilikan
      if (String(gudang.bisnis_id) !== String(user.bisnis_id)) {
          return res.status(403).json({ status: "error", message: "Akses Ditolak" });
      }
  
      // --- LOGIKA LIMITASI ---
  
      // Jika User ingin MENGAKTIFKAN (true)
      if (is_active === true) {
         // Cek jika sudah aktif (idempotent)
         if (gudang.is_active) return res.json({ status: "success", message: "Gudang sudah aktif" });

         // Ambil Limit dari Paket (Default 1 jika tidak ada paket)
         const currentPlan = user.bisnis.subPlan;
         const LIMIT_GUDANG = currentPlan ? currentPlan.limit_gudang : 1;

         // Hitung Gudang yang SEDANG AKTIF saat ini
         const activeCount = await Gudang.count({ 
           where: { 
             bisnis_id: user.bisnis_id, 
             is_active: true 
           } 
         });
  
         // 🔥 CEK LIMIT 🔥
         if (activeCount >= LIMIT_GUDANG) {
           return res.status(403).json({ 
             status: "error",
             // Pesan ini akan muncul di SweetAlert Kuning di frontend
             message: `Gagal Mengaktifkan. Kuota Gudang Aktif Penuh (${activeCount}/${LIMIT_GUDANG}). Upgrade paket untuk menambah lokasi.` 
           });
         }
      }
  
      // Update status
      await gudang.update({ is_active });
  
      return res.json({ 
          status: "success", 
          message: `Gudang berhasil ${is_active ? 'diaktifkan' : 'dinonaktifkan'}` 
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: "Terjadi kesalahan server saat update status" });
    }
  };

// ======================================================================
// 🔹 PUT: Update Data Gudang (Nama/Alamat)
// ======================================================================
exports.updateGudang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_gudang, tipe_gudang, alamat_gudang } = req.body;
    const userId = req.user?.id;

    if (req.user?.role !== "admin") {
      return res.status(403).json({ status: "error", message: "Hanya admin" });
    }

    const gudang = await Gudang.findByPk(id);
    if (!gudang) return res.status(404).json({ status: "error", message: "Gudang tidak ditemukan" });

    // Validasi kepemilikan
    const user = await User.findByPk(userId);
    if(String(gudang.bisnis_id) !== String(user.bisnis_id)) {
         return res.status(403).json({ status: "error", message: "Akses ditolak" });
    }

    await gudang.update({ nama_gudang, tipe_gudang, alamat_gudang });

    return res.status(200).json({ status: "success", message: "Gudang berhasil diperbarui", data: gudang });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Gagal update gudang", detail: error.message });
  }
};

// ======================================================================
// 🔹 DELETE Gudang (Hapus Permanen)
// ======================================================================
exports.deleteGudang = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user?.id; 
    
    if (req.user?.role !== "admin") {
      await t.rollback();
      return res.status(403).json({ status: "error", message: "Hanya admin" });
    }

    const gudang = await Gudang.findByPk(id, { transaction: t });
    if (!gudang) {
      await t.rollback();
      return res.status(404).json({ status: "error", message: "Gudang tidak ditemukan" });
    }

    const admin = await User.findByPk(userId, { transaction: t });
    if (!admin || String(gudang.bisnis_id) !== String(admin.bisnis_id)) {
      await t.rollback();
      return res.status(403).json({ status: "error", message: "Tidak punya akses ke gudang ini" });
    }

    // CASCADE DELETE
    await User_gudang_access.destroy({ where: { gudang_id: id }, transaction: t });
    await Transaction.destroy({ where: { gudang_id: id }, transaction: t });

    const items = await Item.findAll({ where: { gudang_id: id }, attributes: ['id'], transaction: t });
    const itemIds = items.map(i => i.id);

    if (itemIds.length > 0) {
      await ItemBatch.destroy({ where: { item_id: { [Op.in]: itemIds } }, transaction: t });
      await Item.destroy({ where: { gudang_id: id }, transaction: t });
    }

    await gudang.destroy({ transaction: t });
    await t.commit();

    return res.status(200).json({ status: "success", message: `Gudang "${gudang.nama_gudang}" berhasil dihapus.` });

  } catch (error) {
    await t.rollback();
    console.error("Gagal Hapus Gudang:", error);
    return res.status(500).json({ status: "error", message: "Gagal menghapus gudang", detail: error.message });
  }
};