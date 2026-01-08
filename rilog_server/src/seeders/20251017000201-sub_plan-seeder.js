'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Angka representasi unlimited (pastikan logic aplikasi menganggap angka ini sebagai unlimited)
    const UNLIMITED = 1000000; 

    await queryInterface.bulkInsert('sub_plans', [
      // ==========================
      // 1. TRIAL (Gratis)
      // ==========================
      {
        nama_paket: 'Trial',
        tipe: 'trial', // <--- Penting
        harga: 0,
        durasi_hari: 14,
        limit_gudang: 2,
        limit_staff: 1,
        deskripsi: 'Akses trial 14 hari untuk pengguna baru',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================
      // 2. PAKET BASIC
      // ==========================
      {
        nama_paket: 'Basic', // Nama disamakan agar mudah dipairing
        tipe: 'monthly',     // Pembedanya disini
        harga: 26000,
        durasi_hari: 30,
        limit_gudang: 1,
        limit_staff: 1,
        deskripsi: 'Cocok untuk usaha mikro, kecil dan menengah',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nama_paket: 'Basic',
        tipe: 'yearly',
        harga: 265000,
        durasi_hari: 365,
        limit_gudang: 1,
        limit_staff: 1,
        deskripsi: 'Hemat 15% dengan berlangganan setahun',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================
      // 3. PAKET PRO
      // ==========================
      {
        nama_paket: 'Pro',
        tipe: 'monthly',
        harga: 65000,
        durasi_hari: 30,
        limit_gudang: 5,
        limit_staff: 10,
        deskripsi: 'Cocok untuk bisnis menengah yang punya beberapa cabang',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nama_paket: 'Pro',
        tipe: 'yearly',
        harga: 663000,
        durasi_hari: 365,
        limit_gudang: 5,
        limit_staff: 10,
        deskripsi: 'Hemat 15% dengan berlangganan setahun',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================
      // 4. PAKET UNLIMITED (Enterprise)
      // ==========================
      {
        nama_paket: 'Unlimited', // Sudah diubah dari Enterprise ke Unlimited
        tipe: 'monthly',
        harga: 182000,
        durasi_hari: 30,
        limit_gudang: UNLIMITED,
        limit_staff: UNLIMITED,
        deskripsi: 'Cocok untuk perusahaan besar dengan banyak gudang/cabang',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nama_paket: 'Unlimited',
        tipe: 'yearly',
        harga: 1856000,
        durasi_hari: 365,
        limit_gudang: UNLIMITED,
        limit_staff: UNLIMITED,
        deskripsi: 'Hemat 15% dengan berlangganan setahun',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sub_plans', null, {});
  }
};