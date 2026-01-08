"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const [staffName, setStaffName] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<string>("Memeriksa token...");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ============================================================
  // 🔍 CEK TOKEN SAAT HALAMAN DIBUKA
  // ============================================================
  useEffect(() => {
    if (!token) {
      setMessage("Token tidak ditemukan.");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/staff/validate-token?token=${token}`
        );

        const data = await res.json();

        if (res.ok) {
          setTokenValid(true);
          setStaffName(data.staffName || "");
          setMessage(" Silakan buat password anda.");
        } else {
          setTokenValid(false);
          setMessage(data.message || "Token tidak valid.");
        }
      } catch (error) {
        setTokenValid(false);
        setMessage("Gagal memeriksa token.");
      }

      setLoading(false);
    };

    validateToken();
  }, [token, API_URL]);

  // ============================================================
  // 🔒 SUBMIT PASSWORD UNTUK AKTIVASI
  // ============================================================
  const handleActivate = async () => {
    if (!password || !confirmPassword) {
      setMessage("Semua field harus diisi!");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter!");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password tidak cocok!");
      return;
    }

    setMessage("Mengaktifkan akun...");

    try {
      const res = await fetch(`${API_URL}/api/staff/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Akun berhasil diaktifkan! Mengalihkan ke login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "Aktivasi gagal.");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan server.");
    }
  };

  // ============================================================
  // 🖥️ UI
  // ============================================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 bg-white shadow-xl rounded-2xl max-w-md w-full border border-gray-200"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Aktivasi Akun Staff
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-600 animate-pulse text-center">{message}</p>
        ) : tokenValid ? (
          <>
            <p className="mb-4 text-gray-700 text-center">
              👋 Halo, <span className="font-semibold text-yellow-700">{staffName}</span>
              <br />
              {message}
            </p>

            <div className="space-y-3">
              <input
                type="password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                placeholder="Password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                placeholder="Konfirmasi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                onClick={handleActivate}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg transition font-medium shadow-md"
              >
                Aktifkan Akun
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">{message}</p>
            </div>
          </>
        ) : (
          <p className="text-red-600 text-center font-medium">{message}</p>
        )}
      </motion.div>
    </div>
  );
}
