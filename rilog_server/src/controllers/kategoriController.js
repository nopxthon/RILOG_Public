const { Kategori } = require('../models');

/**
 * @desc    Mengambil SEMUA Kategori Global (UNTUK DROPDOWN)
 * @route   GET /api/kategori
 */
const getAllKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findAll({
      order: [['category_name', 'ASC']]
    });
    res.json(kategori);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getAllKategori
  // Tidak ada create, update, atau delete
};