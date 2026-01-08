const { runGenerateNotifikasi } = require("./notifikasiController");
const { logStokMasuk, logStokKeluar } = require("./activityLogController");

const { 
  Item, 
  Kategori, 
  ItemBatch, 
  Transaction, 
  User, 
  Gudang, 
  sequelize 
} = require('../models'); 
const { Op } = require('sequelize');

// --- FUNGSI BANTUAN: Hitung Sisa Hari ---
const hitungSisaHari = (tanggalKadaluarsa) => {
  if (!tanggalKadaluarsa) return 0;
  const sekarang = new Date();
  const kadaluarsa = new Date(tanggalKadaluarsa);
  const selisihMs = kadaluarsa.getTime() - sekarang.getTime();
  const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24));
  return selisihHari;
};

const validateGudangAccess = async (userId, role, gudangId, checkIsActive = false) => {
  // 1. Bypass untuk Superadmin
  if (role === 'superadmin') {
    return true;
  }

  const admin = await User.findByPk(userId);
  const gudang = await Gudang.findByPk(gudangId);

  // 2. Cek Ketersediaan Data
  if (!admin) {
    console.log(`❌ ValidateAccess: User ${userId} tidak ditemukan.`);
    return false;
  }
  if (!gudang) {
    console.log(`❌ ValidateAccess: Gudang ${gudangId} tidak ditemukan.`);
    return false;
  }

  // 3. Cek Kesesuaian Bisnis ID (Security Check)
  if (String(admin.bisnis_id) !== String(gudang.bisnis_id)) {
    console.log(`⛔ AKSES DITOLAK: User Bisnis ID (${admin.bisnis_id}) != Gudang Bisnis ID (${gudang.bisnis_id})`);
    return false;
  }

  // 4. Cek Status Aktif Gudang (Penting untuk Transaksi Stok)
  // Logic ini berasal dari potongan kode bagian atas (Version A)
  if (checkIsActive && !gudang.is_active) {
    console.log(`⛔ AKSES DITOLAK: Gudang ${gudang.nama_gudang} sedang Non-Aktif.`);
    throw new Error("Gudang Non-Aktif. Transaksi tidak dapat dilakukan.");
  }

  return true;
};

// ==========================================
// 1. GET DATA (Laporan & Monitoring) - Read Only (Aman)
// ==========================================

