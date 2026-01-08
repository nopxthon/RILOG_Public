'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const kategoris = await queryInterface.sequelize.query(
      'SELECT id, category_name FROM kategoris ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const gudangs = await queryInterface.sequelize.query(
      'SELECT id, nama_gudang FROM gudangs ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!kategoris.length || !gudangs.length) {
      console.warn('⚠️ Seeder item dilewati karena kategori/gudang belum ada.');
      return;
    }

    console.log('✅ Data referensi ditemukan:');
    console.log(`   Kategori: ${kategoris.length}, Gudang: ${gudangs.length}`);

    const findCategory = (name) => {
      const c = kategoris.find(k => k.category_name.toLowerCase().includes(name.toLowerCase()));
      return c ? c.id : null;
    };

    const items = [
      {
        item_name: 'Televisi LED 32 Inch',
        min_stok: 5,
        max_stok: 50,
        satuan: 'unit',
        user_id: 1,
        category_id: findCategory('Elektronik'),
        gudang_id: gudangs[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        item_name: 'Beras Premium 5kg',
        min_stok: 20,
        max_stok: 200,
        satuan: 'karung',
        user_id: 2,
        category_id: findCategory('Makanan'),
        gudang_id: gudangs[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        item_name: 'Semen Portland',
        min_stok: 100,
        max_stok: 1000,
        satuan: 'sak',
        user_id: 1,
        category_id: findCategory('Material') || findCategory('Peralatan'),
        gudang_id: gudangs[1]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        item_name: 'Cat Tembok Putih 5L',
        min_stok: 20,
        max_stok: 250,
        satuan: 'kaleng',
        user_id: 2,
        category_id: findCategory('Peralatan') || findCategory('Barang'),
        gudang_id: gudangs[1]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
    ];

    await queryInterface.bulkInsert('items', items, {});
    console.log(`✅ Seeder item berhasil dijalankan (${items.length} data item dibuat).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('items', null, {});
    console.log('🗑️ Semua data item berhasil dihapus.');
  }
};
