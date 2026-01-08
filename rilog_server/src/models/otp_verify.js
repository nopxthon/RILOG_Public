'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Otp_verify extends Model {
    static associate(models) {
      Otp_verify.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Otp_verify.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      otp_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      // ⭐ WAJIB ADA — kamu pakai ini untuk token aktivasi
      activation_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // ⭐ WAJIB ADA — migration kamu pakai ENUM
      tipe: {
        type: DataTypes.ENUM("otp", "activation"),
        allowNull: false,
        defaultValue: "otp",
      },

      expired_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Otp_verify",
      tableName: "otp_verifies",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Otp_verify;
};
