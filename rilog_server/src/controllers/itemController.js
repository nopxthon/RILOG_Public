const { Item, Kategori, Gudang, Bisnis, User, ItemBatch, Transaction, User_gudang_access, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- HELPER: Validasi Akses & Status Gudang ---
// Mengembalikan objek gudang jika valid, atau melempar error jika tidak valid/akses ditolak
const validateGudangAndAccess = async (userId, gudangId, requireActive = false) => {
  const user = await User.findByPk(userId);
  const gudang = await Gudang.findByPk(gudangId);

  if (!user || !gudang) {
    throw { status: 404, msg: 'Data User atau Gudang tidak ditemukan.' };
  }

  // 1. Cek Kepemilikan (Bisnis ID harus sama)
  if (String(user.bisnis_id) !== String(gudang.bisnis_id)) {
    throw { status: 403, msg: 'Akses Ditolak. Gudang ini bukan milik bisnis Anda.' };
  }

  // 2. 🔥 CEK STATUS AKTIF (Hard Lock) 🔥
  if (requireActive && !gudang.is_active) {
    throw { status: 403, msg: 'Gudang Non-Aktif. Anda tidak dapat menambah atau mengubah data barang di gudang ini.' };
  }

  // 3. 🔥 CEK AKSES SPESIFIK STAFF (BARU) 🔥
  // Jika role adalah 'staff', pastikan dia punya akses ke gudang ini di tabel User_gudang_access
  if (user.role === 'staff') {
      const access = await User_gudang_access.findOne({
          where: { 
              user_id: userId, 
              gudang_id: gudangId 
          }
      });

      if (!access) {
          throw { status: 403, msg: 'Akses Ditolak. Anda tidak memiliki izin akses ke gudang ini.' };
      }
      
      // Opsional: Cek status akses di tabel pivot jika ada kolom status (misal 'suspended')
      if (access.status !== 'aktif') {
           throw { status: 403, msg: 'Akses Anda ke gudang ini telah dibekukan.' };
      }
  }

  return gudang;
};

/**
 * @desc    Membuat Item baru (Hanya di Gudang Milik Sendiri & AKTIF)
 * @route   POST /api/item
 */
const createItem = async (req, res) => {
  const { item_name, category_id, gudang_id, satuan, min_stok, max_stok } = req.body;
  const userId = req.user?.id; 

  if (!item_name || !category_id || !gudang_id || !satuan) {
    return res.status(400).json({ msg: 'Semua field wajib diisi.' });
  }

  try {
    // 🛡️ SECURITY & STATUS CHECK (requireActive = true)
    await validateGudangAndAccess(userId, gudang_id, true);

    // Cek Duplikasi Nama di Gudang yang sama
    const existingItem = await Item.findOne({
      where: { item_name: item_name, gudang_id: gudang_id }
    });

    if (existingItem) {
      return res.status(400).json({ msg: `Barang '${item_name}' sudah terdaftar di gudang ini.` });
    }

    const newItem = await Item.create({
      item_name,
      category_id,
      gudang_id,
      satuan,
      min_stok: min_stok || 0,
      max_stok: max_stok || 0,
      user_id: userId
    });

    res.status(201).json({ msg: "Item berhasil ditambahkan", data: newItem });

  } catch (err) {
    if (err.status) return res.status(err.status).json({ msg: err.msg });
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ msg: 'Kategori ID atau Gudang ID tidak valid.' });
    }
    console.error(err.message);
    res.status(500).json({ msg: 'Terjadi kesalahan server' });
  }
};

/**
 * @desc    Mengambil Item (Read Only - Tetap Bisa Diakses walau Gudang Mati)
 * @route   GET /api/item?gudangId=1
 */
const getItemsByGudang = async (req, res) => {
  const { gudangId } = req.query;
  const userId = req.user?.id; 
  
  if (!gudangId) return res.status(400).json({ msg: 'Query gudangId wajib diisi.' });

  try {
    // 🛡️ SECURITY CHECK (requireActive = false, karena hanya GET)
    await validateGudangAndAccess(userId, gudangId, false);

    const items = await Item.findAll({
      where: { gudang_id: gudangId },
      include: [{ model: Kategori, as: 'kategori', attributes: ['id','category_name'] }],
      attributes: ['id', 'item_name', 'satuan', 'category_id', 'min_stok', 'max_stok', 'gudang_id'], 
      order: [['item_name', 'ASC']]
    });
    
    res.json(items);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ msg: err.msg });
    console.error(err.message);
    res.status(500).json({ msg: 'Gagal mengambil data item.' });
  }
};

/**
 * @desc    Update Item (Hanya Barang Milik Sendiri & Gudang AKTIF)
 * @route   PUT /api/item/:id
 */
const updateItem = async (req, res) => {
  const { item_name, category_id, satuan, min_stok, max_stok } = req.body;
  const userId = req.user?.id;

  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item tidak ditemukan.' });

    // 🛡️ SECURITY & STATUS CHECK (requireActive = true)
    await validateGudangAndAccess(userId, item.gudang_id, true);
    
    await item.update({
      item_name,
      category_id,
      satuan,
      min_stok,
      max_stok
    });

    res.json({ msg: "Item berhasil diperbarui", data: item });

  } catch (err) {
    if (err.status) return res.status(err.status).json({ msg: err.msg });
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ msg: 'Kategori ID tidak valid.' });
    }
    res.status(500).json({ msg: err.message });
  }
};

/**
 * @desc    Delete Item (Hanya Barang Milik Sendiri & Gudang AKTIF)
 * @route   DELETE /api/item/:id
 */
const deleteItem = async (req, res) => {
  const userId = req.user?.id;

  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item tidak ditemukan.' });

    // 🛡️ SECURITY & STATUS CHECK (requireActive = true)
    await validateGudangAndAccess(userId, item.gudang_id, true);

    // Transaction untuk hapus batch & item secara bersih
    await sequelize.transaction(async (t) => {
      // 1. Hapus Stok Batch
      await ItemBatch.destroy({ where: { item_id: item.id }, transaction: t });
      
      // 2. Hapus Item Master
      await item.destroy({ transaction: t });
    });

    res.json({ msg: 'Item dan data stok terkait berhasil dihapus.' });
    
  } catch (err) {
    if (err.status) return res.status(err.status).json({ msg: err.msg });
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  createItem,
  getItemsByGudang,
  updateItem,
  deleteItem
};