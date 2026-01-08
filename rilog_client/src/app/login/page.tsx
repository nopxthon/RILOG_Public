"use client";

import { FC, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface LoginForm {
  email: string;
  userType: string;
  password: string;
}

const LoginPage: FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    userType: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login gagal. Periksa kembali data Anda.");
        setLoading(false);
        return;
      }

      const user = data.data.user;

      // Reset semua localStorage dulu
      localStorage.clear();

      // Simpan token & data user
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userData", JSON.stringify(user));

      // Simpan bisnis dan gudang
      if (user.bisnis_id) {
        localStorage.setItem("bisnis_id", user.bisnis_id);
        localStorage.setItem("bisnis_nama", user.bisnis_nama || "");
      }

      const gudangList = user.gudang_list || [];
      localStorage.setItem("gudang_list", JSON.stringify(gudangList));

      if (user.gudang_id) {
        localStorage.setItem("gudang_id", user.gudang_id);
        localStorage.setItem("gudang_nama", user.gudang_nama || "");
      } else if (gudangList.length > 0) {
        localStorage.setItem("gudang_id", gudangList[0].id);
        localStorage.setItem("gudang_nama", gudangList[0].nama_gudang);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotError(data.message || "Gagal mengirim email reset. Coba lagi.");
        setForgotLoading(false);
        return;
      }

      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail("");
        setForgotSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotError("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotError(null);
    setForgotSuccess(false);
  };

  // Variants untuk animasi yang lebih dramatis
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  const leftPanelVariants = {
    hidden: { 
      x: -100, 
      opacity: 0,
      rotateY: -15
    },
    visible: { 
      x: 0, 
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        duration: 0.8
      }
    }
  };

  const rightPanelVariants = {
    hidden: { 
      x: 100, 
      opacity: 0,
      rotateY: 15
    },
    visible: { 
      x: 0, 
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        duration: 0.8
      }
    }
  };

  const titleVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200
      }
    }
  };

  const inputVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (custom: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: custom * 0.1,
        type: "spring" as const,
        damping: 15,
        stiffness: 150
      }
    })
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)",
      transition: {
        type: "spring" as const,
        damping: 10,
        stiffness: 400
      }
    },
    tap: { scale: 0.95 }
  };

  const logoVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 200,
        delay: 0.3
      }
    }
  };

  const illustrationVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 50 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 100,
        delay: 0.5
      }
    },
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
      }
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-4 relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden relative z-10"
      >
        {/* KIRI */}
        <motion.div
          variants={leftPanelVariants}
          className="hidden md:flex relative w-1/2 bg-gradient-to-br from-white to-gray-50 p-8"
          style={{ perspective: 1000 }}
        >
          <motion.div
            variants={logoVariants}
            className="absolute top-6 left-6"
          >
            <Link href="/" className="hover:opacity-80 transition">
              <motion.img 
                src="/logo.png" 
                alt="RILOG Logo" 
                className="w-24"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </Link>
          </motion.div>
          <motion.div 
            className="m-auto max-w-xs"
            variants={illustrationVariants}
            animate={["visible", "float"]}
          >
            <img src="/login.png" alt="Login Illustration" className="w-full drop-shadow-2xl" />
          </motion.div>
        </motion.div>

        {/* FORM LOGIN */}
        <motion.div
          variants={rightPanelVariants}
          className="flex flex-col justify-center w-full md:w-1/2 px-6 md:px-12 py-10 bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5]"
        >
          {/* Link ke Landing Page untuk mobile */}
          <motion.div 
            className="md:hidden mb-4 text-center"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
          >
            <Link href="/" className="inline-block hover:opacity-80 transition">
              <img src="/logo.png" alt="RILOG Logo" className="w-20 mx-auto" />
            </Link>
          </motion.div>

          <motion.h1
            variants={titleVariants}
            className="text-2xl md:text-3xl font-bold mb-2"
          >
            Welcome to <span className="text-yellow-500">RILOG!</span>
          </motion.h1>
          <motion.p
            variants={titleVariants}
            className="text-gray-600 mb-6 text-sm md:text-base"
          >
            Start optimizing stock with ease
          </motion.p>

          <div className="space-y-4">
            {/* JENIS PENGGUNA */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={0}
            >
              <motion.span 
                className="absolute left-3 top-2.5 text-gray-500"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/jenis-pengguna.svg" alt="User Type" width={20} height={20} />
              </motion.span>
              <motion.select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full border border-black rounded-lg pl-10 pr-3 py-2 text-gray-600 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                required
              >
                <option value="" hidden>Jenis Pengguna</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </motion.select>
            </motion.div>

            {/* Email */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={1}
            >
              <motion.span 
                className="absolute left-3 top-2.5 text-gray-500"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/email-pengguna.svg" alt="Email" width={20} height={20} />
              </motion.span>
              <motion.input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-black rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={2}
            >
              <motion.span 
                className="absolute left-3 top-2.5 text-gray-500"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/sandi-pengguna.svg" alt="Password" width={20} height={20} />
              </motion.span>
              <motion.input
                type="password"
                name="password"
                placeholder="Kata Sandi"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
                className="w-full border border-black rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                required
              />
            </motion.div>

            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg py-2 px-3"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-2 rounded-lg font-semibold transition disabled:opacity-60 shadow-lg"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : "Masuk"}
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-between text-sm"
          >
            <motion.button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-yellow-500 hover:text-yellow-700 font-semibold hover:underline"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              Lupa Kata Sandi?
            </motion.button>
            <p className="text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-yellow-500 hover:text-yellow-700 font-semibold hover:underline">
                <motion.span 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="inline-block"
                >
                  Daftar
                </motion.span>
              </Link>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-3 text-sm text-gray-600 text-center"
          >
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 font-medium hover:underline">
              <motion.span 
                className="inline-block"
                whileHover={{ x: -5 }}
              >
                ← Kembali ke Halaman Utama
              </motion.span>
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>

      {/* MODAL LUPA SANDI */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={closeForgotPasswordModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotateX: -15, y: 50 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotateX: 15, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative"
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: 1000 }}
            >
              <motion.button
                onClick={closeForgotPasswordModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                &times;
              </motion.button>

              <motion.h2 
                className="text-2xl font-bold mb-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Lupa Kata Sandi?
              </motion.h2>
              <motion.p 
                className="text-gray-600 mb-6 text-sm"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Masukkan email Anda dan kami akan mengirimkan link untuk reset kata sandi.
              </motion.p>

              <div className="space-y-4">
                <motion.div 
                  className="relative"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span 
                    className="absolute left-3 top-2.5 text-gray-500"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image src="/email-pengguna.svg" alt="Email" width={20} height={20} />
                  </motion.span>
                  <motion.input
                    type="email"
                    placeholder="Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleForgotPassword();
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                    whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                    required
                  />
                </motion.div>

                <AnimatePresence>
                  {forgotError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg py-2 px-3"
                    >
                      {forgotError}
                    </motion.p>
                  )}

                  {forgotSuccess && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-green-500 text-sm text-center bg-green-50 border border-green-200 rounded-lg py-2 px-3"
                    >
                      ✅ Email reset kata sandi berhasil dikirim! Silakan cek inbox Anda.
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-2 rounded-lg font-semibold transition disabled:opacity-60 shadow-lg"
                >
                  {forgotLoading ? "Mengirim..." : "Kirim Link Reset"}
                </motion.button>
              </div>

              <motion.button
                onClick={closeForgotPasswordModal}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Kembali ke Login
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LoginPage;