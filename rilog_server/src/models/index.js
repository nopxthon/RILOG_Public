'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// ✅ Pastikan konfigurasi database tersedia
const configPath = path.join(__dirname, '..', 'config', 'config.js');
if (!fs.existsSync(configPath)) {
  console.error('❌ File konfigurasi database tidak ditemukan di:', configPath);
  process.exit(1);
}
const config = require(configPath)[env];

// ✅ Objek utama untuk menampung semua model
const db = {};
let sequelize;

// ✅ Inisialisasi koneksi Sequelize dengan environment variable atau konfigurasi biasa
try {
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );
  }
  console.log(`🌐 Sequelize initialized for environment: ${env}`);
} catch (error) {
  console.error('❌ Gagal menginisialisasi Sequelize:', error);
  process.exit(1);
}

// ✅ Muat semua model dalam folder ini, kecuali file ini sendiri
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.endsWith('.test.js')
    );
  })
  .forEach((file) => {
    try {
      const model = require(path.join(__dirname, file))(
        sequelize,
        Sequelize.DataTypes
      );
      db[model.name] = model;
    } catch (err) {
      console.error(`⚠️ Gagal memuat model: ${file}`, err);
    }
  });

// ✅ Tampilkan model yang berhasil dimuat
console.log('📦 Model yang dimuat:', Object.keys(db).join(', ') || 'Tidak ada model ditemukan.');

// ✅ Jalankan semua asosiasi antar model (jika ada)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ✅ Tes koneksi database (hanya di environment development)
if (env === 'development') {
  sequelize
    .authenticate()
    .then(() => console.log('✅ Koneksi database berhasil dibuat.'))
    .catch((err) => console.error('❌ Gagal terhubung ke database:', err.message));
}

// ✅ (Opsional) Sinkronisasi otomatis — hati-hati jangan aktif di production
// if (env === 'development') {
//   sequelize
//     .sync({ alter: true })
//     .then(() => console.log('🔄 Semua model berhasil disinkronisasi.'))
//     .catch((err) => console.error('❌ Gagal sinkronisasi model:', err));
// }

// ✅ Ekspor semua instance dan model
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
