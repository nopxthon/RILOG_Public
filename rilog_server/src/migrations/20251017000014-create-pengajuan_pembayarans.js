'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pengajuan_pembayarans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // ✅ 1. Relasi ke Bisnis
      bisnis_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'bisnis', // Pastikan nama tabel di DB adalah 'bisnis'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // ✅ 2. Relasi ke User (Baru)
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users', // Pastikan nama tabel di DB adalah 'users'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // ✅ 3. Relasi ke Sub Plan
      sub_plan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sub_plans', // Pastikan nama tabel di DB adalah 'sub_plans'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      
      // --- DATA TRANSAKSI ---
      tanggal_pengajuan: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      // ✅ 4. Snapshot Harga (PENTING)
      total_bayar: {
        type: Sequelize.DECIMAL(15, 2), // Menggunakan DECIMAL untuk uang
        allowNull: false,
        defaultValue: 0,
        comment: 'Snapshot harga paket saat dibeli',
      },
      // ✅ 5. Snapshot Durasi (PENTING)
      durasi_paket: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Snapshot durasi hari paket saat dibeli',
      },

      // --- VERIFIKASI MANUAL ---
      // ✅ 6. Identitas Pengirim
      nama_pengirim: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_pengirim: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bukti_pembayaran: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // --- STATUS ---
      status: {
        type: Sequelize.ENUM('pending', 'disetujui', 'ditolak'),
        allowNull: false,
        defaultValue: 'pending',
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Alasan jika ditolak atau catatan user',
      },

      // --- TIMESTAMPS ---
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pengajuan_pembayarans');
  },
};