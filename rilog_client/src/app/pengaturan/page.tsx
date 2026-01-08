// src/app/pengaturan/page.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import ProfilSection from "@/components/ProfilSection";
import UbahKataSandiSection from "@/components/UbahKataSandiSection";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import { FaBars, FaBell, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export default function PengaturanPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<"profil" | "keamanan">("profil");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gudangId, setGudangId] = useState<number | null>(null);

  // Photo profile states
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    foto_url: "/basicprofil.jpg",
  });
  const [previewUrl, setPreviewUrl] = useState("/basicprofil.jpg");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBaru, setFileBaru] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Helper functions
  const normalizeFoto = (raw?: string | null) => {
    if (!raw || raw === "/" || raw === "") return "/basicprofil.jpg";
    if (raw.startsWith("blob:")) return raw;
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/uploads")) return `${API_URL}${raw}`;
    if (raw.includes("uploads")) return `${API_URL}/${raw}`;
    return raw;
  };

  const isDefaultFoto = (url?: string | null): boolean => {
    if (!url) return true;
    return url === "/basicprofil.jpg" || url.endsWith("/basicprofil.jpg");
  };

  const fallbackImg = "/basicprofil.jpg";

  // Load profile for photo
  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (json.status === "success" && json.data) {
        const data = json.data;
        const foto = data.foto_profil || data.foto_url;

        const userProfile: UserProfile = {
          name: data.name || "",
          email: data.email || "",
          role: data.role || "",
          foto_url: normalizeFoto(foto),
        };

        setProfile(userProfile);
        
        if (!fileBaru) {
          setPreviewUrl(userProfile.foto_url || "/basicprofil.jpg");
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load gudang ID from localStorage
  useEffect(() => {
    const storedGudangId = localStorage.getItem("gudang_id");
    if (storedGudangId) {
      setGudangId(Number(storedGudangId));
    }
  }, []);

  // Hooks for notifications and activities
  const {
    notifikasiList,
    loading: notifikasiLoading,
    refreshNotifikasi,
    deleteNotifikasi,
    deleteAllNotifikasi,
  } = useNotifikasiAPI(gudangId);

  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useActivityAPI(gudangId, 100);

  // Photo handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ 
        icon: "error", 
        title: "Ukuran terlalu besar!", 
        text: "Ukuran foto maksimal 2MB" 
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({ 
        icon: "error", 
        title: "Tipe file tidak valid!", 
        text: "Hanya file JPG, PNG, dan GIF yang diperbolehkan" 
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    
    setSelectedFile(file);
    setFileBaru(true);
    setPreviewUrl(objectUrl);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) {
      Swal.fire({ icon: "info", title: "Pilih foto terlebih dahulu" });
      return;
    }

    try {
      setIsSavingPhoto(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const formData = new FormData();
      formData.append("foto", selectedFile);

      const res = await fetch(`${API_URL}/api/user/profile/photo`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        body: formData,
      });

      const json = await res.json();
      
      if (!res.ok || json.status === "error") {
        throw new Error(json.message || "Gagal upload foto");
      }

      const fotoUrl = json.data?.foto_url || json.data?.foto_profil;
      
      if (!fotoUrl) {
        throw new Error("Backend tidak mengembalikan URL foto");
      }

      const normalized = normalizeFoto(fotoUrl);

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const updatedData = {
        ...userData,
        foto_url: normalized,
        foto_profil: normalized
      };
      localStorage.setItem("userData", JSON.stringify(updatedData));

      setProfile((p) => ({ ...p, foto_url: normalized }));
      setPreviewUrl(normalized);
      setFileBaru(false);
      setSelectedFile(null);

      await Swal.fire({ 
        icon: "success", 
        title: "Foto berhasil diupload!", 
        timer: 1500, 
        showConfirmButton: false 
      });

      window.dispatchEvent(
        new CustomEvent("foto-profil-updated", { 
          detail: { 
            url: normalized,
            timestamp: Date.now(),
            source: 'profile-section'
          } 
        })
      );
      
      localStorage.setItem("foto_last_updated", Date.now().toString());
      window.dispatchEvent(new Event('storage'));

    } catch (err: any) {
      console.error("Error upload photo:", err);
      Swal.fire({ 
        icon: "error", 
        title: "Gagal upload foto!", 
        text: err.message || "Terjadi kesalahan" 
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    const result = await Swal.fire({
      title: "Hapus foto profil?",
      text: "Foto akan dikembalikan ke default",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const res = await fetch(`${API_URL}/api/user/profile/photo`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });

      const json = await res.json();
      
      if (!res.ok || json.status === "error") {
        throw new Error(json.message || "Gagal menghapus foto");
      }

      const defaultFoto = "/basicprofil.jpg";

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      userData.foto_url = defaultFoto;
      userData.foto_profil = null;
      localStorage.setItem("userData", JSON.stringify(userData));

      setProfile((p) => ({ ...p, foto_url: defaultFoto }));
      setPreviewUrl(defaultFoto);
      setSelectedFile(null);
      setFileBaru(false);

      Swal.fire({
        icon: "success",
        title: "Foto berhasil dihapus!",
        timer: 1500,
        showConfirmButton: false,
      });

      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      console.error("Error delete photo:", err);
      Swal.fire({ 
        icon: "error", 
        title: "Gagal menghapus foto!", 
        text: err.message || "Terjadi kesalahan" 
      });
    }
  };

  const handleTabChange = (tab: "profil" | "keamanan") => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(tab);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const handleSearch = (value: string) => setSearchValue(value);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        {/* Topbar */}
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-yellow-500 text-2xl hover:opacity-80 transition"
              >
                <FaBars />
              </button>
            )}

            <SearchBar
              placeholder="Cari di pengaturan..."
              className="flex-1"
              onSearch={handleSearch}
            />

            <div className="flex items-center gap-4">
              <button 
                className="relative bg-[#FFF4E6] rounded-full p-3 shadow-sm hover:bg-[#FFE4B5] transition-colors" 
                onClick={() => setShowAktivitas(true)}
                title="Lihat Aktivitas"
              >
                <FaHistory className="text-orange-500 text-lg" />
                {activities.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activities.length}
                  </span>
                )}
              </button>

              <button
                className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm hover:bg-[#FFF8DC] transition-colors"
                onClick={() => setShowNotifikasi(true)}
              >
                <FaBell className="text-yellow-500 text-lg" />
                {notifikasiList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {notifikasiList.length}
                  </span>
                )}
              </button>

              <div className="min-w-[200px]">
                <GudangSelector />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Akun</h1>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar with Photo Profile */}
            <div className="col-span-12 md:col-span-3">
              <div className="bg-white rounded-2xl shadow p-6">
                {/* Foto Profil - Integrated */}
                <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b">
                  <label
                    htmlFor="uploadFoto"
                    aria-label="Upload foto profil"
                    className="relative w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-100 overflow-hidden cursor-pointer hover:border-gray-400 hover:bg-gray-200 transition-all group"
                  >
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Foto Profil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            if (!t.src.includes(fallbackImg)) {
                              t.src = fallbackImg;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white font-medium text-sm">Ubah Foto</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 text-center p-4">
                        <div className="text-4xl mb-2">👤</div>
                        <div className="text-sm font-medium">Upload Foto</div>
                        <div className="text-xs text-gray-400 mt-1">Max 2MB</div>
                      </div>
                    )}
                  </label>

                  <input 
                    id="uploadFoto" 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/gif" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />

                  {fileBaru && (
                    <button 
                      onClick={handleSavePhoto} 
                      disabled={isSavingPhoto} 
                      className="bg-yellow-500 text-black px-4 py-2 min-w-[120px] rounded-md font-medium transition-all hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingPhoto ? "Menyimpan..." : "Simpan Foto"}
                    </button>
                  )}

                  {!fileBaru && !isDefaultFoto(profile.foto_url) && (
                    <button 
                      onClick={handleDeletePhoto} 
                      disabled={isSavingPhoto} 
                      className="bg-red-50 text-red-600 px-4 py-2 min-w-[120px] rounded-md font-medium transition-all hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hapus Foto
                    </button>
                  )}

                  <div className="text-xs text-gray-500 text-center mt-2">
                    Format: JPG, PNG, GIF
                    <br />
                    Maksimal: 2MB
                  </div>
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
                  Data Pengguna
                </button>
                <button
                  onClick={() => handleTabChange("keamanan")}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-all duration-200 ${
                    activeTab === "keamanan"
                      ? "bg-yellow-50 text-yellow-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Ubah Kata Sandi
                </button>
              </div>
            </div>

            {/* Content Area with Slide Transition */}
            <div className="col-span-12 md:col-span-9">
              <div className="bg-white rounded-2xl shadow p-6 min-h-[400px] relative overflow-hidden">
                {/* Profil Tab */}
                <div
                  className={`w-full transition-all duration-400 ease-in-out absolute inset-0 p-6 ${
                    activeTab === "profil"
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[-100%] opacity-0 pointer-events-none"
                  }`}
                >
                  <ProfilSection hideFotoSection={true} />
                </div>

                {/* Keamanan Tab */}
                <div
                  className={`w-full transition-all duration-400 ease-in-out absolute inset-0 p-6 ${
                    activeTab === "keamanan"
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[100%] opacity-0 pointer-events-none"
                  }`}
                >
                  <UbahKataSandiSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Notifikasi */}
      <ModalNotifikasi
        isOpen={showNotifikasi}
        onClose={() => setShowNotifikasi(false)}
        notifikasiList={notifikasiList}
        onHapusNotifikasi={(id) => deleteNotifikasi(Number(id))}
        onHapusSemuaNotifikasi={deleteAllNotifikasi}
      />

      {/* Modal Aktivitas */}
      <ModalAktivitas
        isOpen={showAktivitas}
        onClose={() => setShowAktivitas(false)}
        activities={activities}
        loading={activitiesLoading}
      />

      {/* Custom CSS untuk animasi */}
      <style jsx>{`
        .duration-400 {
          transition-duration: 400ms;
        }

        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}