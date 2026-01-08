'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil item untuk relasi
    const items = await queryInterface.sequelize.query(
      'SELECT id, item_name FROM items ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!items.length) {
      console.warn('⚠️ Tidak ada data di tabel items. Seeder item_batch dilewati.');
      return;
    }

    console.log('✅ Items ditemukan:', items.map(i => i.item_name).join(', '));

    // Sesuaikan batch dengan kolom migration (TANPA SUPPLIER)
    const batches = [
      {
        // Batch 1 (TV)
        item_id: items[0]?.id || null,
        // supplier: DIHAPUS
        quantity: 10,
        expiry_date: null, 
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        // Batch 2 (Beras)
        item_id: items[1]?.id || items[0]?.id || null,
        //  supplier: DIHAPUS
        quantity: 40,
        expiry_date: new Date('2026-10-15'), 
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        // Batch 3 (Semen)
        item_id: items[2]?.id || items[0]?.id || null,
        // supplier: DIHAPUS
        quantity: 100,
        expiry_date: new Date('2027-05-20'), 
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        // Batch 4 (Cat)
        item_id: items[3]?.id || items[1]?.id || null,
        // supplier: DIHAPUS
        quantity: 60,
        expiry_date: new Date('2028-01-30'), 
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    await queryInterface.bulkInsert('item_batches', batches, {});
    console.log(`✅ Seeder item_batch berhasil dijalankan (${batches.length} batch dibuat).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('item_batches', null, {});
    console.log('🗑️ Semua data item_batch berhasil dihapus.');
  },
};