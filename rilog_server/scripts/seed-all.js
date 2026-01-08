// scripts/seed-all.js
const { execSync } = require('child_process');

const seeders = [
  'sub_plan-seeder.js',
  'superadmin-seeder.js', 
  'bisnis-seeder.js',
  'user-seeder.js',
  'admin-seeder.js',
  'staff-seeder.js',
  'gudang-seeder.js',
  'kategori-seeder.js',
  'item-seeder.js',
  'transaction-seeder.js',
  'transaction_in-seeder.js',
  'transaction_out-seeder.js', 
  'opname-seeder.js',
  'activity_log-seeder.js',
  'notifikasi-seeder.js',
  'pengajuan_pembayaran-seeder.js'
];

console.log('🚀 Running seeders in correct order...');

seeders.forEach(seeder => {
  try {
    console.log(`📦 Seeding: ${seeder}`);
    execSync(`npx sequelize-cli db:seed --seed ${seeder}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Error seeding ${seeder}:`, error.message);
    process.exit(1);
  }
});

console.log('✅ All seeders completed successfully!');