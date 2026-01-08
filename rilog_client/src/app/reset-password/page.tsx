"use client";

import { FC, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const ResetPasswordPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak ditemukan");
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi
    if (!newPassword || !confirmPassword) {
      setError("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mereset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-3xl shadow-lg rounded-2xl overflow-hidden">
        {/* KIRI */}
        <div className="hidden md:flex relative w-1/2 bg-white p-8">
          <img
            src="/logo.png"
            alt="RILOG Logo"
            className="w-24 absolute top-6 left-6"
          />
          <div className="m-auto max-w-xs">
            <img
              src="/login.png"
              alt="Reset Password Illustration"
              className="w-full"
            />
          </div>
        </div>

        {/* FORM RESET PASSWORD */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 md:px-12 py-10 bg-[#FFF7ED]">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Reset <span className="text-yellow-500">Kata Sandi</span>
          </h1>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Masukkan kata sandi baru Anda
          </p>

          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold">✅ Password berhasil direset!</p>
              <p className="text-sm">Anda akan diarahkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Password Baru */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">
                  <Image
                    src="/sandi-pengguna.svg"
                    alt="Password"
                    width={20}
                    height={20}
                  />
                </span>
                <input
                  type="password"
                  placeholder="Kata Sandi Baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-black rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {/* Konfirmasi Password */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">
                  <Image
                    src="/sandi-pengguna.svg"
                    alt="Password"
                    width={20}
                    height={20}
                  />
                </span>
                <input
                  type="password"
                  placeholder="Konfirmasi Kata Sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-black rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-semibold transition disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Reset Kata Sandi"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-gray-600 text-center">
            Ingat kata sandi Anda?{" "}
            <Link
              href="/login"
              className="text-yellow-500 font-semibold hover:underline"
            >
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;