const getDataInventori = async (req, res) => {
  const { gudangId } = req.query;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!gudangId) return res.status(400).json({ msg: 'Parameter query gudangId wajib diisi.' });

  try {
    const isAllowed = await validateGudangAccess(userId, userRole, gudangId);
    if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak.' });

    const items = await Item.findAll({
      where: { gudang_id: gudangId },
      include: [
        { model: Kategori, as: 'kategori', attributes: ['id','category_name'] },
        { model: ItemBatch, as: 'batches', attributes: ['id','quantity', 'expiry_date'], required: false }
      ],
      attributes: ['id', 'item_name', 'satuan', 'min_stok', 'max_stok', 'category_id'],
      order: [['item_name', 'ASC']]
    });

    const dataInventori = items.map(item => {
      const stokTersedia = item.batches.reduce((total, batch) => total + batch.quantity, 0);

      const now = new Date();
      let soonestExpiryDate = null;
      let sisaHari = 0;
      
      const validExpiryDates = item.batches
        .map(batch => batch.expiry_date ? new Date(batch.expiry_date) : null)
        .filter(date => date && date > now);

      if (validExpiryDates.length > 0) {
        soonestExpiryDate = new Date(Math.min.apply(null, validExpiryDates));
        sisaHari = hitungSisaHari(soonestExpiryDate);
      }

      const min = item.min_stok;
      const max = item.max_stok;
      let statusStok = 'Aman';
      if (stokTersedia <= 0) statusStok = 'Habis';
      else if (stokTersedia <= min) statusStok = 'Menipis';
      else if (stokTersedia > max) statusStok = 'Berlebih';

      return {
        id: item.id,
        item_name: item.item_name,
        namaBarang: item.item_name,
        category_id: item.category_id,
        namaKategori: item.kategori?.category_name || 'Tanpa Kategori',
        satuan: item.satuan,
        stokTersedia: stokTersedia,
        maxBarang: max,
        minBarang: min,
        statusStok: statusStok,
        tanggalKadaluarsa: soonestExpiryDate ? soonestExpiryDate.toISOString().split('T')[0] : 'N/A',
        sisaHariKadaluarsa: sisaHari
      };
    });

    res.json(dataInventori);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getHistoriTransaksi = async (req, res) => {
  const { tipe, gudangId } = req.query; 
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!tipe || !gudangId) return res.status(400).json({ msg: 'Parameter query tipe dan gudangId wajib diisi.' });
  if (tipe !== 'MASUK' && tipe !== 'KELUAR') return res.status(400).json({ msg: 'Tipe harus "MASUK" atau "KELUAR".' });

  try {
    const isAllowed = await validateGudangAccess(userId, userRole, gudangId);
    if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak.' });

    const transactions = await Transaction.findAll({
      where: { type: tipe, gudang_id: gudangId }, 
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { 
          model: ItemBatch, 
          as: 'itemBatch', 
          attributes: ['id', 'expiry_date', 'item_id'], 
          include: [{
            model: Item,
            as: 'item',
            attributes: ['item_name', 'satuan', 'min_stok', 'max_stok'],
            required: false 
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const getItemName = (t) => t.itemBatch?.item?.item_name || 'Item Terhapus';
    const getItemSatuan = (t) => t.itemBatch?.item?.satuan || '-';
    const getExpiry = (t) => t.itemBatch?.expiry_date || null;
    const getItemId = (t) => t.itemBatch?.item_id || t.itemBatch?.item?.id || null;

    let responseData;
    if (tipe === 'MASUK') {
      responseData = transactions.map(t => ({
        id: t.id,
        item_id: getItemId(t),
        nama: getItemName(t), 
        tanggal: t.created_at || t.createdAt, 
        qty: t.quantity,
        pemasok: t.supplier || t.notes || '-', 
        diterimaOleh: t.pic || t.user?.name || 'Sistem',
        tanggalKadaluarsa: getExpiry(t),
        satuan: getItemSatuan(t),
        minStok: 0,
        maxStok: 0,
        sisaHariKadaluarsa: hitungSisaHari(getExpiry(t))
      }));
    } else { 
      responseData = transactions.map(t => ({
        id: t.id,
        item_id: getItemId(t),
        namaBarang: getItemName(t),
        tanggalKeluar: t.created_at || t.createdAt,
        stokKeluar: t.quantity,
        satuan: getItemSatuan(t),
        dikeluarkanOleh: t.pic || t.user?.name || 'Sistem',
        customer: t.customer || '-',
        notes: t.notes || '-'
      }));
    }

    res.json(responseData);
  } catch (err) {
    console.error("Error getHistoriTransaksi:", err.message);
    res.status(500).send('Server Error');
  }
};

const getKadaluarsa = async (req, res) => {
  const { gudangId } = req.query;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!gudangId) return res.status(400).json({ msg: 'Parameter query gudangId wajib diisi.' });

  try {
    const isAllowed = await validateGudangAccess(userId, userRole, gudangId);
    if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak.' });

    const batches = await ItemBatch.findAll({
      where: {
        quantity: { [Op.gt]: 0 },
        expiry_date: { [Op.ne]: null }
      },
      include: [
        {
          model: Item,
          as: 'item',
          where: { gudang_id: gudangId },
          attributes: ['item_name', 'satuan'],
          include: [{ model: Kategori, as: 'kategori', attributes: ['category_name'] }]
        }
      ],
      order: [['expiry_date', 'ASC']]
    });

    const dataKadaluarsa = batches.map(batch => {
      const sisaHari = hitungSisaHari(batch.expiry_date);
      return {
        id: batch.id,
        namaBarang: batch.item?.item_name || 'N/A',
        klasifikasi: batch.item?.kategori?.category_name || 'Tanpa Kategori',
        stok: batch.quantity,
        satuan: batch.item?.satuan || 'N/A',
        tanggalKadaluarsa: batch.expiry_date,
        sisaHariKadaluarsa: sisaHari
      };
    }).filter(data => data !== null);

    res.json(dataKadaluarsa);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ==========================================
// 2. TRANSACTION (Stok Masuk & Keluar) - 🔥 PERLU CEK STATUS GUDANG 🔥
// ==========================================

const handleStokMasuk = async (req, res) => {
  console.log("📥 DEBUG BODY:", req.body);
  
  const { itemId, gudangId, quantity, expiryDate, supplierName, date, pic } = req.body;
  const userId = req.user?.id; 
  const userRole = req.user?.role;

  if (!itemId || !gudangId || !quantity || quantity <= 0) {
    return res.status(400).json({ msg: 'Item ID, Gudang ID, dan Kuantitas (positif) wajib diisi.' });
  }
  
  try {
    // 🛡️ SECURITY CHECK: checkIsActive = true
    try {
        const isAllowed = await validateGudangAccess(userId, userRole, gudangId, true);
        if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak. Gudang ini bukan milik bisnis Anda.' });
    } catch (e) {
        // Tangkap Error "Gudang Non-Aktif"
        return res.status(403).json({ msg: e.message }); 
    }

    const result = await sequelize.transaction(async (t) => {
      const item = await Item.findOne({ where: { id: itemId, gudang_id: gudangId } }, { transaction: t });
      if (!item) throw new Error('Item tidak terdaftar di gudang ini.');

      let whereClause = { item_id: itemId };
      if (expiryDate) {
        whereClause = {
          [Op.and]: [
            { item_id: itemId },
            sequelize.where(sequelize.fn('DATE', sequelize.col('expiry_date')), '=', expiryDate)
          ]
        };
      } else {
        whereClause.expiry_date = { [Op.is]: null };
      }

      let batch = await ItemBatch.findOne({
        where: whereClause,
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (batch) {
        batch.quantity += Number(quantity);
        await batch.save({ transaction: t });
      } else {
        batch = await ItemBatch.create({
          item_id: itemId,
          quantity: quantity,
          expiry_date: expiryDate || null,
        }, { transaction: t });
      }

      const totalStockSnapshot = await ItemBatch.sum('quantity', {
        where: { item_id: itemId },
        include: [{
            model: Item,
            as: 'item',
            where: { gudang_id: gudangId }
        }],
        transaction: t
      });
      
      const transactionDate = date ? new Date(date) : new Date();

      const newTransaction = await Transaction.create({
        gudang_id: gudangId,
        user_id: userId,
        type: 'MASUK',
        item_batch_id: batch.id,
        quantity: quantity,
        supplier: supplierName || null, 
        pic: pic || null,
        notes: null,
        stock_snapshot: totalStockSnapshot || 0,
        createdAt: transactionDate 
      }, { transaction: t });

      // 📝 BUAT ACTIVITY LOG - ✅ FIXED: Gunakan gudangId, bukan transactionDate
      await logStokMasuk(
        item.item_name,
        quantity,
        item.satuan,
        userId,
        newTransaction.id,
        gudangId  // ✅ PERBAIKAN: Gunakan gudangId (integer), bukan transactionDate (Date)
      );
      
      return { batch, transaction: newTransaction, item };
    });

    // 🔔 AUTO GENERATE NOTIFIKASI
    await runGenerateNotifikasi(req.user);

    res.status(201).json({ 
      msg: 'Stok masuk berhasil dicatat', 
      batch: result.batch 
    });

  } catch (err) {
    console.error('❌ handleStokMasuk error:', err.message);
    
    if (err.message.includes('Item')) {
      return res.status(404).json({ msg: err.message });
    }
    
    return res.status(500).json({ 
      msg: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

const handleStokKeluar = async (req, res) => {
  const { itemId, gudangId, quantity, notes, customer, date, pic } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!itemId || !gudangId || !quantity || quantity <= 0) {
    return res.status(400).json({ msg: 'Item ID, Gudang ID, dan Kuantitas (positif) wajib diisi.' });
  }

  try {
    // 🛡️ SECURITY CHECK: checkIsActive = true
    try {
        const isAllowed = await validateGudangAccess(userId, userRole, gudangId, true);
        if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak. Gudang ini bukan milik bisnis Anda.' });
    } catch (e) {
        return res.status(403).json({ msg: e.message }); 
    }

    let sisaQuantityKeluar = Number(quantity);
    const transactionDate = date ? new Date(date) : new Date();

    const result = await sequelize.transaction(async (t) => {
      const item = await Item.findOne({ where: { id: itemId, gudang_id: gudangId } }, { transaction: t });
      if (!item) throw new Error('Item tidak terdaftar di gudang ini.');
      
      const batches = await ItemBatch.findAll({
        where: {
          item_id: itemId,
          quantity: { [Op.gt]: 0 }
        },
        order: [
          [sequelize.fn('ISNULL', sequelize.col('expiry_date')), 'ASC'], 
          ['expiry_date', 'ASC']
        ],
        lock: t.LOCK.UPDATE
      }, { transaction: t });

      if (batches.length === 0) throw new Error('Stok barang di gudang ini sudah habis.');

      const transactionRecords = [];

      for (const batch of batches) {
        if (sisaQuantityKeluar <= 0) break; 
        
        const kuantitasDiambilDariBatchIni = Math.min(batch.quantity, sisaQuantityKeluar);

        batch.quantity -= kuantitasDiambilDariBatchIni;
        sisaQuantityKeluar -= kuantitasDiambilDariBatchIni;
        await batch.save({ transaction: t });

        const totalStockSnapshot = await ItemBatch.sum('quantity', {
            where: { item_id: itemId },
            include: [{
                model: Item,
                as: 'item',
                where: { gudang_id: gudangId }
            }],
            transaction: t
        });

        const newTransaction = await Transaction.create({
          gudang_id: gudangId,
          user_id: userId,
          type: 'KELUAR',
          item_batch_id: batch.id,
          quantity: kuantitasDiambilDariBatchIni,
          notes: notes || null,
          customer: customer || null,
          pic: pic || null,
          stock_snapshot: totalStockSnapshot || 0,
          createdAt: transactionDate 
        }, { transaction: t });

        transactionRecords.push(newTransaction);
      }

      if (sisaQuantityKeluar > 0) throw new Error(`Stok tidak mencukupi. Sisa permintaan: ${sisaQuantityKeluar}`);

      // 📝 BUAT ACTIVITY LOG - ✅ FIXED: Gunakan gudangId, bukan transactionDate
      await logStokKeluar(
        item.item_name,
        quantity,
        item.satuan,
        userId,
        transactionRecords[0]?.id,
        gudangId  // ✅ PERBAIKAN: Gunakan gudangId (integer), bukan transactionDate (Date)
      );

      return { msg: 'Stok keluar berhasil dicatat', item };
    });

    // 🔔 AUTO GENERATE NOTIFIKASI
    await runGenerateNotifikasi(req.user);

    res.status(200).json(result);

  } catch (err) {
    console.error(err.message);
    if (err.message.includes('Stok') || err.message.includes('Item')) return res.status(400).json({ msg: err.message });
    res.status(500).send('Server Error');
  }
};

const updateStokMasuk = async (req, res) => {
  const { id } = req.params; // ID Transaksi
  const { supplierName, pic, date, expiryDate, gudangId } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    // 1. Validasi Akses
    try {
        const isAllowed = await validateGudangAccess(userId, userRole, gudangId, true);
        if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak.' });
    } catch (e) {
        return res.status(403).json({ msg: e.message }); 
    }

    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ msg: "Transaksi tidak ditemukan." });
    if (transaction.type !== 'MASUK') return res.status(400).json({ msg: "Bukan transaksi stok masuk." });

    await sequelize.transaction(async (t) => {
        // Update Data Transaksi
        transaction.supplier = supplierName;
        transaction.pic = pic;
        transaction.createdAt = date ? new Date(date) : transaction.createdAt;
        await transaction.save({ transaction: t });

        // Update Data Batch (Expiry Date) jika ada perubahan
        if (expiryDate && transaction.item_batch_id) {
            const batch = await ItemBatch.findByPk(transaction.item_batch_id, { transaction: t });
            if (batch) {
                batch.expiry_date = expiryDate;
                await batch.save({ transaction: t });
            }
        }
    });

    res.json({ msg: "Data Stok Masuk berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gagal memperbarui data." });
  }
};

// ✅ UPDATE STOK KELUAR (Hanya Info: Notes, Customer, PIC, Tanggal)
const updateStokKeluar = async (req, res) => {
  const { id } = req.params; // ID Transaksi
  const { notes, customer, pic, date, gudangId } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    // 1. Validasi Akses
    try {
        const isAllowed = await validateGudangAccess(userId, userRole, gudangId, true);
        if (!isAllowed) return res.status(403).json({ msg: 'Akses Ditolak.' });
    } catch (e) {
        return res.status(403).json({ msg: e.message }); 
    }

    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ msg: "Transaksi tidak ditemukan." });
    if (transaction.type !== 'KELUAR') return res.status(400).json({ msg: "Bukan transaksi stok keluar." });

    // Update Data Transaksi
    transaction.notes = notes;
    transaction.customer = customer;
    transaction.pic = pic;
    transaction.createdAt = date ? new Date(date) : transaction.createdAt;
    
    await transaction.save();

    res.json({ msg: "Data Stok Keluar berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gagal memperbarui data." });
  }
};

module.exports = {
  getDataInventori,
  getHistoriTransaksi,
  getKadaluarsa,
  handleStokMasuk,
  handleStokKeluar,
  updateStokKeluar,
  updateStokMasuk,
};