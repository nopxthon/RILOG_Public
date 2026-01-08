"use client";
import { FC, useState } from "react";
import Swal from "sweetalert2";

const UbahKataSandiSection: FC = () => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validasi
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Harap isi semua field password",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Tidak Cocok",
        text: "Password baru dan konfirmasi password tidak cocok",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Terlalu Pendek",
        text: "Password minimal harus 6 karakter",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Sesi Berakhir",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/password/change", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kataSandiLama: passwordData.oldPassword,
          kataSandiBaru: passwordData.newPassword,
          konfirmasiKataSandi: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: data.message || "Kata sandi berhasil diperbarui!",
          confirmButtonColor: "#EAB308",
          confirmButtonText: "OK",
        });

        // Reset form setelah berhasil
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.message || "Gagal mengubah kata sandi",
          confirmButtonColor: "#EAB308",
          confirmButtonText: "Coba Lagi",
        });
      }
    } catch (err) {
      console.error("Error ubah kata sandi:", err);
      await Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Terjadi kesalahan pada server",
        confirmButtonColor: "#EAB308",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Keamanan</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kata Sandi Lama
          </label>
          <input
            type="password"
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={handleInputChange}
            placeholder="Masukkan kata sandi lama"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kata Sandi Baru
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleInputChange}
            placeholder="Masukkan kata sandi baru"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Kata Sandi Baru
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Konfirmasi kata sandi baru"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
};

export default UbahKataSandiSection;