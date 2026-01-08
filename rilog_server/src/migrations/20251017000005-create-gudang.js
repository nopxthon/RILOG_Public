'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gudangs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      // Foreign Key ke bisnis
      bisnis_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bisnis', // Pastikan nama tabel di DB 'bisnis' (bukan 'Bisnis')
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      nama_gudang: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      tipe_gudang: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      alamat_gudang: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // 🔥 TAMBAHAN WAJIB (Agar fitur Slot/Lock berfungsi) 🔥
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, 
        allowNull: false,
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
    await queryInterface.dropTable('gudangs');
  },
};