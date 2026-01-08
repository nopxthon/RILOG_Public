"use client";

import { FC, useState, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LoginSuperadminForm {
  username: string;
  password: string;
}

const SuperadminLoginPage: FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginSuperadminForm>({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback ke localhost 5000 jika env belum diset
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Akses ditolak. Periksa kredensial Anda.");
        setLoading(false);
        return;
      }

      const { token, user } = data.data;

      localStorage.setItem("superToken", token);
      localStorage.setItem("superUser", JSON.stringify(user));
      
      document.cookie = `superToken=${token}; path=/; max-age=86400; SameSite=Lax`;

      router.push("/superadmin");
      
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-3xl shadow-lg rounded-2xl overflow-hidden">

        {/* KIRI: Ilustrasi */}
        <div className="hidden md:flex relative w-1/2 bg-white p-8 flex-col items-center justify-center">
          <div className="absolute top-6 left-6">
             <Image src="/logo.png" alt="RILOG Logo" width={100} height={40} />
          </div>
          <div className="m-auto max-w-xs text-center">
            <Image src="/login.png" alt="Login Illustration" width={300} height={300} className="w-full" />
            <p className="mt-4 text-sm text-gray-400 font-semibold tracking-widest">
              SUPERADMIN PORTAL
            </p>
          </div>
        </div>

        {/* KANAN: Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 md:px-12 py-10 bg-[#FFF7ED]">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
            System <span className="text-yellow-500">Control</span>
          </h1>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Please enter your root credentials
          </p>

          <div className="space-y-4">
            
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Image src="/email-pengguna.svg" alt="User" width={20} height={20} />
              </span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full border border-black rounded-lg pl-10 pr-3 py-2 text-gray-800 focus:ring-2 focus:ring-orange-400 outline-none transition bg-white"
                required
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Image src="/sandi-pengguna.svg" alt="Password" width={20} height={20} />
              </span>
              <input
                type="password"
                name="password"
                placeholder="Kata Sandi"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full border border-black rounded-lg pl-10 pr-3 py-2 text-gray-800 focus:ring-2 focus:ring-orange-400 outline-none transition bg-white"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-100 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-bold transition disabled:opacity-60 shadow-sm mt-4 flex justify-center items-center"
            >
              {loading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                "Masuk"
              )}
            </button>
            
            <div className="text-center mt-4">
                <button 
                  onClick={() => router.push('/')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  &larr; Kembali ke Website
                </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SuperadminLoginPage;