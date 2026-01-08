'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notifikasi extends Model {
    static associate(models) {
      // =====================
      // Relasi ke Bisnis
      // =====================
      Notifikasi.belongsTo(models.Bisnis, {
        foreignKey: 'bisnis_id',
        as: 'bisnis',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // =====================
      // Polymorphic ke Item
      // =====================
      Notifikasi.belongsTo(models.Item, {
        foreignKey: 'record_id',
        constraints: false,
        as: 'item',
        scope: {
          table_name: 'items',
        },
      });

      // =====================
      // Relasi ke User (opsional)
      // =====================
      Notifikasi.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // =====================
      // Relasi ke Gudang
      // =====================
      Notifikasi.belongsTo(models.Gudang, {
        foreignKey: 'gudang_id',
        as: 'gudang',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Notifikasi.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Isi pesan notifikasi',
      },

      bisnis_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      gudang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User penerima notifikasi (jika ada)',
      },

      record_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID record dari tabel sumber',
      },

      table_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama tabel sumber data (misal: items)',
      },

      type: {
        type: DataTypes.ENUM(
          'stok_menipis',
          'stok_habis',
          'stok_berlebih',
          'mendekati_kadaluarsa',
          'sudah_kadaluarsa',
          'sistem'
        ),
        allowNull: false,
        defaultValue: 'sistem',
        comment: 'Jenis notifikasi',
      },
    },
    {
      sequelize,
      modelName: 'Notifikasi',
      tableName: 'notifikasis',
      underscored: true,
      timestamps: true, // Sequelize kelola created_at & updated_at
      paranoid: false,
    }
  );

  return Notifikasi;
};
