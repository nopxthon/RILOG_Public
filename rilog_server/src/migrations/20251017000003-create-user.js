'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      invite_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      invited_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM('admin', 'staff'),
        allowNull: false,
        defaultValue: 'staff',
      },

      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status aktivasi akun user',
      },

      foto_profil: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: 'Foto profil dalam format base64',
      },

      bisnis_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'bisnis',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      reset_password_token: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Token untuk reset password',
      },

      reset_password_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Waktu kadaluarsa token reset password',
      },
      
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
