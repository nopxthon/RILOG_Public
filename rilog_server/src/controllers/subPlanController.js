'use strict';
const { Sub_plan } = require('../models');

const subPlanController = {
  // =================================================
  // 🟢 PUBLIC ROUTES (Untuk User / Landing Page)
  // =================================================

  // 1. Ambil Semua Paket (Hanya yang AKTIF)
  async getAllPlans(req, res) {
    try {
      const plans = await Sub_plan.findAll({
        where: {
          is_active: true // <--- Filter Wajib: Hanya tampilkan yang aktif
        },
        order: [
             ['harga', 'ASC'] 
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: plans,
      });
    } catch (error) {
      console.error('Get Plans Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Gagal mengambil data paket',
      });
    }
  },

  // 2. Ambil Detail 1 Paket
  async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const plan = await Sub_plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({ message: 'Paket tidak ditemukan' });
      }

      return res.status(200).json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Server error' });
    }
  },

  // =================================================
  // 🔴 ADMIN ROUTES (Untuk Dashboard Admin)
  // =================================================

  // 3. Ambil SEMUA Paket (Termasuk Non-Aktif & Hidden)
  async getAdminPlans(req, res) {
    try {
      const plans = await Sub_plan.findAll({
        order: [['created_at', 'DESC']] // Urutkan dari yang terbaru
      });
      
      return res.status(200).json({
        status: 'success',
        data: plans
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 4. Tambah Paket Baru
  async createPlan(req, res) {
    try {
      const { 
        nama_paket, 
        tipe,        // monthly, yearly, trial
        harga, 
        durasi_hari, 
        limit_gudang, 
        limit_staff, 
        deskripsi,
        is_active    // true/false
      } = req.body;

      const newPlan = await Sub_plan.create({
        nama_paket,
        tipe,
        harga,
        durasi_hari,
        limit_gudang,
        limit_staff,
        deskripsi,
        is_active: is_active !== undefined ? is_active : true // Default true jika tidak dikirim
      });

      return res.status(201).json({
        status: 'success',
        message: 'Paket berhasil dibuat',
        data: newPlan
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 5. Update Data Paket (Nama, Harga, Tipe, dll)
  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const { 
        nama_paket, 
        tipe,
        harga, 
        durasi_hari, 
        limit_gudang, 
        limit_staff, 
        deskripsi,
        is_active 
      } = req.body;

      const plan = await Sub_plan.findByPk(id);
      if (!plan) return res.status(404).json({ message: 'Paket tidak ditemukan' });

      await plan.update({
        nama_paket,
        tipe,
        harga,
        durasi_hari,
        limit_gudang,
        limit_staff,
        deskripsi,
        is_active
      });

      return res.status(200).json({
        status: 'success',
        message: 'Paket berhasil diperbarui',
        data: plan
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 6. UPDATE STATUS ON/OFF (Switch)
  // Endpoint khusus agar lebih ringan untuk toggle status
  async updatePlanStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body; // Expect: { is_active: true/false }

      const plan = await Sub_plan.findByPk(id);
      if (!plan) return res.status(404).json({ message: 'Paket tidak ditemukan' });

      await plan.update({ is_active });

      return res.status(200).json({
        status: 'success',
        message: `Status paket berhasil diubah menjadi ${is_active ? 'Aktif' : 'Non-Aktif'}`,
        data: {
            id: plan.id,
            is_active: plan.is_active
        }
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },
  
  // 7. Hapus Paket
  async deletePlan(req, res) {
    try {
        const { id } = req.params;
        const plan = await Sub_plan.findByPk(id);
        if (!plan) return res.status(404).json({ message: 'Paket tidak ditemukan' });
  
        await plan.destroy();
  
        return res.status(200).json({
          status: 'success',
          message: 'Paket berhasil dihapus'
        });
      } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
      }
  }
};

module.exports = subPlanController;