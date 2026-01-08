"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // 🚫 Jangan jalankan AuthGuard di halaman login
    if (pathname === "/login") {
      setAllowed(true);
      return;
    }

    // Jika buka halaman lain → cek token
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Akses Ditolak",
        text: "Anda harus login terlebih dahulu!",
      }).then(() => {
        router.replace("/login");
      });
    } else {
      setAllowed(true);
    }
  }, [pathname]);

  // Hindari flicker
  if (!allowed) return null;

  return <>{children}</>;
}
