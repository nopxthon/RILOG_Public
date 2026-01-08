// File: src/hooks/useSuperAdminLogout.ts
import { useRouter } from "next/navigation";
import axios from "axios";

export const useSuperAdminLogout = () => {
  const router = useRouter();
  
  // Gunakan URL API dari env atau fallback ke localhost
  const API_AUTH_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const logout = async () => {
    try {
      const token = localStorage.getItem("superToken");

      // 1. Panggil API Logout Backend (Opsional, agar server tau)
      if (token) {
        await axios.post(`${API_AUTH_URL}/api/superadmin/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.warn("Logout server skip (token invalid/network error)...");
    } finally {
      // 2. Bersihkan Local Storage (Client Side)
      localStorage.removeItem("superToken");
      localStorage.removeItem("superUser");

      // 3. Bersihkan Cookie Browser (Client Side)
      document.cookie = "superToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // 4. Redirect ke Halaman Login
      router.replace("/superadmin-sys-log");
    }
  };

  return { logout };
};