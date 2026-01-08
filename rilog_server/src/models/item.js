'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      // ✅ Item dibuat oleh satu User
      Item.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ✅ Item dimiliki oleh satu kategori
      Item.belongsTo(models.Kategori, {
        foreignKey: 'category_id',
        as: 'kategori',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ✅ Item dimiliki oleh satu gudang
      Item.belongsTo(models.Gudang, {
        foreignKey: 'gudang_id',
        as: 'gudang',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ✅ Item memiliki banyak batch
      Item.hasMany(models.ItemBatch, {
        foreignKey: 'item_id',
        as: 'batches',
        onDelete: 'CASCADE',
      });

      // Relasi ke Notifikasi
      Item.hasMany(models.Notifikasi, {
        foreignKey: 'record_id',
        constraints: false,
        scope: {
          table_name: 'items'
        },
        as: 'notifikasi'
      });

      // // ✅ Item memiliki banyak transaksi
      // Item.hasMany(models.Transaction, {
      //   foreignKey: 'item_id',
      //   as: 'transactions',
      //   onDelete: 'CASCADE',
      // });

      // // ✅ Item memiliki banyak opname
      // Item.hasMany(models.Opname, {
      //   foreignKey: 'item_id',
      //   as: 'opnames',
      //   onDelete: 'CASCADE',
      // });

      // // ✅ Item memiliki banyak aktivitas log
      // Item.hasMany(models.ActivityLog, {
      //   foreignKey: 'item_id',
      //   as: 'activityLogs',
      //   onDelete: 'CASCADE',
      // });
    }
  }

  Item.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nama item/barang',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'User yang menambahkan item',
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'kategoris',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Kategori item',
      },
      gudang_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'gudangs',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Gudang tempat item disimpan',
      },
      satuan: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Satuan item (misal: pcs, box, kg)',
      },
      min_stok: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: 'Batas stok minimum',
      },
      max_stok: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: 'Batas stok maksimum',
      },
    },
    {
      sequelize,
      modelName: 'Item',
      tableName: 'items',
      underscored: true,
      timestamps: true,
      paranoid: true, // ✅ soft delete
    }
  );

  return Item;
};
