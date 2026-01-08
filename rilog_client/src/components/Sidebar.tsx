"use client";

import Link from "next/link";
import { FaBars, FaSignOutAlt, FaCrown, FaCog } from "react-icons/fa"; 
import { FC, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  foto_url?: string;
  nama_bisnis?: string;
  tipe_bisnis?: string;
  nama_gudang?: string;
  sub_status?: string; 
  sub_start?: string;
  sub_end?: string;
  nama_paket?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  // ========== FIXED normalizeFoto ==========
  const normalizeFoto = useCallback((raw?: string | null): string => {
    if (!raw || raw === "/" || raw === "") {
      return "/basicprofil.jpg";
    }
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/uploads")) return `${API_URL}${raw}`;
    if (raw.includes("uploads")) return `${API_URL}/${raw}`;
    return raw;
  }, []);

  // ========== LOAD USER FROM LOCAL STORAGE ==========
  const loadFromLocal = useCallback((): UserData | null => {
    try {
      const str = localStorage.getItem("userData");
      if (!str) return null;
      const parsed = JSON.parse(str);
      const foto = parsed.foto_url || parsed.foto_profil;
      parsed.foto_url = normalizeFoto(foto);
      return parsed;
    } catch {
      return null;
    }
  }, [normalizeFoto]);

  // ========== FETCH USER DARI BACKEND ==========
  const fetchUserFromAPI = useCallback(async (): Promise<UserData | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (json.status !== "success") return null;

      const data = json.data;
      const foto = data.foto_profil || data.foto_url;

      const userData: UserData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        foto_url: normalizeFoto(foto),
        nama_bisnis: data.nama_bisnis,
        tipe_bisnis: data.tipe_bisnis,
        nama_gudang: data.nama_gudang,
        sub_status: data.sub_status, 
        sub_end: data.sub_end,
        nama_paket: data.nama_paket || (data.sub_status === 'trial' ? 'Trial Plan' : 'Basic')
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error fetching user from API:", error);
      return null;
    }
  }, [normalizeFoto]);

  // ========== REFRESH FOTO DARI LOCALSTORAGE ==========
  const refreshFotoFromLocal = useCallback(() => {
    const localData = loadFromLocal();
    if (localData) {
      setUser(prev => ({
        ...prev,
        ...localData,
        foto_url: localData.foto_url
      }));
      console.log("🔄 Foto updated from localStorage:", localData.foto_url);
    }
  }, [loadFromLocal]);

  // ========== LOAD USER ON SIDEBAR OPEN ==========
  useEffect(() => {
    if (!isOpen) return;

    const initLoad = async () => {
      setIsLoading(true);
      const api = await fetchUserFromAPI();
      const local = loadFromLocal();
      const currentUser = api || local;
      setUser(currentUser);
      setIsLoading(false);

      // Hitung hari tersisa
      if (currentUser?.sub_end) {
        const endDate = new Date(currentUser.sub_end);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays > 0 ? diffDays : 0);
      } else {
        setDaysLeft(0);
      }
    };

    initLoad();
  }, [isOpen, fetchUserFromAPI, loadFromLocal]);

  // ========== 🔥 FIX: LISTEN TO FOTO UPDATE EVENTS ==========
  useEffect(() => {
    // Handler untuk custom event dari PengaturanPage
    const handleFotoUpdate = (e: CustomEvent) => {
      console.log("📸 Foto update event received:", e.detail);
      
      if (e.detail?.url) {
        setUser(prev => prev ? {
          ...prev,
          foto_url: e.detail.url
        } : null);
      } else {
        // Jika tidak ada URL, refresh dari localStorage
        refreshFotoFromLocal();
      }
    };

    // Handler untuk storage event (dari window.dispatchEvent(new Event('storage')))
    const handleStorageChange = () => {
      console.log("💾 Storage change detected");
      refreshFotoFromLocal();
    };

    // Listen to custom event
    window.addEventListener('foto-profil-updated', handleFotoUpdate as EventListener);
    
    // Listen to storage event
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('foto-profil-updated', handleFotoUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshFotoFromLocal]);

  // ========== 🔥 FIX: POLLING UNTUK MEMASTIKAN SYNC ==========
  useEffect(() => {
    if (!isOpen) return;

    // Check localStorage setiap 2 detik untuk foto yang baru di-update
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem("foto_last_updated");
      const currentTime = Date.now();
      
      // Jika ada update dalam 5 detik terakhir, refresh foto
      if (lastUpdate && (currentTime - parseInt(lastUpdate)) < 5000) {
        refreshFotoFromLocal();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, refreshFotoFromLocal]);

  // ========== LOGOUT ==========
  const handleConfirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.clear(); 
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      setShowLogoutModal(false);
      router.replace("/login");
    }
  };

  if (!isOpen) return null;

  const linkClass = (path: string) =>
    `flex items-center gap-3 p-2 rounded-lg font-bold transition-colors ${
      pathname.startsWith(path)
        ? "bg-yellow-500 text-white"
        : "hover:bg-yellow-100 text-gray-700"
    }`;
  
  const getIconClass = (path: string) => {
    const isActive = pathname === path;
    return `w-5 h-5 ${isActive ? "brightness-0 invert" : ""}`;
  };

  return (
    <>
      <aside className="w-64 bg-white shadow-md p-5 flex flex-col h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <img src="/logo.png" alt="logo" className="w-32" />
          <button onClick={onClose} className="text-yellow-500 text-2xl">
            <FaBars />
          </button>
        </div>

        {/* Profil User */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="relative">
            <img
              key={user?.foto_url} // 🔥 Force re-render saat URL berubah
              src={user?.foto_url || "/basicprofil.jpg"}
              alt="Foto Profil"
              className="w-12 h-12 rounded-full object-cover border-2 border-yellow-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.log("⚠️ Image load error in Sidebar:", {
                  attemptedUrl: user?.foto_url,
                  currentSrc: target.src
                });
                if (!target.src.includes("/basicprofil.jpg")) {
                  target.src = "/basicprofil.jpg";
                }
              }}
              onLoad={() => {
                console.log("✅ Image loaded in Sidebar:", user?.foto_url);
              }}
            />
            {/* Indikator Status */}
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${user?.sub_status === 'aktif' || user?.sub_status === 'trial' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold truncate text-sm">{user?.name || "Pengguna"}</p>
            <div className="flex items-center gap-1 mt-1">
               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${user?.sub_status === 'trial' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700'}`}>
                 {user?.nama_paket || (user?.sub_status === 'trial' ? 'TRIAL' : 'MEMBER')}
               </span>
            </div>
          </div>
        </div>
        
        {/* STATUS PAKET / SISA HARI */}
        <div className="mb-8">
           {daysLeft !== null && daysLeft > 0 ? (
             <div className="bg-[#FEF8EE] border border-[#FDE6CA] p-3 rounded-lg text-center">
               <p className="text-xs text-gray-500 mb-1">Masa Aktif Paket</p>
               <p className="text-sm font-bold text-[#D97706]">{daysLeft} Hari Lagi</p>
             </div>
           ) : (
             <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
               <p className="text-xs text-red-500 mb-2">Paket Berakhir</p>
               <button
                onClick={() => router.push("/pricing")}
                className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow hover:bg-red-700 w-full transition"
              >
                Perpanjang Sekarang
              </button>
             </div>
           )}
        </div>

        {/* Navigasi */}
        <nav className="space-y-2 flex-1 text-sm">
          {user?.role !== "staff" && (
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <img src="/dashboard.svg" alt="Dashboard" className={getIconClass("/dashboard")} />
              Dashboard
            </Link>
          )}
          
          <Link href="/inventori" className={linkClass("/inventori")}>
            <img src="/inventori.svg" alt="Inventori" className={getIconClass("/inventori")} />
            Inventori
          </Link>
          <Link href="/stok-opname" className={linkClass("/stok-opname")}>
            <img src="/stok-opname.svg" alt="Stok Opname" className={getIconClass("/stok-opname")} />
            Stok Opname
          </Link>

          {user?.role !== "staff" && (
            <Link href="/laporan" className={linkClass("/laporan")}>
              <img src="/laporan.svg" alt="Laporan" className={getIconClass("/laporan")} />
              Laporan & Tren
            </Link>
          )}

          {user?.role !== "staff" && (
            <Link href="/staff" className={linkClass("/staff")}>
              <img src="/staff.svg" alt="Staff" className={getIconClass("/staff")} />
              Kelola Staff
            </Link>
          )}

          {user?.role !== "staff" && (
            <Link href="/kelola-gudang" className={linkClass("/kelola-gudang")}>
              <img src="/kelola-gudang.svg" alt="Kelola Gudang" className={getIconClass("/kelola-gudang")} />
              Kelola Gudang
            </Link>
          )}

          {user?.role !== "staff" && (
            <Link href="/pricing" className={linkClass("/pricing")}>
              <FaCrown className={`w-5 h-5 ${pathname === "/pricing" ? "text-white" : "text-black"}`} />
              Paket Langganan
            </Link>
          )}
        </nav>

        <div className="pt-4 border-t border-gray-100">
           <Link href="/pengaturan" className={linkClass("/pengaturan")}>
             <FaCog className={`w-5 h-5 ${pathname === "/pengaturan" ? "text-white" : "text-black"}`} /> Pengaturan
           </Link>

           <button
             onClick={() => setShowLogoutModal(true)}
             className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-50 text-red-600 mt-2 font-bold text-sm transition"
           >
             <FaSignOutAlt className="w-5 h-5" /> Logout
           </button>
        </div>
      </aside>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
            <p className="font-bold text-lg mb-3">Konfirmasi Logout</p>
            <p className="text-gray-600 mb-6">Yakin ingin keluar?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;