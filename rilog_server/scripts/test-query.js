// scripts/test-query.js
require('dotenv').config();
const db = require('../src/models');

(async () => {
  try {
    console.log('🧠 Testing database and associations...\n');

    // Coba konek ke database
    await db.sequelize.authenticate();
    console.log('✅ Database connected.');

    // Sinkronisasi struktur model dengan database
    await db.sequelize.sync({ alter: true });
    console.log('✅ Models synchronized.\n');

    // ====== INSERT DATA DUMMY ======
    console.log('🧩 Inserting sample data...\n');

    // 1️⃣ User
    const user = await db.User.create({
      email: 'admin@example.com',
      password: '123456',
      role: 'admin',
      bisnis_id: null,
    });

    // 2️⃣ Item
    const item = await db.Item.create({
      item_name: 'Ban Mobil',
      stok: 10,
      min_stok: 5,
      max_stok: 100,
      satuan: 'pcs',
      category_id: null,
      warehouse_id: null,
      user_id: user.id,
    });

    // 3️⃣ Transaction
    const transaction = await db.Transaction.create({
      transaction_date: new Date(),
      item_id: item.id,
      user_id: user.id,
      notes: 'Transaksi awal stok',
    });

    // 4️⃣ Transaction_in
    const t_in1 = await db.Transaction_in.create({
      transaction_id: transaction.id,
      supplier: 'Supplier A',
      quantity_in: 20,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 hari
    });

    const t_in2 = await db.Transaction_in.create({
      transaction_id: transaction.id,
      supplier: 'Supplier B',
      quantity_in: 15,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // +60 hari
    });

    // 5️⃣ Transaction_out
    const t_out = await db.Transaction_out.create({
      transaction_id: transaction.id,
      quantity_out: 5,
      pic: 'Operator A',
    });

    console.log('✅ Dummy data inserted.\n');

    // ====== QUERY TEST RELASI ======
    console.log('🔍 Fetching transaction with relations...\n');

    const fullTransaction = await db.Transaction.findOne({
      where: { id: transaction.id },
      include: [
        { model: db.Item, as: 'item' },
        { model: db.User, as: 'user' },
        { model: db.Transaction_in, as: 'transactionIns' },
        { model: db.Transaction_out, as: 'transactionOuts' },
        { model: db.Activity_log, as: 'activityLogs' }, // kosong karena belum ada log
      ],
    });

    // ====== OUTPUT KE TERMINAL ======
    console.log('🧾 Transaction Details:');
    console.log({
      id: fullTransaction.id,
      date: fullTransaction.transaction_date,
      notes: fullTransaction.notes,
      item: fullTransaction.item?.item_name,
      user: fullTransaction.user?.email,
      transaction_in_count: fullTransaction.transactionIns?.length || 0,
      transaction_out_count: fullTransaction.transactionOuts?.length || 0,
    });

    console.log('\n🔗 Relation Data (Transaction_in):');
    fullTransaction.transactionIns.forEach((t, i) => {
      console.log(`  #${i + 1} Supplier: ${t.supplier}, Qty: ${t.quantity_in}`);
    });

    console.log('\n🔗 Relation Data (Transaction_out):');
    fullTransaction.transactionOuts.forEach((t, i) => {
      console.log(`  #${i + 1} PIC: ${t.pic}, Qty: ${t.quantity_out}`);
    });

    console.log('\n✅ All relation queries executed successfully.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error testing relations:\n', err);
    process.exit(1);
  }
})();
