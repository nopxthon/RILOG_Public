'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 🔹 Daftar Kategori Lengkap (Sesuai Dropdown HTML)
    const categories = [
      // Makanan & Minuman
      "Minuman",
      "Makanan",
      "Bahan Masak",
      
      // Kesehatan & Kecantikan
      "Kesehatan & Kecantikan",
      "Kosmetik",
      "Obat-obatan",
      
      // Fashion
      "Fashion & Aksesoris",
      
      // Elektronik
      "Elektronik",
      "Komputer & Laptop",
      "Smartphone & Tablet",
      
      // Rumah Tangga
      "Peralatan Rumah Tangga",
      "Perabot Rumah",
      
      // Kebutuhan Khusus
      "Alat Tulis",
      "Bayi & Anak",
      "Otomotif",
      "Buku & Alat Tulis",
      "Olahraga & Outdoor",
      "Mainan & Hobi"
    ];

    // 🔹 Cek kategori yang sudah ada di database (hindari duplikasi)
    const existingCategories = await queryInterface.sequelize.query(
      'SELECT category_name FROM kategoris;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingNames = existingCategories.map(c => c.category_name);
    
    // Hanya ambil kategori yang BELUM ada di database
    const newCategories = categories
      .filter(name => !existingNames.includes(name))
      .map(name => ({
        category_name: name,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null, // ✅ Sesuai paranoid model
      }));

    // 🔹 Masukkan data jika ada yang baru
    if (newCategories.length > 0) {
      await queryInterface.bulkInsert('kategoris', newCategories, {});
      console.log(`✅ Seeder kategori berhasil dijalankan (${newCategories.length} kategori baru ditambahkan).`);
    } else {
      console.log('ℹ️ Semua kategori sudah ada. Tidak ada data baru yang dimasukkan.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Hapus semua data saat undo
    await queryInterface.bulkDelete('kategoris', null, {});
    console.log('🗑️ Semua kategori berhasil dihapus.');
  },
};