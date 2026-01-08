const { Superadmin } = require("../models");
const path = require("path");
const fs = require("fs");

// Get profile data
const getProfile = async (req, res) => {
  try {
    const superadminId = req.user.id;

    const superadmin = await Superadmin.findByPk(superadminId, {
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'profile_image']
    });

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Add full URL for profile image
    const profileData = superadmin.toJSON();
    if (profileData.profile_image) {
      profileData.profile_image_url = `${req.protocol}://${req.get('host')}/uploads/profile/${profileData.profile_image}`;
    }

    res.status(200).json({
      status: "success",
      data: profileData,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data profil",
      detail: error.message,
    });
  }
};

// Update profile data
const updateProfile = async (req, res) => {
  try {
    const superadminId = req.user.id;
    const { first_name, last_name, email, phone } = req.body;

    const superadmin = await Superadmin.findByPk(superadminId);

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Update data
    await superadmin.update({
      first_name: first_name || superadmin.first_name,
      last_name: last_name || superadmin.last_name,
      email: email || superadmin.email,
      phone: phone || superadmin.phone,
    });

    res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
      data: {
        id: superadmin.id,
        username: superadmin.username,
        first_name: superadmin.first_name,
        last_name: superadmin.last_name,
        email: superadmin.email,
        phone: superadmin.phone,
        profile_image: superadmin.profile_image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui profil",
      detail: error.message,
    });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    const superadminId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada file yang diupload",
      });
    }

    const superadmin = await Superadmin.findByPk(superadminId);

    if (!superadmin) {
      // Delete uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Delete old profile image if exists
    if (superadmin.profile_image) {
      const oldImagePath = path.join(__dirname, "../../uploads/profile", superadmin.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update profile image
    await superadmin.update({
      profile_image: req.file.filename,
    });

    const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      message: "Foto profil berhasil diupload",
      data: {
        profile_image: req.file.filename,
        profile_image_url: profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengupload foto profil",
      detail: error.message,
    });
  }
};

// Delete profile image
const deleteProfileImage = async (req, res) => {
  try {
    const superadminId = req.user.id;

    const superadmin = await Superadmin.findByPk(superadminId);

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    if (!superadmin.profile_image) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada foto profil yang perlu dihapus",
      });
    }

    // Delete file from server
    const imagePath = path.join(__dirname, "../../uploads/profile", superadmin.profile_image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update database
    await superadmin.update({
      profile_image: null,
    });

    res.status(200).json({
      status: "success",
      message: "Foto profil berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus foto profil",
      detail: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
};