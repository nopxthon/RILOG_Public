'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
    static associate(models) {
      // ✅ Satu kategori memiliki banyak item
      Kategori.hasMany(models.Item, {
        foreignKey: 'category_id',
        as: 'items',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Kategori.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Nama kategori item (misal: bahan pokok, elektronik, alat tulis, dsb)',
      },
    },
    {
      sequelize,
      modelName: 'Kategori',
      tableName: 'kategoris',
      underscored: true,
      timestamps: true, // ✅ otomatis: created_at & updated_at
      paranoid: true,   // ✅ aktifkan soft delete (deleted_at)
    }
  );

  return Kategori;
};
