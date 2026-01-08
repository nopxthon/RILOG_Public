'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // ✅ Relasi ke User
      Transaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // ✅ Relasi ke ItemBatch
      Transaction.belongsTo(models.ItemBatch, {
        foreignKey: 'item_batch_id',
        as: 'itemBatch',
      });
      
      // (Opsional: Relasi ke Item, jika ada item_id)
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      gudang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Relasi ke gudang tempat transaksi terjadi',
        references: { model: 'gudangs', key: 'id' }
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      type: {
        type: DataTypes.ENUM('MASUK', 'KELUAR'),
        allowNull: false,
      },
      item_batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'item_batches', key: 'id' },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // ⬇️ TAMBAHAN: Pindah dari ItemBatch
      supplier: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama Pemasok (untuk stok masuk)',
      },
      // ⬇️ TAMBAHAN: Untuk stok keluar
      customer: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama Pelanggan (untuk stok keluar)',
      },
      pic: {
        type: DataTypes.STRING,
        allowNull: true
      },
      stock_snapshot: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Catatan tambahan',
      },
      createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at' // Mapping ke nama kolom database (snake_case)
    },
      updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
    
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Transaction;
};