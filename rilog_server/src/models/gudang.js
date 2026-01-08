"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Gudang extends Model {
    static associate(models) {
      // Gudang milik satu Bisnis
      Gudang.belongsTo(models.Bisnis, {
        foreignKey: "bisnis_id",
        as: "bisnis",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      // Gudang memiliki banyak Item
      Gudang.hasMany(models.Item, {
        foreignKey: "gudang_id",
        as: "items",
        onDelete: "CASCADE",
      });

      // Gudang memiliki banyak Opname
      Gudang.hasMany(models.Opname, {
        foreignKey: "gudang_id",
        as: "opnames",
        onDelete: "CASCADE",
      });

      // Gudang memiliki banyak Transaction
      Gudang.hasMany(models.Transaction, {
        foreignKey: "gudang_id",
        as: "transactions",
        onDelete: "CASCADE",
      });

      // Many-to-many dengan User
      Gudang.belongsToMany(models.User, {
        through: models.User_gudang_access,
        foreignKey: "gudang_id",
        otherKey: "user_id",
        as: "users",
      });
    }
  }

  Gudang.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        // ❌ HAPUS onDelete & onUpdate dari sini (Penyebab Error)
      },

      // ✅ TAMBAHKAN INI (Wajib ada karena di associate ada foreignKey)
      bisnis_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "bisnis",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      nama_gudang: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      tipe_gudang: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      alamat_gudang: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Gudang",
      tableName: "gudangs",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Gudang;
};
