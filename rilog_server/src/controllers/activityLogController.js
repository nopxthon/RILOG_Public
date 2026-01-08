const { ActivityLog, User, Gudang } = require('../models');

/**
 * @desc    Membuat log aktivitas baru
 * @access  Internal (dipanggil dari controller lain)
 */
const createActivityLog = async (data) => {
  try {
    const log = await ActivityLog.create({
      message: data.message,
      type: data.type,
      user_id: data.user_id || null,
      gudang_id: data.gudang_id || null,
      table_name: data.table_name || null,
      record_id: data.record_id || null,
    });
    return log;
  } catch (err) {
    console.error('Error creating activity log:', err.message);
    throw err;
  }
};

/**
 * @desc    Mengambil aktivitas terbaru berdasarkan gudang
 * @route   GET /api/activity-logs?gudangId=...&limit=...
 */
const getActivityLogs = async (req, res) => {
  const { gudangId, limit = 10 } = req.query;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!gudangId) {
    return res.status(400).json({ msg: 'Parameter gudangId wajib diisi.' });
  }

  try {
    // Validasi akses gudang
    if (userRole !== 'superadmin') {
      const user = await User.findByPk(userId);
      const gudang = await Gudang.findByPk(gudangId);

      if (!user || !gudang) {
        return res.status(403).json({ msg: 'Akses ditolak.' });
      }

      if (String(user.bisnis_id) !== String(gudang.bisnis_id)) {
        return res.status(403).json({ msg: 'Akses ditolak. Gudang ini bukan milik bisnis Anda.' });
      }
    }

    const logs = await ActivityLog.findAll({
      where: {
        gudang_id: gudangId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    // Format response
    const formattedLogs = logs.map(log => {
      const tanggal = new Date(log.created_at);
      const sekarang = new Date();
      const selisihHari = Math.floor((sekarang - tanggal) / (1000 * 60 * 60 * 24));

      let tanggalLabel = 'Hari ini';
      if (selisihHari === 1) tanggalLabel = 'Kemarin';
      else if (selisihHari > 1) tanggalLabel = `${selisihHari} hari yang lalu`;

      return {
        id: log.id,
        text: log.message,
        type: log.type,
        date: tanggalLabel,
        timestamp: log.created_at,
        user: log.user?.name || 'Sistem'
      };
    });

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching activity logs:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

/**
 * @desc    Helper untuk membuat log stok masuk
 */
const logStokMasuk = async (itemName, quantity, satuan, userId, transactionId, gudangId) => {
  const message = `Stok Masuk "${itemName}" sebanyak ${quantity} ${satuan}`;
  return createActivityLog({
    message,
    type: 'STOK MASUK',
    user_id: userId,
    gudang_id: gudangId,
    table_name: 'transactions',
    record_id: transactionId,
  });
};

/**
 * @desc    Helper untuk membuat log stok keluar
 */
const logStokKeluar = async (itemName, quantity, satuan, userId, transactionId, gudangId) => {
  const message = `Stok Keluar "${itemName}" sebanyak ${quantity} ${satuan}`;
  return createActivityLog({
    message,
    type: 'STOK KELUAR',
    user_id: userId,
    gudang_id: gudangId,
    table_name: 'transactions',
    record_id: transactionId,
  });
};

/**
 * @desc    Helper untuk membuat log tambah item
 */
const logTambahItem = async (itemName, userId, itemId, gudangId) => {
  const message = `Item baru ditambahkan: "${itemName}"`;
  return createActivityLog({
    message,
    type: 'TAMBAH ITEM',
    user_id: userId,
    gudang_id: gudangId,
    table_name: 'items',
    record_id: itemId
  });
};

/**
 * @desc    Helper untuk membuat log stok opname
 * ✅ DIPERBAIKI: Menangani kasus stok sama (selisih = 0)
 */
const logStokOpname = async (itemName, stokLama, stokBaru, selisih, satuan, userId, opnameId, gudangId) => {
  let message;
  
  // ✅ PRIORITAS 1: Cek jika selisih = 0 (stok sama/sesuai)
  if (selisih === 0) {
    message = `Stok Opname "${itemName}": ${stokLama} ${satuan} (stok sesuai)`;
  } 
  // ✅ PRIORITAS 2: Penambahan stok (selisih positif)
  else if (selisih > 0) {
    message = `Stok Opname "${itemName}": ${stokLama} → ${stokBaru} ${satuan} (penambahan ${Math.abs(selisih)} ${satuan})`;
  } 
  // ✅ PRIORITAS 3: Pengurangan stok (selisih negatif)
  else {
    message = `Stok Opname "${itemName}": ${stokLama} → ${stokBaru} ${satuan} (pengurangan ${Math.abs(selisih)} ${satuan})`;
  }
  
  return createActivityLog({
    message,
    type: 'OPNAME',
    user_id: userId,
    gudang_id: gudangId,
    table_name: 'stock_opname',
    record_id: opnameId,
  });
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  logStokMasuk,
  logStokKeluar,
  logTambahItem,
  logStokOpname
};