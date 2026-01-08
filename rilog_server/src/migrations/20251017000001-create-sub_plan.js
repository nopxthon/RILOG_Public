"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sub_plans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama_paket: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipe: {
        type: Sequelize.ENUM("monthly", "yearly", "trial", "promo"),
        defaultValue: "monthly",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Defaultnya nyala
        allowNull: false,
      },

      harga: {
        // Menggunakan DECIMAL(15, 2) lebih aman untuk mata uang daripada FLOAT
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      durasi_hari: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Durasi aktif dalam hari (misal: 14, 30, 365)",
      },
      limit_gudang: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Batas jumlah gudang",
      },
      limit_staff: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Batas jumlah staff",
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"), // Standar Sequelize
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"), // Standar Sequelize
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sub_plans");
  },
};
