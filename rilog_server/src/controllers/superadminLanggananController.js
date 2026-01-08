const { Bisnis, User, Sub_plan, Pengajuan_Pembayaran, LogVerifikasi, Sequelize } = require('../models');
const { Op } = Sequelize;

// ==========================================
// 1. GET USERS
// ==========================================
const getUsers = async (req, res) => {
  try {
    const { status } = req.query;
    let whereCondition = {};
    
    // Logika Filter
    if (status && status !== 'Semua') {
      if (status === 'Aktif') {
        whereCondition.sub_status = 'aktif';
      } else if (status === 'Non Aktif') {  
        whereCondition.sub_status = { [Op.or]: ['nonaktif', 'suspended', 'berakhir', 'trial'] };
      } else if (status === 'Akan Berakhir') {
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        whereCondition = {
          sub_status: 'aktif',
          sub_end: { [Op.lte]: sevenDaysLater, [Op.gte]: new Date() }
        };
      }
    }

    const bisnisList = await Bisnis.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'users', 
          limit: 1,
          attributes: [['name', 'nama'], 'email'], 
          order: [['created_at', 'ASC']]
        },
        // 🔥 PERBAIKAN UTAMA DISINI 🔥
        {
          model: Sub_plan, 
          as: 'subPlan', // ✅ HARUS 'subPlan' (sesuai model Bisnis.js baris 40)
          attributes: ['nama_paket', 'harga', 'durasi_hari'] 
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedData = bisnisList.map(bisnis => {
      const owner = (bisnis.users && bisnis.users.length > 0) ? bisnis.users[0].dataValues : {};
      
      let uiStatus = 'Non Aktif'; // Default (untuk expired/berakhir)
      
      if (bisnis.sub_status === 'aktif') {
          uiStatus = 'Aktif';
      } else if (bisnis.sub_status === 'suspended') {
          uiStatus = 'Suspended';
      } else if (bisnis.sub_status === 'trial') {
          uiStatus = 'Trial';
      }
      
      // 🔥 PERBAIKAN AKSES DATA (Gunakan 'subPlan')
      // Karena alias di include adalah 'subPlan', maka aksesnya juga bisnis.subPlan
      const paketData = bisnis.subPlan || {}; 
      const namaPaket = paketData.nama_paket || 'Trial / Basic';

      return {
        id: bisnis.id,
        bisnis: bisnis.nama_bisnis,
        email: owner.email || '-',
        nama: owner.nama || 'Belum ada user',
        tipe_bisnis: bisnis.tipe_bisnis || '-', 
        paket: namaPaket, 
        mulai: bisnis.sub_start,
        berakhir: bisnis.sub_end,
        status: uiStatus,               
        originalStatus: bisnis.sub_status 
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("Error getUsers:", error);
    res.status(500).json({ msg: "Gagal mengambil data bisnis" });
  }
};

// ==========================================
// 2. DELETE USER
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const bisnis = await Bisnis.findByPk(id);

    if (bisnis) {
      await Bisnis.destroy({ where: { id } });
      if (req.user) {
          await LogVerifikasi.create({
            user_id: req.user.id, 
            role: 'Super Admin',
            aksi: 'Hapus Bisnis',
            keterangan: `Menghapus bisnis: ${bisnis.nama_bisnis} (ID: ${id})`
          });
      }
    }
    res.json({ msg: "Bisnis berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteUser:", error);
    res.status(500).json({ msg: "Gagal menghapus bisnis" });
  }
};

// ==========================================
// 3. UPDATE STATUS
// ==========================================
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // Ini adalah ID Bisnis
    const { status } = req.body; 

    const bisnis = await Bisnis.findByPk(id);
    if (!bisnis) {
      return res.status(404).json({ msg: "Bisnis tidak ditemukan" });
    }

    // 1. Update Status Bisnis
    await bisnis.update({ sub_status: status });

    // 2. 🔥 LOGIKA TAMBAHAN: Update Status User Mengikuti Bisnis
    // Jika Bisnis di-SUSPEND -> Matikan semua user
    if (status === 'suspended') {
        await User.update(
            { status: 'suspended' },
            { where: { bisnis_id: id } }
        );
    } 
    // Jika Bisnis di-AKTIF-kan kembali -> Hidupkan semua user
    else if (status === 'aktif') {
        await User.update(
            { status: 'active' },
            { where: { bisnis_id: id } }
        );
    }
    // Jika 'nonaktif' (Expired) -> User BIARKAN TETAP AKTIF (Sesuai request Abang tadi)
    
    // 3. Simpan Log
    if (req.user) {
      await LogVerifikasi.create({
        user_id: req.user.id,
        role: 'Super Admin',
        aksi: 'Update Status',
        keterangan: `Mengubah status bisnis ${bisnis.nama_bisnis} menjadi ${status} (Sinkronisasi User)`
      });
    }

    res.json({ msg: "Status bisnis dan user berhasil diperbarui" });
  } catch (error) {
    console.error("Error updateStatus:", error);
    res.status(500).json({ msg: "Gagal update status" });
  }
};

