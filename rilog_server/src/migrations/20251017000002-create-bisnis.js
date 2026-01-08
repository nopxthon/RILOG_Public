'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bisnis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama_bisnis: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipe_bisnis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // ✅ UPDATE: Menambahkan 'trial' dan 'suspended', serta default 'trial'
      sub_status: {
        type: Sequelize.ENUM('aktif', 'nonaktif', 'suspended'),
        allowNull: false,
        defaultValue: 'aktif', 
        comment: 'Status langganan: trial, aktif, nonaktif, menunggu, berakhir, suspended',
      },
      sub_start: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Tanggal mulai langganan',
      },
      sub_end: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Tanggal akhir langganan',
      },
      // ✅ UPDATE: Pastikan tipe datanya INTEGER jika tabel sub_plans ID-nya Integer
      sub_plan_id: {
        type: Sequelize.INTEGER, 
        allowNull: true,
        references: {
          model: 'sub_plans', // Pastikan nama tabel referensi benar
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      
      // --- Timestamps ---
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bisnis');
  },
};