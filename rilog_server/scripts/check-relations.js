// scripts/check-relations.js
const db = require('../src/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected.');

    // HATI-HATI: pilih { alter: true } untuk menyesuaikan tabel tanpa drop, 
    // atau { force: true } untuk drop+recreate (berbahaya di prod).
    await db.sequelize.sync({ alter: true });
    console.log('✅ All models synchronized successfully.');

    // Print daftar model dan asosiasi programatis
    console.log('\nModels loaded:');
    console.log(Object.keys(db).filter(k => k !== 'sequelize' && k !== 'Sequelize'));

    console.log('\nAssociation summary (per model):');
    for (const m of Object.keys(db)) {
      if (db[m] && db[m].associations) {
        console.log(`\n- ${m}:`);
        console.log(Object.keys(db[m].associations));
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
