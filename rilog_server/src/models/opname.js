"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Opname extends Model {
    static associate(models) {
      // ✅ Opname dilakukan oleh satu User
      Opname.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }); // ✅ Opname berkaitan dengan satu Item

      Opname.belongsTo(models.Item, {
        foreignKey: "item_id",
        as: "item",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      // ✅ Opname berkaitan dengan Batch (Menggunakan item_batch_id)
      Opname.belongsTo(models.ItemBatch, {
        // Asumsi model Batch Anda bernama ItemBatch
        foreignKey: "item_batch_id",
        as: "itemBatch", // Diubah menjadi itemBatch agar sinkron dengan FK
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      Opname.belongsTo(models.Gudang, {
        foreignKey: "gudang_id",
        as: "gudang", // Alias ini penting untuk "include" nanti
      });
    }
  }

  Opname.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "items",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      item_batch_id: {
        // ✅ Kolom yang menunjuk ke ItemBatch (Batch ID)
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "item_batches",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },

      gudang_id: {
        // ✅ Kolom yang menunjuk ke ItemBatch (Batch ID)
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "gudangs",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },

      // ✅ KOLOM BARU: system_stock (Stok Sistem yang menjadi basis perbandingan)
      system_stock: {
        type: DataTypes.INTEGER,
        allowNull: false, // Wajib diisi saat mencatat opname
        defaultValue: 0,
        comment: "Stok sistem yang tercatat saat opname dilakukan",
      },

      actual_stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Jumlah stok sebenarnya saat opname",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Catatan tambahan dari hasil opname",
      },
      opname_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "Tanggal dilakukan opname stok",
      },
    },
    {
      sequelize,
      modelName: "Opname",
      tableName: "opnames",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Opname;
};
