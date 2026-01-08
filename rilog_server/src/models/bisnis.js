'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bisnis extends Model {
    static associate(models) {
      // ✅ Bisnis memiliki banyak User
      Bisnis.hasMany(models.User, {
        foreignKey: 'bisnis_id',
        as: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // ✅ Bisnis memiliki banyak Gudang
      Bisnis.hasMany(models.Gudang, {
        foreignKey: 'bisnis_id',
        as: 'gudangs',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // ✅ Bisnis memiliki banyak Notifikasi
      Bisnis.hasMany(models.Notifikasi, {
        foreignKey: 'bisnis_id',
        as: 'notifikasis',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // ✅ Bisnis memiliki banyak Pengajuan Pembayaran
      Bisnis.hasMany(models.Pengajuan_Pembayaran, {
        foreignKey: 'bisnis_id',
        as: 'pengajuanPembayaran',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // ✅ Bisnis berlangganan satu Sub_plan
      Bisnis.belongsTo(models.Sub_plan, {
        foreignKey: 'sub_plan_id',
        as: 'subPlan',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Bisnis.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      nama_bisnis: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nama bisnis yang terdaftar',
      },
      tipe_bisnis: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Jenis bisnis (misal: ritel, grosir, manufaktur)',
      },
      sub_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'sub_plans',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Paket langganan bisnis',
      },
      sub_status: {
        // ✅ UPDATE: Tambahkan 'trial'
        type: DataTypes.ENUM('aktif', 'nonaktif','suspended'),
        allowNull: false,
        // ✅ UPDATE: Default jadi 'trial' karena daftar langsung aktif
        defaultValue: 'aktif', 
      },
      sub_start: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sub_end: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Bisnis',
      tableName: 'bisnis',
      underscored: true,
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (bisnis, options) => {
          // Jika statusnya trial dan tanggal belum diisi, set otomatis 14 hari
          if (bisnis.sub_status === 'trial' && !bisnis.sub_end) {
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(now.getDate() + 14); // Tambah 14 hari

            bisnis.sub_start = now;
            bisnis.sub_end = endDate;
          }
        }
      }
    }
  ); 
  return Bisnis;
};
