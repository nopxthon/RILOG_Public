// src/controllers/dashboardController.js
const { Item, ItemBatch, Transaction, Kategori, sequelize } = require('../models');
const { Op } = require('sequelize');

// ✅ HELPER: Format Tanggal ke YYYY-MM-DD sesuai Timezone WIB (Asia/Jakarta)
// Agar tidak geser hari karena perbedaan jam UTC
const formatDateWIB = (date) => {
    return new Date(date).toLocaleDateString('en-CA', { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const getDashboardStats = async (req, res) => {
    const { gudangId } = req.query;

    if (!gudangId) {
        return res.status(400).json({ msg: "Parameter gudangId wajib diisi" });
    }

    try {
        // --- 1. HITUNG STATISTIK KARTU (ALL TIME) ---
        // (Bagian ini tidak berubah karena tidak pakai grouping tanggal)

        // A. Total Stok Fisik
        const [stockResult] = await sequelize.query(
            `SELECT COALESCE(SUM(ib.quantity), 0) as total
             FROM item_batches ib
             JOIN items i ON ib.item_id = i.id
             WHERE i.gudang_id = :gudangId 
             AND ib.deleted_at IS NULL 
             AND i.deleted_at IS NULL`,
            { replacements: { gudangId } }
        );
        const totalSisaStok = parseInt(stockResult[0].total);

        // B. Total Stok Masuk (Murni Riwayat 'MASUK')
        const [inResult] = await sequelize.query(
            `SELECT COALESCE(SUM(t.quantity), 0) as total
             FROM transactions t
             JOIN item_batches ib ON t.item_batch_id = ib.id
             JOIN items i ON ib.item_id = i.id
             WHERE i.gudang_id = :gudangId 
             AND t.deleted_at IS NULL
             AND t.type = 'MASUK'`, 
            { replacements: { gudangId } }
        );
        const totalMasukMurni = parseInt(inResult[0].total);

        // C. Total Stok Keluar (Murni Riwayat 'KELUAR')
        const [outResult] = await sequelize.query(
            `SELECT COALESCE(SUM(t.quantity), 0) as total
             FROM transactions t
             JOIN item_batches ib ON t.item_batch_id = ib.id
             JOIN items i ON ib.item_id = i.id
             WHERE i.gudang_id = :gudangId 
             AND t.deleted_at IS NULL
             AND t.type = 'KELUAR'`, 
            { replacements: { gudangId } }
        );
        const totalKeluarMurni = parseInt(outResult[0].total);

        // D. Barang Terlaris
        let bestSellerName = "-";
        try {
            const [bestSellerResult] = await sequelize.query(
                `SELECT i.item_name, SUM(t.quantity) as total_sold
                 FROM transactions t
                 JOIN item_batches ib ON t.item_batch_id = ib.id
                 JOIN items i ON ib.item_id = i.id
                 WHERE i.gudang_id = :gudangId 
                 AND t.type = 'KELUAR' 
                 AND t.deleted_at IS NULL
                 GROUP BY i.id, i.item_name
                 ORDER BY total_sold DESC
                 LIMIT 1`,
                { replacements: { gudangId } }
            );
            if (bestSellerResult.length > 0) {
                bestSellerName = bestSellerResult[0].item_name;
            }
        } catch (err) { }


        // --- 2. DATA GRAFIK PERGERAKAN (7 HARI TERAKHIR - FIXED TIMEZONE) ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const itemWhere = { gudang_id: gudangId };

        // ✅ LOGIC QUERY DENGAN CONVERT_TZ
        // Kita gunakan Literal Query untuk kolom tanggal agar bisa memaksa konversi ke +07:00
        // Jika database Anda sudah WIB, CONVERT_TZ mungkin tidak perlu, tapi ini pengaman.
        // Syntax: CONVERT_TZ(column, from_tz, to_tz). '+00:00' asumsi DB UTC.
        
        // A. Grafik Masuk
        let incomingGraph = [];
        try {
            incomingGraph = await Transaction.findAll({
                attributes: [
                    // Ubah CreatedAt ke WIB dulu baru ambil DATE-nya
                    [sequelize.literal(`DATE(CONVERT_TZ(Transaction.created_at, '+00:00', '+07:00'))`), 'date'],
                    [sequelize.fn('SUM', sequelize.col('Transaction.quantity')), 'total']
                ],
                where: {
                    created_at: { [Op.gte]: sevenDaysAgo },
                    type: 'MASUK'
                },
                include: [{
                    model: ItemBatch,
                    as: 'itemBatch',
                    attributes: [],
                    required: true,
                    include: [{ model: Item, as: 'item', attributes: [], required: true, where: itemWhere }]
                }],
                group: [sequelize.literal(`DATE(CONVERT_TZ(Transaction.created_at, '+00:00', '+07:00'))`)],
                raw: true
            });
        } catch(e) {}

        // B. Grafik Keluar
        let outgoingGraph = [];
        try {
            outgoingGraph = await Transaction.findAll({
                attributes: [
                    // Ubah CreatedAt ke WIB dulu baru ambil DATE-nya
                    [sequelize.literal(`DATE(CONVERT_TZ(Transaction.created_at, '+00:00', '+07:00'))`), 'date'],
                    [sequelize.fn('SUM', sequelize.col('Transaction.quantity')), 'total'] 
                ],
                where: {
                    created_at: { [Op.gte]: sevenDaysAgo },
                    type: 'KELUAR'
                },
                include: [{
                    model: ItemBatch,
                    as: 'itemBatch', 
                    attributes: [],
                    required: true,
                    include: [{ model: Item, as: 'item', attributes: [], required: true, where: itemWhere }]
                }],
                group: [sequelize.literal(`DATE(CONVERT_TZ(Transaction.created_at, '+00:00', '+07:00'))`)],
                raw: true
            });
        } catch (err) {}

        // ✅ FIX LOOPING TANGGAL MENGGUNAKAN HELPER WIB
        const chartMovementData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            
            // GUNAKAN HELPER (Jangan pakai toISOString)
            const dateString = formatDateWIB(d); 
            
            const inData = incomingGraph.find(item => item.date === dateString);
            const outData = outgoingGraph.find(item => item.date === dateString);

            chartMovementData.push({
                // Format Tampilan di Grafik: "08 Des"
                date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                masuk: inData ? parseInt(inData.total) : 0,
                keluar: outData ? parseInt(outData.total) : 0
            });
        }

        // --- 3. DATA GRAFIK KATEGORI ---
        const categoryStats = await Kategori.findAll({
            attributes: [
                'category_name', 
                [sequelize.literal(`(
                    SELECT COALESCE(SUM(ib.quantity), 0) 
                    FROM item_batches AS ib 
                    JOIN items AS i ON ib.item_id = i.id 
                    WHERE i.category_id = Kategori.id 
                    AND i.gudang_id = ${gudangId} 
                    AND ib.deleted_at IS NULL
                )`), 'total_stok']
            ],
            include: [],
            group: ['Kategori.id', 'Kategori.category_name'],
            raw: true
        });

        const chartCategoryData = categoryStats
            .map(c => ({ name: c.category_name, value: parseInt(c.total_stok) || 0 }))
            .filter(c => c.value > 0);

        res.json({
            stats: {
                stokMasuk: totalMasukMurni,
                stokKeluar: totalKeluarMurni,
                totalStok: totalSisaStok,
                barangTerlaris: bestSellerName
            },
            chartMovement: chartMovementData,
            chartCategory: chartCategoryData
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ msg: error.message });
    }
};

module.exports = { getDashboardStats };