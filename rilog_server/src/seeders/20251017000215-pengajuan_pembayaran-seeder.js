'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fetch Data Pendukung (Bisnis, SubPlan, User)
    const bisnisList = await queryInterface.sequelize.query(
      'SELECT id, nama_bisnis FROM bisnis;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Kita butuh harga dan durasi untuk snapshot transaksi
    const subPlans = await queryInterface.sequelize.query(
      'SELECT id, nama_paket, harga, durasi_hari FROM sub_plans;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Kita butuh user_id (ambil user pertama saja sebagai dummy owner)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const dummyUserId = users.length > 0 ? users[0].id : null;

    if (!bisnisList.length || !subPlans.length) {
      console.warn('⚠️ Data bisnis atau sub_plans belum tersedia. Seeder dilewati.');
      return;
    }

    // 2. Buat Mapping Helper
    const bisnisMap = {};
    bisnisList.forEach(b => {
      bisnisMap[b.nama_bisnis.toLowerCase().replace(/\s/g, '')] = b.id;
    });

    const planMap = {};
    subPlans.forEach(p => {
      // Simpan objek plan lengkap biar bisa ambil harga & durasi
      planMap[p.nama_paket.toLowerCase()] = p; 
    });

    // Helper function untuk ambil plan
    const getPlan = (name) => planMap[name] || planMap['monthly'] || Object.values(planMap)[0];

    // 3. Siapkan Data Dummy
    // Pastikan key nama bisnis cocok dengan seeder bisnis di atas
    const paketTahunan = getPlan('tahunan') || getPlan('yearly');
    const paketBulanan = getPlan('bulanan') || getPlan('monthly');
    const paketTrial = getPlan('trial');

    const data = [
      {
        bisnis_id: bisnisMap['tokoserbaadajaya'],
        user_id: dummyUserId, // Wajib ada sekarang
        sub_plan_id: paketTahunan?.id,
        
        // Data Snapshot (PENTING)
        total_bayar: paketTahunan?.harga || 1000000,
        durasi_paket: paketTahunan?.durasi_hari || 365,
        
        // Data Pembayaran Manual
        nama_pengirim: 'Budi Santoso',
        bank_pengirim: 'BCA',
        bukti_pembayaran: '/uploads/bukti/transfer_001.jpg',
        
        tanggal_pengajuan: new Date('2024-01-01T10:00:00'),
        status: 'disetujui',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bisnis_id: bisnisMap['gudangsentralmakmur'],
        user_id: dummyUserId,
        sub_plan_id: paketBulanan?.id,

        // Data Snapshot
        total_bayar: paketBulanan?.harga || 100000,
        durasi_paket: paketBulanan?.durasi_hari || 30,

        // Data Pembayaran Manual
        nama_pengirim: 'Siti Aminah',
        bank_pengirim: 'Mandiri',
        bukti_pembayaran: '/uploads/bukti/transfer_002.jpg',

        tanggal_pengajuan: new Date('2024-02-01T14:15:00'),
        status: 'disetujui',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bisnis_id: bisnisMap['gudangsentralmakmur'],
        user_id: dummyUserId,
        sub_plan_id: paketBulanan?.id,

        // Data Snapshot
        total_bayar: paketBulanan?.harga || 100000,
        durasi_paket: paketBulanan?.durasi_hari || 30,

        // Data Pembayaran Manual (Belum upload bukti)
        nama_pengirim: null,
        bank_pengirim: null,
        bukti_pembayaran: null,

        tanggal_pengajuan: new Date('2024-03-01T11:20:00'),
        status: 'disetujui',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bisnis_id: bisnisMap['distributorutamanusantara'],
        user_id: dummyUserId,
        sub_plan_id: paketTrial?.id,

        // Data Snapshot (Trial biasanya 0)
        total_bayar: 0,
        durasi_paket: paketTrial?.durasi_hari || 7,

        nama_pengirim: 'Sistem',
        bank_pengirim: '-',
        bukti_pembayaran: null,

        tanggal_pengajuan: new Date('2024-03-01T08:45:00'),
        status: 'disetujui',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    // Filter data yang bisnis_id nya tidak ketemu (biar gak error constraint)
    const validData = data.filter(d => d.bisnis_id && d.sub_plan_id);

    if (validData.length > 0) {
      await queryInterface.bulkInsert('pengajuan_pembayarans', validData, {});
      console.log(`✅ Seeder pengajuan_pembayarans berhasil (${validData.length} data).`);
    } else {
      console.warn('⚠️ Gagal mencocokkan bisnis_id atau sub_plan_id. Cek nama di seeder.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pengajuan_pembayarans', null, {});
  },
};