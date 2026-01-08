const cron = require('node-cron');
const { Op } = require('sequelize');
const { Bisnis, User, Gudang } = require('../models'); 

const checkExpiredSubscriptions = async () => {
    console.log(`[${new Date().toLocaleTimeString()}] 🕒 [CRON] Mengecek langganan expired...`);

    try {
        const today = new Date();

        // Cari bisnis yang statusnya aktif/trial TAPI tanggalnya sudah lewat
        const expiredBusinesses = await Bisnis.findAll({
            where: {
                [Op.or]: [{ sub_status: 'aktif' }, { sub_status: 'trial' }],
                sub_end: {
                    [Op.lt]: today 
                }
            }
        });

        if (expiredBusinesses.length === 0) return;

        console.log(`⚠️ Ditemukan ${expiredBusinesses.length} bisnis expired. Memproses...`);

        for (const bisnis of expiredBusinesses) {
            
            // 1. Matikan Status Bisnis
            await bisnis.update({ sub_status: 'nonaktif' });

            // 2. Matikan Gudang (Supaya operasional berhenti total)
            await Gudang.update(
                { is_active: false },
                { where: { bisnis_id: bisnis.id } }
            );

            // 3. 🔥 LOGIKA USER (SESUAI REQUEST):
            // - Owner: JANGAN diapa-apain (tetap active).
            // - Staff: UBAH jadi SUSPENDED.
            await User.update(
                { status: 'suspended' }, 
                { 
                    where: { 
                        bisnis_id: bisnis.id, 
                        role: { [Op.ne]: 'admin' } // [Op.ne] = Not Equal (Tidak Sama Dengan)
                    } 
                }
            );

            console.log(`🔻 Bisnis ID ${bisnis.id} (${bisnis.nama_bisnis}) -> EXPIRED. Owner: Aman, Staff: Suspended, Gudang: Off.`);
        }

    } catch (error) {
        console.error('❌ [CRON ERROR]', error);
    }
};

const startScheduler = () => {
    // Jalankan setiap menit '* * * * *' (untuk development)
    // ubah ke '0 * * * *' (per jam) untuk production
    cron.schedule('0 * * * *', () => {
        checkExpiredSubscriptions();
    });
    console.log('✅ Scheduler Aktif: Owner Active, Staff Suspended saat Expired.');
};

// Pastikan export langsung function-nya
module.exports = {startScheduler};