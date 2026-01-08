"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sub_plan extends Model {
    static associate(models) {
      // Relasi ke Bisnis
      Sub_plan.hasMany(models.Bisnis, {
        foreignKey: "sub_plan_id",
        as: "bisnisList",
      });

      // Relasi ke Pengajuan Pembayaran
      Sub_plan.hasMany(models.Pengajuan_Pembayaran, {
        foreignKey: "sub_plan_id",
        as: "pengajuanPembayaran",
      });
    }
  }

  Sub_plan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_paket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipe: {
        type: DataTypes.ENUM("monthly", "yearly", "trial", "promo"),
        defaultValue: "monthly",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      harga: {
        type: DataTypes.DECIMAL(15, 2), // Menggunakan DECIMAL agar aman untuk mata uang
        allowNull: false,
        defaultValue: 0,
      },
      // 🟢 UBAH: Gunakan Hari, bukan Bulan (agar bisa input 14 hari)
      durasi_hari: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Durasi aktif dalam hari (14, 30, 365)",
      },
      // 🟢 TAMBAH: Limit agar sistem bisa membatasi akses
      limit_gudang: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          "Jumlah maksimal gudang. Isi angka besar (misal 9999) untuk unlimited",
      },
      limit_staff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          "Jumlah maksimal staff. Isi angka besar (misal 9999) untuk unlimited",
      },
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Sub_plan",
      tableName: "sub_plans",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Sub_plan;
};
