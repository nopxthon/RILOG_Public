// controllers/laporanController.js
const { Transaction, Item, ItemBatch, Kategori, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const getLaporanInventaris = async (req, res) => {
  const { gudangId, startDate, endDate, categoryId, itemIds } = req.query;

  if (!gudangId) return res.status(400).json({ msg: "Gudang ID wajib diisi" });

  try {
    // 1. Filter Tanggal
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // 2. Filter Item
    let itemIncludeWhere = { gudang_id: gudangId };
    if (categoryId && categoryId !== 'all') {
      itemIncludeWhere.category_id = categoryId;
    }
    if (itemIds) {
      const idsArray = itemIds.split(',').map(Number);
      itemIncludeWhere.id = { [Op.in]: idsArray };
    }

    // 3. Ambil Transaksi
    const transactions = await Transaction.findAll({
      where: { 
        gudang_id: gudangId,
        ...dateFilter
      },
      include: [
        { 
          model: ItemBatch, 
          as: 'itemBatch',
          required: true,
          include: [{
            model: Item,
            as: 'item',
            required: true,
            where: itemIncludeWhere, // Filter diterapkan di sini
            attributes: ['id', 'item_name', 'satuan'],
            include: [{ model: Kategori, as: 'kategori', attributes: ['category_name'] }]
          }]
        },
        { model: User, as: 'user', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // 4. Mapping Data (LOGIKA SNAPSHOT BARU)
    const laporan = transactions.map(t => {
      const item = t.itemBatch?.item;
      const kategori = item?.kategori?.category_name || '-';
      
      // ✅ AMBIL SNAPSHOT DARI DATABASE
      // Jika null (transaksi lama sebelum fitur ini), default ke 0
      const stokAkhir = t.stock_snapshot !== null ? t.stock_snapshot : 0; 
      
      let stokAwal = 0;

      // ✅ HITUNG MUNDUR UNTUK STOK AWAL
      if (t.type === 'MASUK') {
          // Kalau barang masuk, berarti tadinya lebih sedikit
          stokAwal = stokAkhir - t.quantity;
      } else {
          // Kalau barang keluar, berarti tadinya lebih banyak
          stokAwal = stokAkhir + t.quantity;
      }

      // Opsional: Cegah minus visual jika data lama tidak sinkron
      if (stokAwal < 0 && t.stock_snapshot === null) stokAwal = 0;

      return {
        id: t.id,
        kodeBarang: item ? `ITEM-${item.id}` : 'N/A',
        namaBarang: item?.item_name || 'Item Terhapus',
        kategori: kategori,
        tanggal: t.created_at || t.createdAt,
        status: t.type,
        jumlah: t.quantity,
        satuan: item?.satuan || 'Pcs',
        
        // Kirim hasil perhitungan
        stokAwal: stokAwal, 
        stokAkhir: stokAkhir
      };
    });

    res.json(laporan);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal memuat laporan" });
  }
};

// Tambahkan di controllers/laporanController.js

// controllers/laporanController.js (Update Bagian Ini Saja)

const getGrafikStok = async (req, res) => {
  const { gudangId, startDate, endDate, categoryId, itemIds } = req.query;

  if (!gudangId) return res.status(400).json({ msg: "Gudang ID wajib diisi" });

  try {
    // 1. Tentukan Range Tanggal
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 29); // Default 30 hari agar tren terlihat
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // 2. FILTER ITEM
    let whereItem = { gudang_id: gudangId };
    if (categoryId && categoryId !== 'all') whereItem.category_id = categoryId;
    if (itemIds) {
        const idsArray = itemIds.split(',').map(Number);
        whereItem.id = { [Op.in]: idsArray };
    };

    // const limitQuery = (itemIds || (categoryId && categoryId !== 'all')) ? null : 5;
    const limitQuery = null;
    
    // ✅ AMBIL MIN_STOK & MAX_STOK DARI DATABASE
    const targetItems = await Item.findAll({
      where: whereItem,
      limit: limitQuery, 
      attributes: ['id', 'item_name', 'min_stok', 'max_stok'] // Pastikan field ini ada
    });

    if (targetItems.length === 0) return res.json({ chartData: [], meta: {} });

    const targetIds = targetItems.map(i => i.id);
    const itemNames = targetItems.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.item_name }), {});

    // 3. Ambil Stok SAAT INI (Realtime)
    const currentStocks = await ItemBatch.findAll({
      where: { item_id: { [Op.in]: targetIds } },
      attributes: ['item_id', [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQty']],
      group: ['item_id']
    });

    let stockMap = {};
    targetIds.forEach(id => { stockMap[id] = 0; });
    currentStocks.forEach(b => {
      stockMap[b.item_id] = parseInt(b.getDataValue('totalQty'), 10) || 0;
    });

    // 4. Ambil Transaksi (Mundur)
    const transactions = await Transaction.findAll({
      where: {
        gudang_id: gudangId,
        created_at: { [Op.gte]: start }, 
      },
      include: [{
        model: ItemBatch,
        as: 'itemBatch',
        where: { item_id: { [Op.in]: targetIds } },
        attributes: ['item_id']
      }],
      order: [['created_at', 'DESC']] 
    });

    // 5. TIME MACHINE (Hitung Mundur)
    const chartData = [];
    for (let i = 0; i <= diffDays; i++) {
      const currentDate = new Date(end);
      currentDate.setDate(currentDate.getDate() - i);
      const dateLabel = currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const dailyData = { periode: dateLabel };
      targetIds.forEach(id => {
        dailyData[itemNames[id]] = stockMap[id];
      });

      const txToday = transactions.filter(t => {
        const tDate = new Date(t.created_at || t.createdAt);
        return tDate.toDateString() === currentDate.toDateString();
      });

      txToday.forEach(t => {
        const itemId = t.itemBatch.item_id;
        const qty = t.quantity;
        if (t.type === 'MASUK') stockMap[itemId] -= qty;
        else if (t.type === 'KELUAR') stockMap[itemId] += qty;
        if (stockMap[itemId] < 0) stockMap[itemId] = 0;
      });

      chartData.push(dailyData);
    }

    // 6. SIAPKAN METADATA (MIN/MAX & LAST ACTIVITY)
    const itemsMetadata = {};
    
    await Promise.all(targetItems.map(async (item) => {
        // Cari kapan terakhir laku (untuk Dead Stock)
        const lastSale = await Transaction.findOne({
            where: { type: 'KELUAR', gudang_id: gudangId },
            include: [{
                model: ItemBatch, as: 'itemBatch',
                where: { item_id: item.id },
                attributes: []
            }],
            order: [['created_at', 'DESC']],
            attributes: ['created_at']
        });

        // Cari tanggal pertama kali masuk (jika barang baru)
        const firstEntry = await ItemBatch.findOne({
             where: { item_id: item.id },
             order: [['created_at', 'ASC']],
             attributes: ['created_at']
        });

        itemsMetadata[item.item_name] = {
            // ✅ INI KUNCINYA: Ambil dari database, default 0 jika null
            min: item.min_stok || 0,
            max: item.max_stok || 0,
            
            // Tanggal aktivitas untuk logika 30 hari
            lastActivity: lastSale ? lastSale.createdAt : (firstEntry ? firstEntry.createdAt : new Date())
        };
    }));

    res.json({
        chartData: chartData.reverse(),
        meta: itemsMetadata
    });

  } catch (error) {
    console.error("Error Grafik:", error);
    res.status(500).json({ msg: "Gagal memuat data grafik" });
  }
};

module.exports = { 
  getLaporanInventaris,
  getGrafikStok 
};