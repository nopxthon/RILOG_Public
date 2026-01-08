'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /* --- SEMENTARA DINONAKTIFKAN ---
    
    // (Semua kode lama Anda ada di dalam blok komentar ini)

    const items = await queryInterface.sequelize.query(
      'SELECT id, item_name FROM items ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const bisnisList = await queryInterface.sequelize.query(
      'SELECT id, nama_bisnis FROM bisnis ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!items.length || !bisnisList.length) {
      console.warn('⚠️ Seeder notifikasis dilewati karena data referensi belum tersedia.');
      return;
    }

    const findItem = (keyword) =>
      items.find((i) => i.item_name.toLowerCase().includes(keyword.toLowerCase()));

    const findBisnis = (keyword) =>
      bisnisList.find((b) => b.nama_bisnis.toLowerCase().includes(keyword.toLowerCase()))?.id || bisnisList[0]?.id;

    const notifikasis = [
      // Stok Menipis
      {
        id: `notif_${Date.now()}_1`,
        bisnis_id: findBisnis('Serba Ada'),
        message: 'Stok produk Televisi LED 32 Inch menipis',
        type: 'stok_menipis',
        table_name: 'items',
        record_id: findItem('Televisi')?.id?.toString() || items[0].id.toString(),
        created_at: new Date('2024-03-18T08:30:00'),
        updated_at: new Date('2024-03-18T08:30:00'),
      },
      // ... (sisa data notifikasi lainnya) ...
      {
        id: `notif_${Date.now()}_10`,
        bisnis_id: findBisnis('Serba Ada'),
        message: 'Laporan bulanan Maret 2024 telah siap',
        type: 'sistem',
        table_name: 'bisnis',
        record_id: findBisnis('Serba Ada').toString(),
        created_at: new Date('2024-03-28T08:00:00'),
        updated_at: new Date('2024-03-28T08:00:00'),
      },
    ];

    await queryInterface.bulkInsert('notifikasis', notifikasis, {});
    console.log(`✅ Seeder notifikasis berhasil dijalankan (${notifikasis.length} data dibuat).`);
    
    console.log('📝 Contoh notifikasi yang dibuat:');
    notifikasis.forEach((notif, i) => {
      console.log(`   ${i + 1}. ${notif.message} [${notif.type}]`);
    });

    --- AKHIR DARI BLOK NONAKTIF --- */

    // Ini akan berjalan dan memberitahu Anda bahwa seeder-nya dilewati
    console.log('🟡 Seeder notifikasis sengaja DILEWATI.');
  },

  async down(queryInterface, Sequelize) {
    /* --- SEMENTARA DINONAKTIFKAN ---
      await queryInterface.bulkDelete('notifikasis', null, {});
      console.log('🗑️ Semua data notifikasis berhasil dihapus.');
    --- AKHIR DARI BLOK NONAKTIF --- */
    
    console.log('🟡 Seeder notifikasis (down) sengaja DILEWATI.');
  },
};