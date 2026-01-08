'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    // Query JOIN untuk mendapatkan item_id dan gudang_id
    const batches = await queryInterface.sequelize.query(
      `SELECT 
         b.id AS batch_id, 
         b.item_id, 
         i.gudang_id 
       FROM item_batches AS b
       JOIN items AS i ON b.item_id = i.id
       ORDER BY b.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      'SELECT id, name FROM users ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!batches.length || !users.length) {
      console.warn('⚠️ Seeder transactions dilewati karena item_batches atau users belum ada.');
      return;
    }

    console.log('✅ Data referensi ditemukan:');
    console.log(`   Item Batches: ${batches.length}, Users: ${users.length}`);

    const transactions = [
      {
        // TRANSAKSI 1: MASUK (Perlu Supplier)
        gudang_id: batches[0]?.gudang_id || null, 
        item_batch_id: batches[0]?.batch_id || null,
        user_id: users[0]?.id || null,
        type: 'MASUK', 
        quantity: 10,
        // ⬇️ TAMBAHAN: Supplier pindah ke sini
        supplier: 'PT Elektronik Jaya', 
        customer: null,
        pic: 'asep',
        notes: 'Penambahan stok baru dari supplier',
        created_at: new Date('2024-03-01T08:30:00Z'),
        updated_at: new Date('2024-03-01T08:30:00Z'),
        deleted_at: null,
      },
      {
        // TRANSAKSI 2: KELUAR (Perlu Customer)
        gudang_id: batches[1]?.gudang_id || null,
        item_batch_id: batches[1]?.batch_id || null,
        user_id: users[1]?.id || users[0]?.id || null,
        type: 'KELUAR',
        quantity: 5,
        supplier: null, // Keluar tidak ada supplier
        customer: 'Bahlil',
        pic: 'ipin',
        notes: 'Penjualan ke pelanggan retail',
        created_at: new Date('2024-03-02T14:15:00Z'),
        updated_at: new Date('2024-03-02T14:15:00Z'),
        deleted_at: null,
      },
      {
        // TRANSAKSI 3: KELUAR
        gudang_id: batches[2]?.gudang_id || null,
        item_batch_id: batches[2]?.batch_id || null,
        user_id: users[2]?.id || users[0]?.id || null,
        type: 'KELUAR',
        quantity: 20,
        supplier: null,
        customer: 'Syahroni',
        pic: 'upin',
        notes: 'Pengiriman ke proyek konstruksi',
        created_at: new Date('2024-03-04T09:20:00Z'),
        updated_at: new Date('2024-03-04T09:20:00Z'),
        deleted_at: null,
      },
      {
        // TRANSAKSI 4: KELUAR
        gudang_id: batches[3]?.gudang_id || null,
        item_batch_id: batches[3]?.batch_id || null,
        user_id: users[3]?.id || users[1]?.id || null,
        type: 'KELUAR',
        quantity: 15,
        supplier: null,
        customer: 'Fans King MU',
        pic: 'bambang',
        notes: 'Penjualan grosir ke toko bangunan',
        created_at: new Date('2024-03-06T13:30:00Z'),
        updated_at: new Date('2024-03-06T13:30:00Z'),
        deleted_at: null,
      },
    ];

    const validTransactions = transactions.filter(
      t => t.gudang_id && t.item_batch_id && t.user_id
    );

    if (validTransactions.length === 0) {
       console.warn('⚠️ Tidak ada data transaksi valid untuk di-seed.');
       return;
    }

    await queryInterface.bulkInsert('transactions', validTransactions, {});
    console.log(`✅ Seeder transaction berhasil dijalankan (${validTransactions.length} data dibuat).`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transactions', null, {});
    console.log('🗑️ Semua data transaction berhasil dihapus.');
  },
};