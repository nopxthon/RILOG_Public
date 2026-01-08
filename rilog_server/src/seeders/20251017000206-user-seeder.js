'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 🔹 Ambil daftar bisnis agar user bisa dihubungkan
    const bisnisList = await queryInterface.sequelize.query(
      'SELECT id, nama_bisnis FROM bisnis ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!bisnisList.length) {
      console.warn('⚠️ Tidak ada data di tabel bisnis. Seeder user dilewati.');
      return;
    }

    console.log('✅ Bisnis ditemukan untuk user:', bisnisList.map(b => b.nama_bisnis).join(', '));

    // 🔒 Hash password untuk keamanan
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordStaff = await bcrypt.hash('staff123', 10);

    // 🔹 Data user dummy (maks 4)
    const users = [
      {
        name: 'Admin Utama 1',
        email: 'admin1@example.com',
        password: hashedPasswordAdmin,
        role: 'admin',
        status: 'active', // ✅ aktif
        bisnis_id: bisnisList[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Admin Utama 2',
        email: 'admin2@example.com',
        password: hashedPasswordAdmin,
        role: 'admin',
        status: 'active',
        bisnis_id: bisnisList[1]?.id || bisnisList[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Staff Gudang 1',
        email: 'staff1@example.com',
        password: hashedPasswordStaff,
        role: 'staff',
        status: 'active',
        bisnis_id: bisnisList[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Staff Gudang 2',
        email: 'staff2@example.com',
        password: hashedPasswordStaff,
        role: 'staff',
        status: 'active',
        bisnis_id: bisnisList[1]?.id || bisnisList[0]?.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // 🔹 Masukkan ke database
    await queryInterface.bulkInsert('users', users, {});
    console.log(`✅ Seeder user berhasil dijalankan (${users.length} user ditambahkan).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    console.log('🗑️ Semua user berhasil dihapus.');
  },
};
