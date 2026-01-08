'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifikasis', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      bisnis_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bisnis',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      gudang_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

      record_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      table_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      type: {
        type: Sequelize.ENUM(
          'stok_menipis',
          'stok_habis',
          'stok_berlebih',
          'mendekati_kadaluarsa',
          'sudah_kadaluarsa',
          'sistem'
        ),
        allowNull: false,
        defaultValue: 'sistem',
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
    });

    // =========================
    // INDEXES (PERFORMA)
    // =========================
    await queryInterface.addIndex('notifikasis', ['bisnis_id']);
    await queryInterface.addIndex('notifikasis', ['gudang_id']);
    await queryInterface.addIndex('notifikasis', ['user_id']);
    await queryInterface.addIndex('notifikasis', ['type']);
    await queryInterface.addIndex('notifikasis', ['record_id', 'table_name']);
    await queryInterface.addIndex('notifikasis', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifikasis');
  },
};
