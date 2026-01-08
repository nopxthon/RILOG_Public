'use strict';
const { Superadmin } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  // 🟢 LOGIN KHUSUS SUPERADMIN
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 1. Validasi Input Kosong
      if (!username || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Username dan password wajib diisi',
        });
      }

      // 2. Cari Superadmin di Database
      const admin = await Superadmin.findOne({
        where: { username }
      });

      // 3. Cek User Ada atau Tidak
      if (!admin) {
        return res.status(401).json({
          status: 'error',
          message: 'Kredensial tidak valid', // Pesan umum biar aman
        });
      }

      // 4. Cek Password (Hash vs Input)
      const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password salah'
      });
    }

    // 🔥 PERBAIKAN: Samakan fallback dengan Controller User ('supersecretkey')
    const secretKey = process.env.JWT_SECRET || 'supersecretkey';

    const token = jwt.sign(
      { id: admin.id, role: 'superadmin' },
      secretKey,
      { expiresIn: '1d' }
    );

      // 6. Kirim Response ke Frontend
      return res.status(200).json({
        status: 'success',
        message: 'Login berhasil',
        data: {
          token: token,
          user: {
            id: admin.id,
            username: admin.username,
            role: 'superadmin',
            createdAt: admin.created_at
          }
        }
      });

    } catch (error) {
      console.error('Superadmin Login Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan internal server',
      });
    }
  },

  // 🔵 CEK PROFILE (Untuk memvalidasi token nanti)
  async getMe(req, res) {
    try {
      // req.user didapat dari middleware auth
      const admin = await Superadmin.findByPk(req.user.id, {
        attributes: { exclude: ['password'] } // Sembunyikan password
      });

      if (!admin) {
        return res.status(404).json({ status: 'error', message: 'Admin tidak ditemukan' });
      }

      res.json({
        status: 'success',
        data: admin
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  },

  async logout(req, res) {
    try {
      // Hapus Cookie dari sisi Server (jika ada)
      res.clearCookie('superToken');
      
      return res.status(200).json({
        status: 'success',
        message: 'Logout berhasil'
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Gagal logout' });
    }
  }
};
