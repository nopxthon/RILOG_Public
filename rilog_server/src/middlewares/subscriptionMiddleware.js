const { Bisnis, Gudang, User } = require('../models');
const { Op } = require('sequelize');

const checkSubscriptionActive = async (req, res, next) => {
    try {
        const user = req.userInstance; // Pastikan authMiddleware sudah jalan duluan

        if (!user || !user.bisnis_id) {
            return res.status(403).json({ message: "Akses ditolak. Identitas bisnis tidak ditemukan." });
        }

        const bisnis = await Bisnis.findByPk(user.bisnis_id);

        if (!bisnis) {
            return res.status(404).json({ message: "Bisnis tidak ditemukan." });
        }

        // --- LOGIKA UTAMA ---
        const today = new Date();
        const endDate = new Date(bisnis.sub_end);

        // Cek: Apakah tanggal sudah lewat TAPI status di database masih 'aktif'/'trial'?
        // (Artinya Cron Job belum sempat jalan, atau user akses pas banget detiknya habis)
        if (endDate < today && (bisnis.sub_status === 'aktif' || bisnis.sub_status === 'trial')) {
            
            console.log(`⚠️ [MIDDLEWARE] Paket Bisnis ID ${bisnis.id} Expired saat diakses user. Melakukan Reset Otomatis...`);

            // 1. Update Status Bisnis jadi Nonaktif
            await bisnis.update({ sub_status: 'nonaktif' });

            // 2. Nonaktifkan Semua Gudang
            await Gudang.update(
                { is_active: false },
                { where: { bisnis_id: bisnis.id } }
            );

            // 3. Suspend Semua Staff (Kecuali Owner)
            await User.update(
                { status: 'suspended' },
                { where: { bisnis_id: bisnis.id, role: { [Op.ne]: 'owner' } } }
            );

            return res.status(403).json({ 
                message: "Masa aktif paket Anda telah habis. Sistem telah menonaktifkan fitur secara otomatis. Silakan perpanjang langganan." 
            });
        }

        // Jika status memang sudah nonaktif dari awal
        if (bisnis.sub_status === 'nonaktif' || bisnis.sub_status === 'suspended') {
             return res.status(403).json({ 
                message: "Paket Anda tidak aktif. Silakan lakukan pembayaran." 
            });
        }

        // Kalau aman, lanjut!
        next();

    } catch (error) {
        console.error("Subscription Middleware Error:", error);
        res.status(500).json({ message: "Gagal memvalidasi status langganan." });
    }
};

module.exports = { checkSubscriptionActive };