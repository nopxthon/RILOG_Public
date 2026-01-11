"use client";

import { useEffect, FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as LinkScroll } from "react-scroll";
import YellowBalls from "../components/YellowBalls";
import PricingSection from "../components/PricingSection";

interface NavItem {
  to: string;
  label: string;
}

interface Feature {
  img: string;
  title: string;
  desc: string;
}

interface UserTarget {
  img: string;
  title: string;
  desc: string;
  border: string;
}

const LandingPage: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // AOS init would go here
    // AOS.init({ duration: 1000, once: true });
  }, []);

  const navItems: NavItem[] = [
    { to: "home", label: "Home" },
    { to: "features", label: "Fitur" },
    { to: "pricing", label: "Harga" },
    { to: "contact", label: "Kontak" },
  ];

  const features: Feature[] = [
    { img: "/pencatatan.png", title: "Pencatatan", desc: "Memudahkan pencatatan barang masuk dan keluar" },
    { img: "/monitoring.png", title: "Monitoring", desc: "Pantau ketersediaan barang real-time lewat dashboard" },
    { img: "/laporan.png", title: "Laporan Stok", desc: "Lihat grafik tren dan laporan inventaris secara otomatis" },
    { img: "/notifikasi.png", title: "Notifikasi", desc: "Peringatan saat stok menipis, berlebih, atau kadaluarsa" },
  ];

  const userTargetsRow1: UserTarget[] = [
    { img: "/retail.svg", title: "Retail & Minimarket", desc: "Memantau stok barang harian", border: "border-yellow-400" },
    { img: "/umkm.svg", title: "UMKM / Online Shop", desc: "Kelola produk dan gudang kecil", border: "border-red-400" },
    { img: "/distributor.svg", title: "Distributor & Supplier", desc: "Awasi stok di berbagai lokasi gudang", border: "border-green-300" },
  ];

  const userTargetsRow2: UserTarget[] = [
    { img: "/fnb.svg", title: "F&B (Food & Beverage)", desc: "Pastikan bahan baku selalu tersedia", border: "border-pink-200" },
    { img: "/gudang.svg", title: "Gudang Perusahaan", desc: "Catat barang masuk & keluar secara akurat", border: "border-yellow-400" },
  ];

  return (
    <div className="font-sans text-black relative">
      {/* Background */}
      <YellowBalls />

      {/* Navbar - RESPONSIVE */}
      <nav className="flex justify-between items-center py-3 md:py-4 px-4 md:px-8 shadow-sm bg-gray-50 sticky top-0 z-50">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Logo Rilog" width={100} height={33} className="md:w-[120px] md:h-[40px]" priority />
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 ml-auto">
          {navItems.map((item, i) => (
            <LinkScroll
              key={i}
              to={item.to}
              smooth
              spy
              offset={-80}
              duration={500}
              activeClass="text-yellow-600 font-semibold"
              className="cursor-pointer hover:text-yellow-600 font-medium transition-colors"
            >
              {item.label}
            </LinkScroll>
          ))}
          <Link
            href="/login"
            className="border border-[#F7B952] shadow-md px-4 py-1 rounded-md hover:bg-yellow-500 hover:text-black transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex flex-col space-y-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-50 shadow-lg md:hidden">
            <div className="flex flex-col py-4">
              {navItems.map((item, i) => (
                <LinkScroll
                  key={i}
                  to={item.to}
                  smooth
                  spy
                  offset={-80}
                  duration={500}
                  activeClass="text-yellow-600 font-semibold"
                  className="cursor-pointer hover:text-yellow-600 font-medium transition-colors px-6 py-3 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </LinkScroll>
              ))}
              <Link
                href="/login"
                className="mx-6 mt-2 text-center border border-[#F7B952] shadow-md px-4 py-2 rounded-md hover:bg-yellow-500 hover:text-black transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - RESPONSIVE */}
      <section id="home" className="text-center py-12 md:py-20 px-4 bg-gray-50 bg-opacity-80">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed px-2">
          Kelola Stok Gudang Lebih <span className="text-yellow-500">Cepat dan Akurat</span>, <br className="hidden sm:block" />
          Langsung dari Dashboard Anda
        </h1>
        <p className="mt-3 italic text-sm md:text-base">"Rapi, Cepat, Tanpa Repot!"</p>
        <Link
          href="/login"
          className="mt-6 md:mt-8 inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-6 md:px-8 py-2.5 md:py-3 rounded-md shadow-md font-medium transition text-sm md:text-base"
        >
          Masuk Sekarang - Gratis 14 Hari
        </Link>
      </section>

      {/* Features Section - RESPONSIVE */}
      <section id="features" className="py-12 md:py-16 bg-gray-100 px-4">
        <h2 className="text-center text-xl md:text-2xl font-bold px-2">
          We Provide The Best <span className="text-yellow-500">Features</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-10 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded-lg p-5 md:p-6 text-center hover:shadow-lg transition"
            >
              <Image src={f.img} alt={f.title} width={48} height={48} className="mx-auto mb-3" />
              <h3 className="font-bold text-base md:text-lg">{f.title}</h3>
              <p className="text-sm mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About RILOG - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-white px-6 md:px-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Apa itu <span className="text-yellow-500">RILOG?</span>
        </h2>
        <p className="max-w-3xl mx-auto text-black text-base md:text-lg leading-relaxed">
          <strong>RILOG</strong> adalah aplikasi manajemen gudang pintar untuk mencatat, memantau,
          dan mengontrol stok secara real-time dengan mudah dan akurat. Dirancang untuk
          membantu UMKM hingga bisnis berkembang dalam mengelola stok gudang secara
          lebih rapi, efisien, dan mengurangi kesalahan pencatatan manual.
        </p>
      </section>

      {/* Why Section - RESPONSIVE */}
      <section 
        className="flex flex-col md:flex-row items-center justify-center py-12 md:py-20 px-6 md:px-8 gap-6 md:gap-x-16" 
        style={{ backgroundColor: "#FEF8EE" }}
      >
        <Image 
          src="/gudang.png" 
          alt="Ilustrasi Gudang" 
          width={288} 
          height={288} 
          className="max-w-full w-48 md:w-72"
        />
        <div className="px-4 md:px-8 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold">Kenapa Harus RILOG?</h2>
          <ul className="mt-4 md:mt-6 space-y-2 md:space-y-3 text-base md:text-lg">
            <li>✅ <span className="ml-2">Mengurangi kesalahan tulis dan hitung</span></li>
            <li>✅ <span className="ml-2">Lebih cepat & efisien</span></li>
            <li>✅ <span className="ml-2">Monitoring otomatis</span></li>
            <li>✅ <span className="ml-2">Akses kapan saja</span></li>
          </ul>
          <Link
            href="/login"
            className="mt-6 md:mt-8 inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-6 md:px-8 py-2.5 md:py-3 rounded-md shadow-md font-medium transition text-sm md:text-base"
          >
            Coba Sekarang - Gratis
          </Link>
        </div>
      </section>

      {/* Target Users - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-gray-50 px-4">
        <h2 className="text-center text-xl md:text-2xl font-bold mb-8 md:mb-12 px-2">
          Dapat digunakan oleh <span className="text-yellow-500">Berbagai Usaha</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto text-center">
          {userTargetsRow1.map((u, i) => (
            <div
              key={i}
              className={`border-2 ${u.border} rounded-lg p-6 md:p-8 bg-white hover:shadow-lg transition`}
            >
              <Image src={u.img} alt={u.title} width={48} height={48} className="mx-auto mb-4" />
              <h3 className="font-bold text-base md:text-lg">{u.title}</h3>
              <p className="text-sm mt-2 text-gray-600">{u.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto mt-6 md:mt-8 text-center">
          {userTargetsRow2.map((u, i) => (
            <div
              key={i}
              className={`border-2 ${u.border} rounded-lg p-6 md:p-8 bg-white hover:shadow-lg transition`}
            >
              <Image src={u.img} alt={u.title} width={48} height={48} className="mx-auto mb-4" />
              <h3 className="font-bold text-base md:text-lg">{u.title}</h3>
              <p className="text-sm mt-2 text-gray-600">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer - RESPONSIVE */}
      <footer id="contact" className="bg-[#fdf6ec] text-black py-12 md:py-20 lg:py-40 px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          <div>
            <Image src="/rilog.png" alt="Logo Rilog" width={140} height={40} className="mb-4" />
            <h4 className="font-bold text-base md:text-lg mb-3">Follow Us</h4>
            <div className="flex space-x-4 mb-6">
              <a href="https://wa.me/6281275809641" target="_blank" rel="noopener noreferrer">
                <Image src="/whatsapp.svg" alt="WhatsApp" width={28} height={28} />
              </a>
              <a href="mailto:rilog@gmail.com">
                <Image src="/email.svg" alt="Email" width={28} height={28} />
              </a>
              <a href="https://www.instagram.com/rilog.id" target="_blank" rel="noopener noreferrer">
                <Image src="/instagram.svg" alt="Instagram" width={28} height={28} />
              </a>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Rilog adalah aplikasi manajemen gudang pintar untuk mencatat,
              memantau, dan mengontrol stok secara real-time dengan mudah dan akurat.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-base md:text-lg mb-4">Hubungi Kami</h4>
            <p className="text-sm">Call Center</p>
            <p className="font-medium">+62 813-7058-5407</p>
            <p className="text-sm mt-4">Email</p>
            <p className="font-medium">rilog.app@gmail.com</p>
            <Link
              href="/login"
              className="mt-6 inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-5 md:px-6 py-2 rounded-md shadow hover:bg-[#e89b1e] transition font-semibold text-sm md:text-base"
            >
              Contact Us Now
            </Link>
          </div>

          <div>
            <h4 className="font-bold text-base md:text-lg mb-4">Newsletter</h4>
            <p className="text-sm mb-4">
              Masukkan email Anda untuk mendapatkan update terbaru dan promo menarik dari kami.
            </p>
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-2 rounded-md border border-gray-300 w-full focus:outline-none mb-4 text-sm md:text-base"
            />
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-md font-semibold transition text-sm md:text-base">
              Langganan
            </button>
          </div>
        </div>
        <div className="text-center text-xs md:text-sm text-black mt-8 md:mt-12 border-t border-yellow-500 pt-6">
          © 2025 Rilog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;