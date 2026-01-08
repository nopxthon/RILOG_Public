const { User, Bisnis, Gudang, Superadmin } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' disini adalah input dari form (bisa jadi username buat superadmin)

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/Username dan password wajib diisi.' });
    }

    let user = null;
    let role = null;

    // 1. Cek dulu di tabel USER (Admin/Staff) pakai Email
    //    (Prioritas utama sesuai permintaan Anda mengurus Staff)
    user = await User.findOne({
        where: { email }, // User biasa login pakai email
        include: [
          {
            model: Bisnis,
            as: 'bisnis',
            include: [{ model: Gudang, as: 'gudangs' }],
          },
          {
            model: Gudang,
            as: 'gudangs', 
            through: { attributes: [] },
            attributes: ['id', 'nama_gudang', 'tipe_gudang', 'alamat_gudang', 'bisnis_id'],
          },
        ],
    });

    if (user) {
        role = user.role;
    } 
    // 2. Jika tidak ketemu di User, baru cek Superadmin
    //    ⚠️ PERBAIKAN: Cek pakai 'username', bukan 'email'
    else {
        user = await Superadmin.findOne({ where: { username: email } }); // Input email dianggap username
        if (user) {
            role = "superadmin";
        }
    }

    // Jika tetap tidak ketemu
    if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan.' });

    // ============================================
    // 🔥 CEK STATUS (KHUSUS USER BIASA) 🔥
    // ============================================
    if (role !== "superadmin") {
        if (user.status === 'suspended') {
            return res.status(403).json({ 
                message: 'Akun Anda telah DINONAKTIF. Silakan hubungi atasan Anda.' 
            });
        }
        if (user.status === 'pending') {
            return res.status(403).json({ 
                message: 'Akun belum aktif. Silakan cek email undangan Anda.' 
            });
        }
    }

    // 3. Cek Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Password salah.' });

    // ============================================
    // LOGIC BISNIS ID & GUDANG
    // ============================================
    let bisnisId = null;
    let bisnisNama = null;
    let gudangList = [];

    if (role === "admin") {
      bisnisId = user.bisnis?.id || null;
      bisnisNama = user.bisnis?.nama_bisnis || null;
      gudangList = user.bisnis?.gudangs || [];

    } else if (role === "staff") {
      gudangList = user.gudangs || [];
      const gudangStaff = gudangList[0] || null;

      if (gudangStaff) {
        bisnisId = gudangStaff.bisnis_id;
        const bisnis = await Bisnis.findByPk(bisnisId);
        bisnisNama = bisnis?.nama_bisnis || null;
      }
      
      if (!bisnisId && user.bisnis_id) {
          bisnisId = user.bisnis_id;
          const bisnis = await Bisnis.findByPk(bisnisId);
          bisnisNama = bisnis?.nama_bisnis || null;
      }
    } else if (role === "superadmin") {
        bisnisId = 0;
        bisnisNama = "Superadmin System";
    }

    // ============================================
    // Generate Token
    // ============================================
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email || user.username, // Handle superadmin yg ga punya email
        role: role,
        bisnis_id: bisnisId,
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    // 🔔 AUTO GENERATE NOTIFIKASI SETELAH LOGIN
try {
  await axios.post(
    `${process.env.API_URL || "http://localhost:5000"}/api/notifikasi/generate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("✅ Notifikasi berhasil digenerate saat login");
} catch (err) {
  console.error("⚠️ Gagal generate notifikasi saat login:", err.message);
}


    // ============================================
    // 🔥 Bentuk gudangList sesuai role
    // ============================================
    gudangList =
      user.role === "admin"
        ? user.bisnis?.gudangs || []
        : user.gudangs || [];

    // Pilih gudang default
    const gudangDefault = gudangList[0] || null;

    return res.status(200).json({
      message: "Login berhasil!",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name || user.username,
          email: user.email || "superadmin@system", // Dummy email buat superadmin
          role: role,
          status: user.status || 'active',
          
          bisnis_id: bisnisId,
          bisnis_nama: bisnisNama,
          
          gudang_id: gudangDefault?.id || null,
          gudang_nama: gudangDefault?.nama_gudang || null,
          gudang_list: gudangList,
          
          foto_profil: user.foto_profil
            ? `${req.protocol}://${req.get("host")}/uploads/${user.foto_profil}`
            : null,
        },
      },
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  return res.status(200).json({
    message: "Logout berhasil",
  });
};