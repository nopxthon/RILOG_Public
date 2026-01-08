const express = require('express');
const cors = require('cors');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Routes utama
app.get('/', (req, res) => {
  res.json({ message: '🚀 API connected successfully!' });
});

// Tambahkan route lain di sini nanti
// const transactionRoutes = require('./routes/transactionRoutes');
// app.use('/api/transactions', transactionRoutes);

module.exports = app;
