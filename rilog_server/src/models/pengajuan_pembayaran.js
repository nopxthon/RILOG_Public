'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pengajuan_Pembayaran extends Model {
    static associate(models) {
      // ✅ Relasi ke Bisnis
      Pengajuan_Pembayaran.belongsTo(models.Bisnis, {
        foreignKey: 'bisnis_id',
        as: 'bisnis',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ✅ Relasi ke Sub_plan (Paket yang dipilih)
      Pengajuan_Pembayaran.belongsTo(models.Sub_plan, {
        foreignKey: 'sub_plan_id',
        as: 'subPlan',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ✅ Relasi ke User (Siapa yang bayar)
      Pengajuan_Pembayaran.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Pengajuan_Pembayaran.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // 1. Perbaikan Bug: bisnis_id hanya didefinisikan sekali
      bisnis_id: {
        type: DataTypes.INTEGER, // Pastikan tipe data sama dengan id di tabel Bisnis
        allowNull: true,
        references: {
          model: 'bisnis', // Sesuaikan dengan nama tabel bisnis Anda
          key: 'id',
        },
      },
      // 2. Perbaikan Bug: Tambahkan user_id
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users', // Sesuaikan dengan nama tabel users Anda
          key: 'id',
        },
      },
      sub_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'sub_plans',
          key: 'id',
        },
      },
      
      // --- KOLOM DATA TRANSAKSI ---
      tanggal_pengajuan: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      // 3. Tambahan Penting: Snapshot Harga saat beli
      total_bayar: {
        type: DataTypes.DECIMAL(15, 2), // Atau INTEGER jika tidak pakai koma
        allowNull: false,
        comment: 'Harga paket saat transaksi dibuat (Snapshot)',
      },
      // 4. Tambahan Penting: Snapshot Durasi
      durasi_paket: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 30,
         comment: 'Durasi hari paket saat dibeli',
      },

      // --- KOLOM VERIFIKASI MANUAL ---
      // 5. Tambahan: Identitas Pengirim untuk Cek Mutasi
      nama_pengirim: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama pemilik rekening pengirim',
      },
      bank_pengirim: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nama Bank pengirim (cth: BCA, Mandiri)',
      },
      bukti_pembayaran: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Path/URL gambar bukti transfer',
      },
      
      status: {
        type: DataTypes.ENUM('pending', 'disetujui', 'ditolak'),
        allowNull: false,
        defaultValue: 'pending',
      },
      keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Catatan admin jika ditolak, atau catatan user',
      }
    },
    {
      sequelize,
      modelName: 'Pengajuan_Pembayaran',
      tableName: 'pengajuan_pembayarans',
      underscored: true,
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Pengajuan_Pembayaran;
};