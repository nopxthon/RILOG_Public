'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil 1 user aktif untuk dijadikan relasi OTP
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM users ORDER BY id LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userId = users.length ? users[0].id : null;
    const userEmail = users.length ? users[0].email : 'example@mail.com';

    const now = new Date();

    await queryInterface.bulkInsert(
      'otp_verifies',
      [
        {
          user_id: userId,
          email: userEmail,
          otp_code: '987654',
          activation_token: null,         // karena tipe = 'otp'
          tipe: 'otp',                    // pastikan sesuai ENUM tabel
          expired_at: new Date(now.getTime() + 10 * 60 * 1000),
          verified: false,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          user_id: userId,
          email: userEmail,
          otp_code: '123456',
          activation_token: null,
          tipe: 'otp',
          expired_at: new Date(now.getTime() + 5 * 60 * 1000),
          verified: true,
          created_at: now,
          updated_at: now,
          deleted_at: null
        }
      ],
      {}
    );

    console.log('✅ Seeder otp_verifies berhasil dijalankan (2 data dibuat)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('otp_verifies', null, {});
    console.log('🗑️ Semua data otp_verifies dihapus');
  }
};
