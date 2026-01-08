'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 🔹 Ambil data user & gudang dari database
    const users = await queryInterface.sequelize.query(
      'SELECT id, name, email FROM users ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const gudangs = await queryInterface.sequelize.query(
      'SELECT id, nama_gudang FROM gudangs ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!users.length || !gudangs.length) {
      console.warn('⚠️ Tidak ada data user atau gudang. Seeder user_gudang_access dilewati.');
      return;
    }

    console.log('✅ User ditemukan:', users.map(u => `${u.id} - ${u.name}`).join(', '));
    console.log('✅ Gudang ditemukan:', gudangs.map(g => `${g.id} - ${g.nama_gudang}`).join(', '));

    // 🔹 Buat data akses (relasi user ↔ gudang)
    // Setiap user dapat akses ke satu atau lebih gudang sesuai skenario dummy
    const data = [
      // Admin Utama -> semua gudang
      ...gudangs.map(g => ({
        user_id: users[0]?.id || null, // Admin Utama
        gudang_id: g.id,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      })),

      // Staff Gudang -> hanya ke 2 gudang pertama
      {
        user_id: users[1]?.id || null, // Staff Gudang
        gudang_id: gudangs[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        user_id: users[1]?.id || null,
        gudang_id: gudangs[1]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    await queryInterface.bulkInsert('user_gudang_accesses', data, {});

    console.log(`✅ Seeder user_gudang_accesses berhasil dijalankan (${data.length} data dibuat).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_gudang_accesses', null, {});
    console.log('🗑️ Semua data user_gudang_accesses berhasil dihapus.');
  },
};
