// src/app/superadmin/pengaturan/page.tsx
"use client";

import { 
  FaBell, 
  FaBars
} from "react-icons/fa";
import { FC, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NotifikasiSuperAdmin, { NotifikasiSuperAdminType } from "@/components/NotifikasiSuperAdmin";
import { useNotifikasiSuperAdmin } from "@/hooks/useNotifikasiSuperAdmin";
import Sidebar from "@/components/Sidebaradmin";
import SearchBar from "@/components/SearchBar";
import Swal from "sweetalert2";

// Import komponen-komponen baru
import FotoProfil from "@/components/superadmin/FotoProfil";
import DataPengguna from "@/components/superadmin/DataPengguna";
import Keamanan from "@/components/superadmin/Keamanan";

const PengaturanPage: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"profil" | "keamanan">("profil");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Data notifikasi super admin
  const notifikasiData: NotifikasiSuperAdminType[] = [
    { id: "1", message: "Langganan PT Maju Bersama berakhir 5 hari lagi!", type: "warning", icon: "notifikasi-expired.svg" },
    { id: "2", message: "Transaksi CV Berkah gagal!", type: "error", icon: "notifikasi-peringatan.svg" },
    { id: "3", message: "PT Sumber Jaya Overdue!", type: "warning", icon: "notifikasi-expired.svg" },
    { id: "4", message: "Transaksi Ifood Shop gagal!", type: "error", icon: "notifikasi-peringatan.svg" },
  ];

  const {
    notifikasiList,
    handleHapusNotifikasi,
    handleHapusSemuaNotifikasi,
  } = useNotifikasiSuperAdmin(notifikasiData);

  // State untuk form profil
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Fetch profile data dari API
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("superToken");
      
      if (!token) {
        router.push("/superadmin/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/superadmin/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("superToken");
          router.push("/superadmin/login");
          return;
        }
        throw new Error("Gagal mengambil data profil");
      }

      const result = await response.json();
      const data = result.data;

      setFormData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        phone: data.phone || ""
      });

      setProfileImage(data.profile_image_url || null);

    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengambil data profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("superToken");

      const response = await fetch(`${API_BASE_URL}/api/superadmin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan profil");
      }

      const result = await response.json();
      
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Profil berhasil diperbarui!",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditing(false);
      await fetchProfile();

    } catch (error) {
      console.error("Error saving profile:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menyimpan perubahan profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleSearch = (value: string) => {
    setSearchValue(value.toLowerCase());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (imageUrl: string | null) => {
    setProfileImage(imageUrl);
  };

  const handleUpdatePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const token = localStorage.getItem("superToken");
      
      const response = await fetch(`${API_BASE_URL}/api/superadmin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengubah password");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil diubah!",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error updating password:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error instanceof Error ? error.message : "Gagal mengubah password",
      });
      throw error;
    }
  };

  // Function untuk handle tab change dengan slide transition vertikal
  const handleTabChange = (tab: "profil" | "keamanan") => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(tab);
    
    // Reset transitioning state setelah animasi selesai
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        {/* Topbar */}
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 right-0 z-50">
          <div className="flex items-center justify-between gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl">
                <FaBars />
              </button>
            )}

            <SearchBar placeholder="Cari notifikasi atau aktivitas..." className="flex-1" onSearch={handleSearch} />

            <div className="flex items-center gap-4">
              <button className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm" onClick={() => setShowNotifikasi(true)}>
                <FaBell className="text-yellow-500 text-lg" />
                {notifikasiList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifikasiList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("superToken");
                  router.push("/superadmin/login");
                }}
                className="bg-[#FFFAF0] hover:bg-[#FFF3E0] transition rounded-full p-3 shadow-sm"
              >
                <Image
                  src="/logout.svg"
                  alt="Logout"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Akun</h1>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Tabs */}
            <div className="col-span-3">
              <div className="bg-white rounded-2xl shadow p-4">
                {/* Profile Section at Top */}
                <div className="flex flex-col items-center pb-6 mb-4 border-b">
                  <FotoProfil
                    initialImage={profileImage}
                    firstName={formData.firstName}
                    size="medium"
                    onImageChange={handleImageChange}
                    className="mb-3"
                  />
                </div>

                {/* Navigation Tabs */}
                <button
                  onClick={() => handleTabChange("profil")}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-all duration-200 ${
                    activeTab === "profil"
                      ? "bg-yellow-50 text-yellow-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Profil
                </button>
                <button
                  onClick={() => handleTabChange("keamanan")}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-all duration-200 ${
                    activeTab === "keamanan"
                      ? "bg-yellow-50 text-yellow-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Keamanan
                </button>
              </div>
            </div>

            {/* Content Area dengan Vertical Slide Transition */}
            <div className="col-span-9">
              <div className="bg-white rounded-2xl shadow p-6 min-h-[400px] relative overflow-hidden">
                {/* Profil Tab - Slide dari atas ketika aktif, ke atas ketika tidak aktif */}
                <div
                  className={`w-full transition-all duration-400 ease-in-out absolute inset-0 p-6 ${
                    activeTab === "profil"
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[-100%] opacity-0 pointer-events-none"
                  }`}
                >
                  <DataPengguna
                    formData={formData}
                    isEditing={isEditing}
                    onEditClick={() => setIsEditing(true)}
                    onInputChange={handleInputChange}
                    onSave={handleSaveProfile}
                    onCancel={handleCancelEdit}
                    isLoading={isLoading}
                  />
                </div>

                {/* Keamanan Tab - Slide dari bawah ketika aktif, ke bawah ketika tidak aktif */}
                <div
                  className={`w-full transition-all duration-400 ease-in-out absolute inset-0 p-6 ${
                    activeTab === "keamanan"
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[100%] opacity-0 pointer-events-none"
                  }`}
                >
                  <Keamanan onUpdatePassword={handleUpdatePassword} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Edit Profil */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profil</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <DataPengguna
              formData={formData}
              isEditing={true}
              onEditClick={() => {}}
              onInputChange={handleInputChange}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <NotifikasiSuperAdmin
        isOpen={showNotifikasi}
        onClose={() => setShowNotifikasi(false)}
        notifikasiList={notifikasiData}
        onHapusNotifikasi={handleHapusNotifikasi}
        onHapusSemuaNotifikasi={handleHapusSemuaNotifikasi}
      />

      {/* Custom CSS untuk animasi */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Custom duration class */
        .duration-400 {
          transition-duration: 400ms;
        }

        /* Smooth scroll */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default PengaturanPage;