'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      // Relasi ke user (opsional, bisa null)
      ActivityLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ✅ Relasi ke gudang (opsional, bisa null)
      ActivityLog.belongsTo(models.Gudang, {
        foreignKey: 'gudang_id',
        as: 'gudang',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  ActivityLog.init(
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
        comment: 'Deskripsi aktivitas yang terjadi',
      },
      type: {
        type: DataTypes.ENUM('STOK MASUK', 'STOK KELUAR','OPNAME','TAMBAH ITEM', 'sistem'),
        allowNull: false,
        defaultValue: 'sistem',
        comment: 'Jenis aktivitas log',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      gudang_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'gudangs',
          key: 'id',
        },
        comment: 'ID gudang terkait aktivitas ini',
      },
      table_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama tabel sumber data (misal: items, transactions)',
      },
      record_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID record dari tabel sumber',
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ActivityLog',
      tableName: 'activity_logs',
      underscored: true,
      timestamps: true,
      paranoid: false,
    }
  );

  return ActivityLog;
};