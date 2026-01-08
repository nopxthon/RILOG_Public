// components/Footer.tsx
import { FC } from "react";
import Image from "next/image";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";

const Footer: FC = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-200 py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo & Deskripsi */}
        <div>
          <Image
            src="/rilog.png"
            alt="Rilog Logo"
            width={120}
            height={120}
            className="mb-4"
          />
          <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
          <div className="flex space-x-4 mb-4">
            <a href="#" aria-label="WhatsApp" className="hover:text-green-400">
              <FaWhatsapp size={24} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500">
              <FaInstagram size={24} />
            </a>
            <a href="#" aria-label="Email" className="hover:text-blue-400">
              <FaEnvelope size={24} />
            </a>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Rilog adalah aplikasi manajemen gudang pintar untuk mencatat,
            memantau, dan mengontrol stok secara real-time dengan mudah dan
            akurat.
          </p>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="text-xl font-bold mb-4">Hubungi Kami</h3>
          <p className="mb-3">
            <strong>Call Center</strong>
            <br /> 0812-7580-9641
          </p>
          <p className="mb-5">
            <strong>Email</strong>
            <br /> rilog@gmail.com
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition">
            Contact Us Now
          </button>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold mb-4">Newsletter</h3>
          <p className="mb-4 text-sm">
            Masukkan email Anda untuk mendapatkan update terbaru dan promo
            menarik dari kami.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Tambahkan fungsi submit email newsletter
            }}
          >
            <input
              type="email"
              placeholder="Email"
              required
              className="flex-1 px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              Langganan
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <p className="text-center text-gray-400 text-sm mt-10 border-t border-gray-700 pt-5">
        © 2025 Rilog. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