// ==========================================
// 4. GET PAYMENTS
// ==========================================
const getPayments = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = {};
    if (status === 'Terverifikasi') whereClause.status = 'disetujui';
    if (status === 'Belum Terverifikasi') whereClause.status = 'pending';

    const payments = await Pengajuan_Pembayaran.findAll({
      where: whereClause,
      include: [
        // 1. Ambil Nama Bisnis
        { model: Bisnis, as: 'bisnis', attributes: ['nama_bisnis'] },
        // 2. Ambil Nama Pemilik (User)
        { model: User, as: 'user', attributes: [['name', 'nama']] },
        // 3. 🔥 AMBIL NAMA PAKET YANG DIAJUKAN 🔥
        { 
            model: Sub_plan, 
            as: 'subPlan', // Pastikan di model Pengajuan_Pembayaran relasinya as: 'subPlan'
            attributes: ['nama_paket', 'harga'] 
        }
      ],
      order: [['tanggal_pengajuan', 'DESC']]
    });

    const formattedData = payments.map(p => {
        const userData = p.user ? p.user.dataValues : {};
        const bisnisData = p.bisnis ? p.bisnis.dataValues : {};
        const paketData = p.subPlan ? p.subPlan.dataValues : {};

        return {
            id: p.id,
            bisnis: bisnisData.nama_bisnis || 'Tanpa Bisnis', // ✅ Nama Bisnis
            pemilik: userData.nama || '-', // ✅ Nama Pemilik
            
            // ✅ Data Pengirim (Manual Input user)
            pengirim: p.nama_pengirim || userData.nama || 'Unknown', 
            bank: p.bank_pengirim || '-', 
            
            // ✅ Paket yang diajukan
            paket: paketData.nama_paket || '-',
            
            tanggal: p.tanggal_pengajuan,
            jumlah: p.total_bayar,
            status: p.status === 'disetujui' ? 'Terverifikasi' : (p.status === 'pending' ? 'Belum Terverifikasi' : 'Ditolak'),
            bukti: p.bukti_pembayaran
        };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("Error getPayments:", error);
    res.status(500).json({ msg: "Gagal mengambil data pembayaran" });
  }
};

// ==========================================
// 5. VERIFY PAYMENT
// ==========================================
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 

    const transaksi = await Pengajuan_Pembayaran.findByPk(id, {
      include: [{ model: Bisnis, as: 'bisnis' }]
    });

    if (!transaksi) return res.status(404).json({ msg: "Transaksi tidak ditemukan" });

    if (action === 'approve') {
      await transaksi.update({ status: 'disetujui' });
      const bisnis = transaksi.bisnis;
      if (bisnis) {
        let newStartDate = new Date();
        if (bisnis.sub_status === 'aktif' && bisnis.sub_end && new Date(bisnis.sub_end) > new Date()) {
          newStartDate = new Date(bisnis.sub_end);
        }
        
        const durasiHari = transaksi.durasi_paket || 30; 
        let newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + durasiHari);

        await bisnis.update({
          sub_status: 'aktif',
          sub_start: new Date(),
          sub_end: newEndDate,
          sub_plan_id: transaksi.sub_plan_id
        });

        if(req.user) {
            await LogVerifikasi.create({
              user_id: req.user.id,
              role: 'Super Admin',
              aksi: 'Approve Pembayaran',
              keterangan: `Menyetujui pembayaran ID ${id} (${bisnis.nama_bisnis})`
            });
        }
      }
    } else if (action === 'reject') {
      await transaksi.update({ status: 'ditolak' });
      if(req.user) {
          await LogVerifikasi.create({
            user_id: req.user.id,
            role: 'Super Admin',
            aksi: 'Reject Pembayaran',
            keterangan: `Menolak pembayaran ID ${id}`
          });
      }
    }
    res.json({ msg: "Status pembayaran diperbarui" });
  } catch (error) {
    console.error("Error verifyPayment:", error);
    res.status(500).json({ msg: "Gagal memproses verifikasi" });
  }
};

// ==========================================
// 6. GET LOGS
// ==========================================
const getLogs = async (req, res) => {
  try {
    const logs = await LogVerifikasi.findAll({
      include: [{ 
          model: User, 
          as: 'user', 
          attributes: [['name', 'nama']] 
      }],
      order: [['waktu', 'DESC']],
      limit: 100 
    });

    const formattedLogs = logs.map(log => {
        const userData = log.user ? log.user.dataValues : {};
        return {
            id: log.id,
            waktu: log.waktu,
            nama: userData.nama || 'Super Admin', 
            role: log.role,
            aktivitas: log.aksi,      
            detail: log.keterangan    
        };
    });

    res.json(formattedLogs);
  } catch (error) {
    console.error("Error getLogs:", error);
    res.status(500).json({ msg: "Gagal mengambil log verifikasi" });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  updateUserStatus,
  getPayments,
  verifyPayment,
  getLogs
};