'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otp_verifies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      // Relasi ke user
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Relasi ke user yang menerima OTP / activation',
      },

      // Email tujuan OTP / aktivasi
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // OTP 6 digit (untuk login/register)
      otp_code: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },

      // Token aktivasi panjang untuk staff invitation
      activation_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // Jenis token
      tipe: {
        type: Sequelize.ENUM('otp', 'activation'),
        allowNull: false,
      },

      // Waktu kedaluwarsa
      expired_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // Status verifikasi
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // timestamps
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus ENUM terlebih dahulu (MySQL strict)
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS \"enum_otp_verifies_tipe\";"
    ).catch(() => {});

    await queryInterface.dropTable('otp_verifies');
  },
};
