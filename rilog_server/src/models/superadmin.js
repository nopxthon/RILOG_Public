'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Superadmin extends Model {
    static associate(models) {
      // Tidak ada relasi di ERD
    }
  }

  Superadmin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nama pengguna superadmin',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Kata sandi superadmin (terenkripsi)',
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama depan superadmin',
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama belakang superadmin',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Email superadmin',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nomor telepon superadmin',
      },
      profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Path foto profil superadmin',
      },
    },
    {
      sequelize,
      modelName: 'Superadmin',
      tableName: 'superadmins',
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Superadmin;
};