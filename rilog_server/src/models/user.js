'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User milik satu Bisnis
      User.belongsTo(models.Bisnis, {
        foreignKey: 'bisnis_id',
        as: 'bisnis',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // User memiliki banyak Transaction
      User.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions',
        onDelete: 'CASCADE',
      });

      // User memiliki banyak Opname
      User.hasMany(models.Opname, {
        foreignKey: 'user_id',
        as: 'opnames',
        onDelete: 'CASCADE',
      });

      // User memiliki banyak ActivityLog
      User.hasMany(models.ActivityLog, {
        foreignKey: 'user_id',
        as: 'activityLogs',
        onDelete: 'CASCADE',
      });

      // User memiliki banyak Notifikasi
      User.hasMany(models.Notifikasi, {
        foreignKey: 'user_id',
        as: 'notifikasis',
        onDelete: 'CASCADE',
      });

      // User memiliki banyak OTP
      User.hasMany(models.Otp_verify, {
        foreignKey: 'user_id',
        as: 'otpVerifies',
        onDelete: 'CASCADE',
      });

      // User diundang oleh user lain
      User.belongsTo(models.User, {
        foreignKey: 'invited_by',
        as: 'inviter',
      });

      // User memiliki banyak pengajuan pembayaran
      User.hasMany(models.Pengajuan_Pembayaran, {
        foreignKey: 'user_id',
        as: 'pengajuanPembayaran',
        onDelete: 'CASCADE',
      });

      // Relasi Many-to-Many user <-> gudang
      User.belongsToMany(models.Gudang, {
        through: models.User_gudang_access,
        foreignKey: 'user_id',
        otherKey: 'gudang_id',
        as: 'gudangs',
        onDelete: 'CASCADE',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      invite_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invited_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'staff'),
        allowNull: false,
        defaultValue: 'staff',
      },

      // 🟢 FIELD INI DITAMBAHKAN AGAR SESUAI MIGRATION
      status: {
        type: DataTypes.ENUM('pending', 'active', 'suspended'),
        allowNull: false,
        defaultValue: 'pending',
      },
      foto_profil: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      bisnis_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'bisnis',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      paranoid: false,
    }
  );

  return User;
};