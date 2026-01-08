'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User_gudang_access extends Model {
    static associate(models) {
      User_gudang_access.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      User_gudang_access.belongsTo(models.Gudang, {
        foreignKey: 'gudang_id',
        as: 'gudang',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  User_gudang_access.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gudang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin_gudang', 'staff_gudang', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      status: {
        type: DataTypes.ENUM('aktif', 'nonaktif'),
        allowNull: false,
        defaultValue: 'aktif',
      },
    },
    {
      sequelize,
      modelName: 'User_gudang_access',
      tableName: 'user_gudang_accesses',
      underscored: true,
      timestamps: true,     // created_at, updated_at otomatis
      paranoid: true,       // deleted_at otomatis
    }
  );

  return User_gudang_access;
};
