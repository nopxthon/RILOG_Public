const { Opname, Item, User, ItemBatch, Gudang, sequelize } = require('../models'); 
const { Op } = require('sequelize');
const { logStokOpname } = require('./activityLogController'); // ✅ IMPORT INI

const formatDate = (date) => {
    if (!date) return null;
    try {
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        return 'N/A';
    }
};

// --- POST: SIMPAN STOK OPNAME (Modifikasi Data) ---
const createOpnameBatch = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { 
            item_id, 
            batch_id,
            gudang_id,
            date, 
            system_stock, 
            physical_stock, 
            notes, 
        } = req.body;

        const user_id = req.user ? req.user.id : null; 
        
        // 1. Validasi
        if (!item_id || !batch_id || !gudang_id || physical_stock === undefined || date === undefined) {
            await transaction.rollback();
            return res.status(400).json({ msg: "Data tidak lengkap (Item, Batch, Gudang, Stok Fisik, Tanggal)." });
        }

        // 🔥 2. Validasi Status Gudang (Read-Only Check) 🔥
        const gudang = await Gudang.findByPk(gudang_id);
        if (!gudang) {
            await transaction.rollback();
            return res.status(404).json({ msg: "Gudang tidak ditemukan." });
        }

        if (!gudang.is_active) {
            await transaction.rollback();
            return res.status(403).json({ 
                msg: "Gudang Non-Aktif. Stok Opname tidak dapat dilakukan." 
            });
        }
        
        // ✅ 2. Ambil data item untuk logging (SEBELUM create opname)
        const item = await Item.findByPk(item_id, { transaction });
        if (!item) {
            await transaction.rollback();
            return res.status(404).json({ msg: "Item tidak ditemukan." });
        }

        const itemName = item.item_name || 'Unknown Item';
        const satuan = item.satuan || 'Unit';
        const selisih = physical_stock - system_stock;
        
        // 3. Simpan Histori ke tabel Opname
        const newOpname = await Opname.create({
            user_id: user_id, 
            item_id: item_id,
            item_batch_id: batch_id,
            gudang_id: gudang_id,
            system_stock: system_stock,
            actual_stok: physical_stock,
            notes: notes,
            opname_date: date,
        }, { transaction });

        // 4. Update Stok di tabel ItemBatch
        const [updatedRows] = await ItemBatch.update(
            { quantity: physical_stock },
            { where: { id: batch_id }, transaction }
        );

        if (updatedRows === 0) {
            await transaction.rollback();
            return res.status(404).json({ msg: "Batch tidak ditemukan atau stok gagal diupdate." });
        }
        
        // ✅ 5. TAMBAHKAN ACTIVITY LOG (SEBELUM COMMIT)
        await logStokOpname(
            itemName,          // Nama item
            system_stock,      // Stok sistem (lama)
            physical_stock,    // Stok fisik (baru)
            selisih,           // Selisih
            satuan,            // Satuan
            user_id,           // User ID
            newOpname.id,      // Opname ID
            gudang_id          // Gudang ID
        );
        
        await transaction.commit();

        res.status(201).json({ 
            msg: "Stok Opname berhasil disimpan.", 
            opname: newOpname
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating opname:', error);
        res.status(500).json({ msg: "Gagal menyimpan stok opname.", error: error.message });
    }
};

// --- GET: AMBIL HISTORI STOK OPNAME ---
const getOpnameHistory = async (req, res) => {
  const { gudangId } = req.query;
  
  if (!gudangId) {
    return res.status(400).json({ msg: 'Parameter query gudangId wajib diisi.' });
  }

  try {
    const opnames = await Opname.findAll({
      where: { 
          gudang_id: gudangId
      },
      include: [
        { 
          model: Gudang,
          as: 'gudang',
          attributes: ['id', 'nama_gudang']
        },
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name'] 
        },
        { 
          model: Item,
          as: 'item',
          attributes: ['id', 'item_name', 'satuan'],
        },
        {
          model: ItemBatch, 
          as: 'itemBatch', 
          attributes: ['id', 'expiry_date'],
        }
      ],
      order: [['opname_date', 'DESC']]
    });

    const getItemName = (o) => o.item?.item_name || 'Item Terhapus';
    const getItemSatuan = (o) => o.item?.satuan || 'Unit';
    const getPetugas = (o) => o.user?.name || 'Sistem';
    const getGudangName = (o) => o.gudang?.nama_gudang || 'Gudang N/A';
    
    const responseData = opnames.map(o => {
        const systemStock = o.system_stock || 0;
        const physicalStock = o.actual_stok || 0;
        const diff = physicalStock - systemStock;

        return {
            id: String(o.id),
            nama: getItemName(o),
            gudang: getGudangName(o),
            tanggal: formatDate(o.opname_date),
            satuan: getItemSatuan(o),
            stokSistem: systemStock,
            stokFisik: physicalStock,
            selisih: diff,
            petugas: getPetugas(o),
            catatan: o.notes || '-',
            expired: o.itemBatch?.expiry_date ? formatDate(o.itemBatch.expiry_date) : '-',
        };
    });

    res.json(responseData);

  } catch (err) {
    console.error("Error getOpnameHistory:", err.message);
    res.status(500).send('Server Error saat mengambil histori opname');
  }
};

const getBatchesByGudang = async (req, res) => {
    const { gudangId } = req.query;

    if (!gudangId) {
        return res.status(400).json({ msg: "Gudang ID diperlukan untuk mengambil data batch." });
    }

    try {
        const activeBatches = await ItemBatch.findAll({
            include: [
                {
                    model: Item,
                    as: 'item',
                    attributes: ['item_name', 'satuan'],
                    where: { 
                        gudang_id: gudangId 
                    },
                    required: true
                }
            ]
        });

        const mappedBatches = activeBatches.map(batch => ({
            id: batch.id,
            item_id: batch.item_id,
            stok: batch.quantity, 
            satuan: batch.item?.satuan || 'Unit',
            expiry_date: batch.expiry_date,
            item_name: batch.item?.item_name || 'Item Name Missing'
        }));

        res.status(200).json(mappedBatches);

    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ msg: "Terjadi kesalahan server saat mengambil daftar batch." });
    }
};

module.exports = { 
    createOpnameBatch,
    getOpnameHistory,
    getBatchesByGudang
};