'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      gudang_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Gudang tempat transaksi terjadi',
        references: {
          model: 'gudangs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      type: {
        type: Sequelize.ENUM('MASUK', 'KELUAR'),
        allowNull: false,
      },
      item_batch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'item_batches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      
      // ⬇️ FIELD TAMBAHAN SUPPLIER/CUSTOMER/PIC
      supplier: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pic: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // ✅ FIELD BARU: SNAPSHOT STOK (PENTING UNTUK LAPORAN)
      stock_snapshot: {
        type: Sequelize.INTEGER,
        allowNull: true, // Boleh null (untuk data lama jika ada)
        defaultValue: 0,
        comment: 'Sisa stok total item di gudang saat transaksi ini terjadi',
      },

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
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  },
};