"use client";

import {
  FC,
  useState,
  useLayoutEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

interface RegisterForm {
  username: string;
  email: string;
  businessName: string;
  businessType: string;
  warehouseName: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const STORAGE_KEY = "registerData";

const RegisterPage: FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    email: "",
    businessName: "",
    businessType: "",
    warehouseName: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({
          username: parsed.username || "",
          email: parsed.email || "",
          businessName: parsed.nama_bisnis || "",
          businessType: parsed.tipe_bisnis || "",
          warehouseName: parsed.nama_gudang || "",
          password: parsed.password || "",
          confirmPassword: parsed.confirmPassword || "",
          terms: parsed.terms ?? false,
        });
      } catch (e) {
        console.error("Gagal parse sessionStorage:", e);
      }
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const updated = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    setFormData(updated);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ✅ FUNGSI BARU: Menampilkan Syarat & Ketentuan
  const showTerms = () => {
    Swal.fire({
      title: '<span style="color:#000; font-weight:700">Syarat & Ketentuan </span><span style="color:#eab308; font-weight:700">RILOG</span>',
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.7; color:#374151">

          <p style="margin-bottom:12px">
            Dengan mendaftar dan menggunakan aplikasi RILOG, pengguna dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang berlaku.
          </p>

          <p><b>1. Penggunaan Aplikasi</b></p>
          <ol style="padding-left:18px; margin-bottom:12px">
            <li>RILOG adalah aplikasi manajemen stok gudang untuk membantu UMKM.
            Aplikasi digunakan sesuai hukum yang berlaku.</li>
          </ol>

          <p><b>2. Akun Pengguna</b></p>
          <ol style="padding-left:18px; margin-bottom:12px">
            <li>
            Pengguna wajib memberikan data yang benar dan valid, menjaga keamanan akun secara
            pribadi, serta bertanggung jawab penuh atas seluruh aktivitas yang terjadi pada
            akun tersebut. RILOG berhak menonaktifkan akun apabila ditemukan pelanggaran
            terhadap ketentuan yang berlaku.
            </li>
          </ol>

          <p><b>3. Kerahasiaan Data</b></p>
          <ol style="padding-left:18px; margin-bottom:12px">
            <li>RILOG menjaga kerahasiaan data pengguna.
            Data tidak dibagikan tanpa izin kecuali diwajibkan hukum.</li>
          </ol>

          <p><b>4. Tanggung Jawab</b></p>
          <ol style="padding-left:18px; margin-bottom:12px">
            <li>Pengguna bertanggung jawab atas data yang dimasukkan.
            RILOG tidak bertanggung jawab atas kesalahan pengguna.</li>
          </ol>

          <p><b>5. Perubahan Ketentuan</b></p>
          <ol style="padding-left:18px">
            <li>Syarat & Ketentuan dapat berubah sewaktu-waktu.</li>
          </ol>

        </div>
      `,
      confirmButtonText: "Saya Mengerti",
      confirmButtonColor: "#eab308",
      width: 600,
    });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.terms) {
      Swal.fire({
        icon: "warning",
        title: "Syarat & Ketentuan",
        text: "Harap setujui Syarat & Ketentuan terlebih dahulu!",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Tidak Cocok",
        text: "Konfirmasi password tidak cocok!",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            nama_bisnis: formData.businessName,
            tipe_bisnis: formData.businessType,
            nama_gudang: formData.warehouseName,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim OTP");

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          nama_bisnis: formData.businessName,
          tipe_bisnis: formData.businessType,
          nama_gudang: formData.warehouseName,
          terms: formData.terms,
        })
      );

      Swal.fire({
        icon: "success",
        title: "OTP Terkirim!",
        text: "Kode OTP telah dikirim ke email kamu. Silakan cek email.",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      }).then(() => {
        router.push("/register/verify-otp");
      });

    } catch (err: any) {
      console.error("❌ Error saat registrasi:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Registrasi",
        text: err.message || "Terjadi kesalahan pada proses registrasi.",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
    } finally {
      setLoading(false);
    }
  };
  

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
        delayChildren: 0.2,
        staggerChildren: 0.08
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const
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
        delay: custom * 0.07,
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
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-4 py-8 relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden relative z-10"
      >
        {/* Kiri */}
        <motion.div
          variants={leftPanelVariants}
          className="hidden md:flex relative w-1/2 bg-gradient-to-br from-white to-gray-50 p-6"
          style={{ perspective: 1000 }}
        >
          <motion.img
            variants={logoVariants}
            src="/logo.png"
            alt="RILOG Logo"
            className="w-20 absolute top-5 left-5"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <motion.div 
            className="m-auto max-w-[220px]"
            variants={illustrationVariants}
            animate={["visible", "float"]}
          >
            <img src="/register.png" alt="Register Illustration" className="w-full drop-shadow-2xl" />
          </motion.div>
        </motion.div>

        {/* Kanan / Form */}
        <motion.div
          variants={rightPanelVariants}
          className="flex flex-col justify-center w-full md:w-1/2 px-6 md:px-10 py-6 bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5]"
        >
          <motion.h1
            variants={titleVariants}
            className="text-2xl font-bold mb-1 text-center md:text-left"
          >
            Welcome to <span className="text-yellow-500">RILOG!</span>
          </motion.h1>
          <motion.p
            variants={titleVariants}
            className="text-gray-600 mb-4 text-sm text-center md:text-left"
          >
            Start optimizing stock with ease
          </motion.p>

          <form onSubmit={handleRegister} className="space-y-3">
            {/* Nama Pengguna */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={0}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                className="absolute left-3 top-2.5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/nama-pengguna.svg" alt="User" width={18} height={18} />
              </motion.span>
              <motion.input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nama Pengguna"
                required
                className="w-full border border-black rounded-md pl-9 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              />
            </motion.div>

            {/* Email */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={1}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                className="absolute left-3 top-2.5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/email-pengguna.svg" alt="Email" width={18} height={18} />
              </motion.span>
              <motion.input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full border border-black rounded-md pl-9 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              />
            </motion.div>

            {/* Nama Bisnis */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={2}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                className="absolute left-3 top-2.5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/nama-bisnis.svg" alt="Business" width={18} height={18} />
              </motion.span>
              <motion.input
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Nama Bisnis"
                required
                className="w-full border border-black rounded-md pl-9 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              />
            </motion.div>

            {/* Tipe Bisnis */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={3}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                className="absolute left-3 top-2.5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/tipe-bisnis.svg" alt="Business Type" width={18} height={18} />
              </motion.span>
              <motion.select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="w-full border border-black rounded-md pl-9 pr-3 py-1.5 text-sm text-gray-600 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              >
                <option value="">Tipe Bisnis</option>
                <optgroup label="Perusahaan & B2B">
                  <option value="startup-teknologi">Startup Teknologi</option>
                  <option value="software-house">Software House / Agency</option>
                  <option value="konsultan">Jasa Konsultan</option>
                  <option value="gudang-logistik">Gudang Logistik & Ekspedisi</option>
                  <option value="pabrik">Pabrik / Manufaktur</option>
                  <option value="distributor-utama">Distributor Utama (Principal)</option>
                </optgroup>
                <optgroup label="Ritel & Kebutuhan Harian">
                  <option value="toko-kelontong">Toko Kelontong / Sembako</option>
                  <option value="mini-market">Mini Market</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="grosir">Grosir / Distributor</option>
                  <option value="frozen-food">Toko Frozen Food</option>
                  <option value="toko-buah">Toko Buah & Sayur</option>
                  <option value="pet-shop">Pet Shop (Makanan Hewan)</option>
                </optgroup>
                <optgroup label="Makanan & Minuman">
                  <option value="restoran">Restoran</option>
                  <option value="coffee-shop">Coffee Shop / Cafe</option>
                  <option value="bakery">Bakery & Pastry</option>
                  <option value="catering">Catering</option>
                </optgroup>
                <optgroup label="Fashion & Gaya Hidup">
                  <option value="butik">Butik / Toko Pakaian</option>
                  <option value="distro">Distro (Clothing Line)</option>
                  <option value="toko-sepatu">Toko Sepatu & Tas</option>
                  <option value="toko-aksesoris">Aksesoris & Perhiasan</option>
                  <option value="toko-kosmetik">Toko Kosmetik & Skincare</option>
                  <option value="apotek">Apotek / Toko Obat</option>
                  <option value="baby-shop">Perlengkapan Bayi</option>
                </optgroup>
                <optgroup label="Elektronik & Hobi">
                  <option value="toko-elektronik">Toko Elektronik</option>
                  <option value="counter-hp">Counter HP & Pulsa</option>
                  <option value="toko-komputer">Toko Komputer & Laptop</option>
                  <option value="toko-mainan">Toko Mainan & Hobi</option>
                  <option value="toko-buku">Toko Buku & ATK</option>
                  <option value="pet-shop">Pet Shop</option>
                  <option value="vape-store">Vape Store</option>
                  <option value="toko-musik">Toko Alat Musik</option>
                </optgroup>
                <optgroup label="Rumah Tangga & Bangunan">
                  <option value="toko-bangunan">Toko Bangunan (Material)</option>
                  <option value="toko-mebel">Toko Mebel (Furniture)</option>
                  <option value="perabot-rumah">Perabotan Rumah Tangga</option>
                  <option value="toko-cat">Toko Cat</option>
                  <option value="florist">Florist / Toko Bunga</option>
                </optgroup>
                <optgroup label="Otomotif">
                  <option value="bengkel">Bengkel Motor / Mobil</option>
                  <option value="toko-sparepart">Toko Sparepart / Variasi</option>
                  <option value="showroom">Showroom Kendaraan</option>
                </optgroup>
                <optgroup label="Jasa & Layanan">
                  <option value="laundry">Laundry</option>
                  <option value="salon">Salon / Barbershop</option>
                  <option value="percetakan">Percetakan / Fotocopy</option>
                  <option value="klinik">Klinik Kesehatan</option>
                  <option value="jasa-servis">Jasa Servis Elektronik</option>
                </optgroup>
              </motion.select>
            </motion.div>

            {/* Nama Gudang */}
            <motion.div 
              className="relative"
              variants={inputVariants}
              custom={4}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                className="absolute left-3 top-2.5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/warehouse.svg" alt="Warehouse" width={18} height={18} />
              </motion.span>
              <motion.input
                name="warehouseName"
                value={formData.warehouseName}
                onChange={handleChange}
                placeholder="Nama Gudang"
                required
                className="w-full border border-black rounded-md pl-9 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              />
            </motion.div>

            {/* Password */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              variants={inputVariants}
              custom={5}
              initial="hidden"
              animate="visible"
            >
              <motion.input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Kata Sandi"
                required
                className="border border-black rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              />
              <motion.input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi Kata Sandi"
                required
                className="border border-black rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                whileFocus={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              />
            </motion.div>

            {/* ✅ PERUBAHAN: Checkbox Terms dengan Button yang bisa diklik */}
            <motion.div 
              className="flex items-center gap-2 text-xs md:text-sm"
              variants={inputVariants}
              custom={6}
              initial="hidden"
              animate="visible"
            >
              <motion.input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="w-4 h-4"
                whileTap={{ scale: 0.9 }}
              />
              <label className="text-gray-600">
                Saya setuju dengan{" "}
                <button
                  type="button"
                  onClick={showTerms}
                  className="text-orange-500 hover:underline"
                >
                  Syarat & Ketentuan
                </button>
              </label>
            </motion.div>

            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-1.5 rounded-md font-semibold text-sm transition shadow-lg"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : "Daftar"}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-xs md:text-sm text-gray-600 text-center"
          >
            Sudah punya akun?{" "}
            <Link href="/login" className="text-yellow-500 font-semibold hover:underline">
              <motion.span 
                className="inline-block"
                whileHover={{ scale: 1.05 }}
              >
                Masuk
              </motion.span>
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default RegisterPage;