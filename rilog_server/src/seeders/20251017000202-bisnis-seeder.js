'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ambil semua data dari tabel sub_plans
    const subPlans = await queryInterface.sequelize.query(
      'SELECT id, nama_paket, tipe FROM sub_plans;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!subPlans.length) {
      console.warn('⚠️ PERINGATAN: Tabel sub_plans kosong! Seeder bisnis tidak dapat dijalankan.');
      return;
    }

    // 2. Helper function untuk mencari ID Paket secara fleksibel
    // Mencari berdasarkan kata kunci di nama_paket atau tipe
    const getPlanId = (keyword) => {
      const foundPlan = subPlans.find(p => 
        (p.nama_paket && p.nama_paket.toLowerCase().includes(keyword.toLowerCase())) ||
        (p.tipe && p.tipe.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      // Jika ketemu kembalikan ID-nya, jika tidak pakai ID paket pertama yang ada (Fallback)
      return foundPlan ? foundPlan.id : subPlans[0].id;
    };

    console.log('ℹ️ Mapping Paket:', {
      tahunan: getPlanId('tahun') || getPlanId('year'),
      bulanan: getPlanId('bulan') || getPlanId('month'),
      trial: getPlanId('trial'),
    });

    // 3. Insert Data Bisnis
    await queryInterface.bulkInsert(
      'bisnis',
      [
        {
          nama_bisnis: 'Toko Serba Ada Jaya',
          tipe_bisnis: 'Retail',
          sub_status: 'aktif',
          sub_start: new Date('2025-12-15'),
          sub_end: new Date('2025-12-29'), // Asumsi 1 tahun
          sub_plan_id: 1, // Cari paket tahunan
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          nama_bisnis: 'Gudang Sentral Makmur',
          tipe_bisnis: 'Wholesale',
          sub_status: 'aktif',
          sub_start: new Date('2025-12-01'),
          sub_end: new Date('2025-12-30'), // Asumsi 1 bulan
          sub_plan_id: 2, // Cari paket bulanan
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    console.log('✅ Seeder bisnis berhasil dijalankan dengan ID Paket yang dinamis.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bisnis', null, {});
  },
};