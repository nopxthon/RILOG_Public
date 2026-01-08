// components/Sidebaradmin.tsx
"use client";

import Link from "next/link";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { FC, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { listenToProfileUpdate } from "@/utils/profileEvents"; // TAMBAHAN BARU

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    first_name: "Superadmin",
    profile_image_url: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // DIUBAH: Extract fetchProfile agar bisa dipanggil dari useEffect lain
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("superToken");
      
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/superadmin/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile data:", result.data);
        
        setProfileData({
          first_name: result.data.first_name || "Superadmin",
          profile_image_url: result.data.profile_image_url,
        });
      } else if (response.status === 401) {
        console.log("Unauthorized, redirecting to login");
        localStorage.removeItem("superToken");
        router.push("/superadmin-sys-log");
      } else {
        console.error("Failed to fetch profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile saat sidebar dibuka
  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  // TAMBAHAN BARU: Listen to profile update events
  useEffect(() => {
    const unsubscribe = listenToProfileUpdate(() => {
      console.log("Profile updated event received, refreshing sidebar...");
      fetchProfile();
    });

    // Cleanup listener saat component unmount
    return unsubscribe;
  }, []);

  // Refresh profile saat pathname berubah
  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [pathname, isOpen]);

  // Handler untuk logout
  const handleLogout = () => {
    Swal.fire({
      title: "Keluar dari Akun?",
      text: "Anda akan keluar dari sistem dan harus login kembali untuk mengakses.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("superToken");
        localStorage.removeItem("superUser");
        document.cookie = "superToken=; path=/; max-age=0";
        router.push("superadmin-sys-log");
      }
    });
  };

  if (!isOpen) return null;

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 p-2 rounded-lg font-bold transition-colors ${
      isActive
        ? "bg-yellow-500 text-white"
        : "hover:bg-gray-100 text-gray-700"
    }`;
  };

  const getIconClass = (path: string) => {
    const isActive = pathname === path;
    return `w-5 h-5 ${isActive ? "brightness-0 invert" : ""}`;
  };

  return (
    <aside className="w-64 bg-white shadow-md p-5 flex flex-col h-screen overflow-y-auto transition-all duration-300">
      <div className="flex items-center justify-between mb-10">
        <img src="/logo.png" alt="Rilog Logo" className="w-32 ml-0" />
        <button onClick={onClose} className="text-yellow-500 text-2xl hover:text-yellow-600 transition">
          <FaBars />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8 pb-4 border-b">
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
          ) : profileData.profile_image_url ? (
            <img 
              src={profileData.profile_image_url} 
              alt="profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading image:", profileData.profile_image_url);
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <span class="text-xl font-bold text-gray-500">
                    ${profileData.first_name.charAt(0)}
                  </span>
                `;
              }}
            />
          ) : (
            <span className="text-xl font-bold text-gray-500">
              {profileData.first_name.charAt(0)}
            </span>
          )}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold truncate">{profileData.first_name}</p>
          <p className="text-sm text-gray-500">SuperAdmin</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        <Link href="/superadmin" className={getLinkClass("/superadmin")}>
          <img src="/dashboard.svg" alt="Dashboard" className={getIconClass("/superadmin")} />
          Dashboard
        </Link>
        <Link href="/langganan" className={getLinkClass("/langganan")}>
          <img src="/langganan.svg" alt="Langganan" className={getIconClass("/langganan")} />
          Langganan
        </Link>
        <Link href="/paketlangganan" className={getLinkClass("/paketlangganan")}>
          <img src="/paket.svg" alt="Paket Langganan" className={getIconClass("/paketlangganan")} />
          Paket Langganan
        </Link>
        <Link href="/laporansuperadmin" className={getLinkClass("/laporansuperadmin")}>
          <img src="/laporan.svg" alt="Laporan SuperAdmin" className={getIconClass("/laporansuperadmin")} />
          Laporan
        </Link>
        <Link href="/pengaturansuperadmin" className={getLinkClass("/pengaturansuperadmin")}>
          <img src="/pengaturan.svg" alt="Pengaturan" className={getIconClass("/pengaturansuperadmin")} />
          Pengaturan
        </Link>
      </nav>

      {/* Tombol Logout di bagian bawah */}
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-lg font-bold transition-colors w-full text-red-600 hover:bg-red-50"
        >
          <FaSignOutAlt className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;