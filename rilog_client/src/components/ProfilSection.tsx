"use client";

import { FC, useEffect, useState } from "react";
import Swal from "sweetalert2";

interface UserProfile {
  name?: string;
  email?: string;
  nama_bisnis?: string;
  tipe_bisnis?: string;
  nama_gudang?: string;
  role?: string;
  bisnis_id?: number;
  gudang_id?: number;
  foto_url?: string;
}

interface ProfilSectionProps {
  hideFotoSection?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ProfilSection: FC<ProfilSectionProps> = ({ hideFotoSection = false }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    nama_bisnis: "",
    tipe_bisnis: "",
    nama_gudang: "",
    foto_url: "/basicprofil.jpg",
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile dari API
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.warn("Token tidak ditemukan");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (json.status === "success" && json.data) {
        const data = json.data;

        const userProfile: UserProfile = {
          name: data.name || "",
          email: data.email || "",
          nama_bisnis: data.nama_bisnis || "",
          tipe_bisnis: data.tipe_bisnis || "",
          nama_gudang: data.nama_gudang || "",
          role: data.role || "",
          bisnis_id: data.bisnis_id,
          gudang_id: data.gudang_id,
        };

        setProfile({ ...userProfile });
        setOriginalProfile({ ...userProfile });

        localStorage.setItem("userData", JSON.stringify(userProfile));
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Form handling
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    loadUserProfile();
  };

  const handleSubmit = async () => {
    if (!profile.name || profile.name.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Nama tidak boleh kosong",
        confirmButtonColor: "#EAB308",
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Sesi Berakhir",
          text: "Token tidak ditemukan. Silakan login kembali.",
          confirmButtonColor: "#EAB308",
        });
        setIsSaving(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          nama_bisnis: profile.nama_bisnis?.trim() || "",
        }),
      });

      const json = await response.json();

      if (!response.ok || json.status === "error") {
        throw new Error(json.message || "Gagal memperbarui profil");
      }

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      userData.name = profile.name.trim();
      userData.nama_bisnis = profile.nama_bisnis?.trim() || "";
      localStorage.setItem("userData", JSON.stringify(userData));

      const updatedProfile = { ...profile };
      setOriginalProfile({ ...updatedProfile });

      Swal.fire({ 
        icon: "success", 
        title: "Berhasil!",
        text: "Profil berhasil disimpan!",
        confirmButtonColor: "#EAB308",
        timer: 1500, 
        showConfirmButton: false 
      });

      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      console.error("Error update profile:", err);
      Swal.fire({ 
        icon: "error", 
        title: "Gagal menyimpan profil!", 
        text: err.message || "Terjadi kesalahan",
        confirmButtonColor: "#EAB308",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-12 w-12 border-b-2 border-yellow-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Profil Pengguna</h2>

      {/* Info Role dan Bisnis - Header */}
      {(profile.role || profile.nama_bisnis) && (
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 border border-yellow-200 rounded-lg p-3 mb-4 shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/30 rounded-full -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-yellow-200/30 rounded-full -ml-10 -mb-10" />
          
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-700 text-sm leading-snug font-medium">
              Anda sebagai{" "}
              <span className="font-semibold text-yellow-700 capitalize">
                {profile.role || "Pengguna"}
              </span>
              {profile.nama_bisnis && (
                <>
                  {" "}di{" "}
                  <span className="font-semibold text-yellow-700">
                    {profile.nama_bisnis}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama
          </label>
          <input 
            type="text" 
            name="name" 
            value={profile.name || ""} 
            onChange={handleChange} 
            placeholder="Masukkan nama"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isSaving}
          />
        </div>

        {/* Nama Bisnis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Bisnis
          </label>
          <input 
            type="text" 
            name="nama_bisnis" 
            value={profile.nama_bisnis || ""} 
            onChange={handleChange} 
            placeholder="Masukkan nama bisnis"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isSaving}
          />
        </div>

        {/* Email - Full Width */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input 
            type="email" 
            value={profile.email || ""} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500" 
            disabled 
          />
          <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
        </div>

        {/* Nama Gudang - Full Width (Read-only) */}
        {profile.nama_gudang && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Gudang
            </label>
            <input 
              type="text" 
              value={profile.nama_gudang} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500" 
              disabled 
            />
          </div>
        )}
      </div>

      {/* TOMBOL SELALU MUNCUL DI SINI */}
      <div className="flex justify-end gap-2.5 pt-4 mt-auto border-t">
        <button 
          onClick={handleCancel}
          disabled={isSaving}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          Batal
        </button>
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
};

export default ProfilSection;