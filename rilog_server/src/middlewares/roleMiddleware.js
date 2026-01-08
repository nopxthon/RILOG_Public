/**
 * Middleware ini TIDAK mengecek token lagi (karena tugas itu sudah dilakukan authMiddleware).
 * Tugas middleware ini HANYA mengecek apakah ROLE user sesuai dengan izin yang diminta.
 * * @param {Array} allowedRoles - Daftar role yang boleh masuk, contoh: ['admin', 'staff']
 */
exports.verifyToken = (allowedRoles) => {
  return (req, res, next) => {
    // 1. Cek apakah data user sudah ada (artinya authMiddleware sudah sukses)
    if (!req.user) {
      return res.status(401).json({ 
        status: "error", 
        message: "Unauthorized. User data tidak ditemukan. (Pastikan authMiddleware dipasang sebelum ini)" 
      });
    }

    // 2. Cek apakah role user ada di dalam daftar yang diizinkan
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: "error", 
        message: `Akses Ditolak. Role Anda '${req.user.role}' tidak memiliki izin untuk aksi ini.` 
      });
    }

    // 3. Lanjut jika role cocok
    next();
  };
};