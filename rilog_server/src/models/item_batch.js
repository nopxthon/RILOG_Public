'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemBatch extends Model {
    static associate(models) {
      ItemBatch.belongsTo(models.Item, {
        foreignKey: 'item_id',
        as: 'item',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      ItemBatch.hasMany(models.Transaction, {
        foreignKey: 'item_batch_id',
        as: 'transactions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ItemBatch.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'items', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      //  supplier: DIHAPUS (Pindah ke Transaction)
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: 'Jumlah item dalam batch',
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: 'ItemBatch',
      tableName: 'item_batches',
      underscored: true,
      timestamps: true,
      paranoid: true, // ✅ soft delete aktif
    }
  );

  return ItemBatch;
};