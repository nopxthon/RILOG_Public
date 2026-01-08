'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id, name FROM users ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const items = await queryInterface.sequelize.query(
      'SELECT id, item_name FROM items ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!users.length || !items.length) {
      console.warn('⚠️ Seeder opname dilewati karena data referensi belum ada.');
      return;
    }

    const findItem = (keyword) =>
      items.find((i) => i.item_name.toLowerCase().includes(keyword.toLowerCase()))?.id || items[0]?.id;

    const opnames = [
      {
        user_id: users[0]?.id || null,
        item_id: findItem('Televisi'),
        actual_stok: 14,
        opname_date: new Date('2024-03-20T09:00:00'),
        notes: 'Stok sesuai, ada 1 unit untuk display',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: users[1]?.id || users[0]?.id || null,
        item_id: findItem('Beras'),
        actual_stok: 95,
        opname_date: new Date('2024-03-20T10:30:00'),
        notes: 'Selisih 5 karung, kemungkinan salah hitung sebelumnya',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: users[2]?.id || users[0]?.id || null,
        item_id: findItem('Semen'),
        actual_stok: 480,
        opname_date: new Date('2024-03-22T08:45:00'),
        notes: 'Selisih 20 sak, perlu investigasi',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: users[3]?.id || users[1]?.id || null,
        item_id: findItem('Cat'),
        actual_stok: 115,
        opname_date: new Date('2024-03-22T11:20:00'),
        notes: 'Stok sesuai, ada 5 kaleng rusak ringan',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
    ];

    await queryInterface.bulkInsert('opnames', opnames, {});
    console.log(`✅ Seeder opname berhasil dijalankan (${opnames.length} data dibuat).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('opnames', null, {});
    console.log('🗑️ Semua data opname berhasil dihapus.');
  }
};
