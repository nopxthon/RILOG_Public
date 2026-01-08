'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LogVerifikasi extends Model {
    static associate(models) {
      // Relasi ke User (Admin/Superadmin yang melakukan aksi)
      LogVerifikasi.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  
  LogVerifikasi.init({
    user_id: DataTypes.INTEGER,
    role: DataTypes.STRING,      // Role pelaku (Super Admin / Admin)
    aksi: DataTypes.STRING,      // "Approve", "Reject", "Delete"
    keterangan: DataTypes.TEXT,  // Detail aktivitas
    waktu: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'LogVerifikasi', // Nama Model di Sequelize (biasanya PascalCase)
    tableName: 'log_verifikasis', // Nama Tabel di Database
    underscored: true,
    timestamps: false, // Kita pakai kolom 'waktu' manual, tidak butuh created_at/updated_at bawaan
    createdAt: 'waktu' 
  });
  
  return LogVerifikasi;
};