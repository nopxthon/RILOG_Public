'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /* --- SEMENTARA DINONAKTIFKAN KARENA ERROR ---

    // (Semua kode lama Anda yang error ada di dalam blok komentar ini)

    // Ambil data lengkap dari database
    const transactions = await queryInterface.sequelize.query(
      `SELECT 
        t.id, t.type, t.quantity, t.user_id, t.customer, t.notes, t.created_at,
        u.name as user_name,
        i.item_name, i.satuan,
        ib.supplier
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN item_batches ib ON t.item_batch_id = ib.id
        LEFT JOIN items i ON ib.item_id = i.id
        ORDER BY t.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const opnames = await queryInterface.sequelize.query(
      `SELECT 
        o.id, o.actual_stok, o.opname_date, o.notes, o.user_id,
        u.name as user_name,
        i.item_name, i.satuan
        FROM opnames o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN items i ON o.item_id = i.id
        ORDER BY o.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const items = await queryInterface.sequelize.query(
      `SELECT 
        i.id, i.item_name, i.min_stok, i.max_stok, i.satuan,
        i.user_id,
        i.created_at,
        u.name as user_name
        FROM items i
        LEFT JOIN users u ON i.user_id = u.id
        ORDER BY i.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      'SELECT id, name FROM users ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if ((!transactions.length && !opnames.length && !items.length) || !users.length) {
      console.warn('⚠️ Seeder activity_log dilewati karena data referensi belum ada.');
      return;
    }

    const activityLogs = [];

    // 🔹 Activity Logs untuk TRANSACTIONS (Stok Masuk/Keluar)
    transactions.forEach((trx) => {
      if (!trx.user_id || !trx.user_name) return;
      
      const isStokMasuk = trx.type === 'IN';
      const activityType = isStokMasuk ? 'STOK_MASUK' : 'STOK_KELUAR';
      let message = '';
      
      if (isStokMasuk) {
        message = `[${trx.user_name}] melakukan Stok masuk: ${trx.quantity} ${trx.satuan || 'unit'} ${trx.item_name} dari ${trx.supplier || 'supplier'}`;
      } else {
        message = `[${trx.user_name}] melakukan Stok keluar: ${trx.quantity} ${trx.satuan || 'unit'} ${trx.item_name} untuk ${trx.customer || 'customer'}`;
      }

      activityLogs.push({
        message: message,
        type: activityType,
        user_id: trx.user_id,
        table_name: 'transactions',
        record_id: trx.id.toString(),
        created_at: trx.created_at || new Date(),
        updated_at: trx.created_at || new Date()
      });
    });

    // 🔹 Activity Logs untuk OPNAMES (Stock Opname)
    opnames.forEach((opname) => {
      if (!opname.user_id || !opname.user_name) return;

      const stokSistem = 100; // Contoh
      const selisih = opname.actual_stok - stokSistem;
      const status = selisih === 0 ? 'sesuai' : 
                   selisih > 0 ? `lebih ${selisih}` : `kurang ${Math.abs(selisih)}`;

      const message = `[${opname.user_name}] melakukan stock opname: ${opname.item_name} ${status} ${opname.satuan || 'unit'}`;

      activityLogs.push({
        message: message,
        type: 'OPNAME', // Sesuai permintaan Anda
        user_id: opname.user_id,
        table_name: 'opnames',
        record_id: opname.id.toString(),
        created_at: opname.opname_date || new Date(),
        updated_at: opname.opname_date || new Date()
      });
    });

    // 🔹 Activity Logs untuk ITEM CREATION (Penambahan Item Baru)
    items.forEach((item) => {
      if (item.user_id && item.user_name) {
        const message = `[${item.user_name}] menambah item baru: ${item.item_name} (min: ${item.min_stok}, max: ${item.max_stok} ${item.satuan})`;

        activityLogs.push({
          message: message,
          type: 'TAMBAH BARANG', // Sesuai permintaan Anda
          user_id: item.user_id,
          table_name: 'items',
          record_id: item.id.toString(),
          created_at: item.created_at || new Date(),
          updated_at: item.created_at || new Date()
        });
      }
    });

    // 🔹 Activity Logs untuk USER MANAGEMENT (Contoh)
    const userActivities = [
        { user: users[0], action: 'login ke sistem' },
        { user: users[1], action: 'mengupdate profil user' },
        { user: users[2], action: 'melihat laporan stok' }
    ];
    
    userActivities.forEach((activity, index) => {
      if (!activity.user) return;
      activityLogs.push({
        message: `[${activity.user.name}] ${activity.action}`,
        type: 'sistem', // Kita set 'sistem' agar lolos validasi ENUM
        user_id: activity.user.id,
        table_name: 'users',
        record_id: activity.user.id.toString(),
        created_at: new Date(Date.now() - ((index + 40) * 3600000)),
        updated_at: new Date(Date.now() - ((index + 40) * 3600000))
      });
    });

    // --- Eksekusi Insert ---
    if (activityLogs.length > 0) {
      activityLogs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      await queryInterface.bulkInsert('activity_logs', activityLogs, {});
      
      console.log(`✅ Seeder activity_logs berhasil dijalankan (${activityLogs.length} data dibuat).`);
      console.log('📝 Breakdown data:');
      console.log(`   - Transactions: ${transactions.filter(t => t.user_id && t.user_name).length} activities`);
      console.log(`   - Opnames: ${opnames.filter(o => o.user_id && o.user_name).length} activities`);
      console.log(`   - Items: ${items.filter(i => i.user_id && i.user_name).length} activities`);
      console.log(`   - User Activities: ${userActivities.length} activities`);
    } else {
      console.warn('⚠️ Tidak ada data activity log yang dibuat.');
    }

    --- AKHIR DARI BLOK NONAKTIF --- */
    
    // Ini akan berjalan dan memberitahu Anda bahwa seeder-nya dilewati
    console.log('🟡 Seeder activity_log sengaja DILEWATI.');
  },

  async down(queryInterface, Sequelize) {
    /* --- SEMENTARA DINONAKTIFKAN ---
      await queryInterface.bulkDelete('activity_logs', null, {});
      console.log('🗑️ Semua data activity_logs berhasil dihapus.');
    --- AKHIR DARI BLOK NONAKTIF --- */

    console.log('🟡 Seeder activity_log (down) sengaja DILEWATI.');
  },
};