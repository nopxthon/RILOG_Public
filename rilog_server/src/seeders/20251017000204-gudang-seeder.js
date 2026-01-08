'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ambil daftar bisnis yang ada
    const bisnisList = await queryInterface.sequelize.query(
      'SELECT id, nama_bisnis FROM bisnis ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (bisnisList.length === 0) {
      console.warn('⚠️ Tidak ada data di tabel bisnis. Seeder gudang dilewati.');
      return;
    }

    console.log(
      '✅ Bisnis ditemukan:',
      bisnisList.map(b => `${b.id} - ${b.nama_bisnis}`).join(', ')
    );

    // 2. Siapkan Data Gudang (Tambahkan is_active)
    const gudangs = [
      {
        bisnis_id: bisnisList[0]?.id || null,
        nama_gudang: 'Gudang Pusat - Toko Serba Ada Jaya',
        tipe_gudang: 'Pusat',
        alamat_gudang: 'Jl. Raya Jakarta No. 12, Jakarta',
        is_active: true, // ✅ Wajib ada (Default Aktif)
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        bisnis_id: bisnisList[1]?.id || bisnisList[0]?.id || null,
        nama_gudang: 'Gudang Cabang Timur - Gudang Sentral Makmur',
        tipe_gudang: 'Cabang',
        alamat_gudang: 'Jl. Ahmad Yani No. 88, Surabaya',
        is_active: true, // ✅ Wajib ada
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        bisnis_id: bisnisList[2]?.id || bisnisList[0]?.id || null,
        nama_gudang: 'Gudang Utama - Distributor Utama Nusantara',
        tipe_gudang: 'Utama',
        alamat_gudang: 'Jl. Diponegoro No. 33, Bandung',
        is_active: true, // ✅ Wajib ada
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        bisnis_id: bisnisList[1]?.id || bisnisList[0]?.id || null,
        nama_gudang: 'Gudang Cadangan - Wholesale Sentral',
        tipe_gudang: 'Cadangan',
        alamat_gudang: 'Jl. Sudirman No. 101, Medan',
        // Contoh: Kita set false agar bisa tes fitur "Hard Lock" di frontend
        // (Gudang ini akan muncul tapi status mati/slot kosong)
        is_active: false, 
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    // 3. Masukkan ke Database
    await queryInterface.bulkInsert('gudangs', gudangs, {});
    console.log(`✅ Seeder gudang berhasil dijalankan (${gudangs.length} gudang dibuat).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('gudangs', null, {});
  },
};