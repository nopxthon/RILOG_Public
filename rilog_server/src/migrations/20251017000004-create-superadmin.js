'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('superadmins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      username: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nama pengguna superadmin',
        // unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Kata sandi superadmin (terenkripsi)',
      },

      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nama depan superadmin',
      },

      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nama belakang superadmin',
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Email superadmin',
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nomor telepon superadmin',
      },

      profile_image: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Path foto profil superadmin',
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },

      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('superadmins');
  },
};
