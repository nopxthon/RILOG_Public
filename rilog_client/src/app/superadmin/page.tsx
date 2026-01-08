// src/app/superadmin/page.tsx
"use client";

import { FC, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaBell, FaBars, FaExclamationTriangle } from "react-icons/fa";
import Sidebar from "@/components/Sidebaradmin";
import SearchBar from "@/components/SearchBar";
import PopupDatePicker from "@/components/PopupDatePicker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNotifikasiSuperAdmin } from "@/hooks/useNotifikasiSuperAdmin";
import { NotifikasiSuperAdmin as NotifikasiType } from "@/types/notifikasisuperadmin";
import NotifikasiSuperAdmin, { NotifikasiSuperAdminType } from "@/components/NotifikasiSuperAdmin";

interface CardItem {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}

const DashboardPage: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  // Data dummy grafik pengguna
  const userData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: Math.floor(2000 + Math.random() * 8000),
  }));

  const handleSearch = (value: string) => setSearchValue(value.toLowerCase());

  const notifikasiData: NotifikasiSuperAdminType[] = [
    { id: "1", message: "Langganan PT Maju Bersama berakhir 5 hari lagi!", type: "warning", icon: "notifikasi-expired.svg" },
    { id: "2", message: "Transaksi CV Berkah gagal!", type: "error", icon: "notifikasi-peringatan.svg" },
    { id: "3", message: "PT Sumber Jaya Overdue!", type: "warning", icon: "notifikasi-expired.svg" },
    { id: "4", message: "Transaksi Ifood Shop gagal!", type: "error", icon: "notifikasi-peringatan.svg" },
  ];

  const {
    notifikasiList,
    handleHapusNotifikasi,
    handleHapusSemuaNotifikasi,
  } = useNotifikasiSuperAdmin(notifikasiData);

  const filteredNotifications = useMemo(
    () => notifikasiList.filter(n => n.message.toLowerCase().includes(searchValue)),
    [notifikasiList, searchValue]
  );

  const cards: CardItem[] = [
    { label: "Aktif", value: 100, color: "bg-teal-100", icon: "" },
    { label: "Akan Berakhir", value: 30, color: "bg-blue-100", icon: "" },
    { label: "Berakhir", value: 10, color: "bg-orange-100", icon: "" },
    { label: "Total Pengguna", value: "120", color: "bg-blue-100", icon: "" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        {/* Topbar */}
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 right-0 z-50">
          <div className="flex items-center justify-between gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl">
                <FaBars />
              </button>
            )}

            <SearchBar
              placeholder="Cari notifikasi atau aktivitas..."
              className="flex-1"
              onSearch={handleSearch}
            />

            <div className="flex items-center gap-4">
              <button
                className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm"
                onClick={() => setShowNotifikasi(true)}
              >
                <FaBell className="text-yellow-500 text-lg" />
                {notifikasiList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifikasiList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => router.push("/")}
                className="bg-[#FFFAF0] hover:bg-[#FFF3E0] transition rounded-full p-3 shadow-sm"
              >
                <Image src="/logout.svg" alt="Logout" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Container */}
        <div className="px-6 pb-6">
          {/* Alert Notifikasi */}
          {notifikasiList.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                  <div>
                    <h3 className="font-semibold text-red-800">Notifikasi</h3>
                    <p className="text-red-600 text-sm">
                      Ada {notifikasiList.length} notifikasi penting
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotifikasi(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          )}

          {/* Ringkasan Langganan */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-6">Ringkasan Langganan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {cards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-4 text-center border">
                  <div className="flex items-center justify-center mb-2">
                    <span
                      className={`flex items-center gap-1 ${card.color} text-gray-800 border rounded-full px-3 py-1 text-xs font-semibold`}
                    >
                      {card.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Analitik Pengguna</h3>
                <PopupDatePicker />
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[2000, 10000]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#8979FF"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Notifications & Subscription */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Notifikasi */}
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Notifikasi</h3>
                <button
                  className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
                  onClick={() => setShowNotifikasi(true)}
                >
                  Lihat Lengkapnya
                </button>
              </div>
              <ul className="space-y-3 text-sm">
                {filteredNotifications.map((notif, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <Image src={`/${notif.icon}`} alt={notif.type} width={20} height={20} />
                    <span>{notif.message}</span>
                  </li>
                ))}
                {filteredNotifications.length === 0 && (
                  <li className="text-gray-400 italic text-center py-4">Tidak ada notifikasi ditemukan</li>
                )}
              </ul>
            </div>

            {/* List Subscription */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">List Subscription</h3>
                <button
                  className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
                  onClick={() => setShowNotifikasi(true)}
                >
                  Lihat Lengkapnya
                </button>
              </div>

              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { nama: "PT Jaya Abadi", status: "Aktif" },
                  { nama: "CV Sinar Maju", status: "Aktif" },
                  { nama: "Mini Market MOO", status: "Aktif" },
                ].map((sub, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="font-medium">{sub.nama}</span>
                    <span className="flex items-center gap-1 bg-green-100 text-green-600 border border-green-500 rounded-full px-3 py-1 text-xs font-semibold">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span> {sub.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Notifikasi */}
      <NotifikasiSuperAdmin
        isOpen={showNotifikasi}
        onClose={() => setShowNotifikasi(false)}
        notifikasiList={notifikasiData}
        onHapusNotifikasi={handleHapusNotifikasi}
        onHapusSemuaNotifikasi={handleHapusSemuaNotifikasi}
      />
    </div>
  );
};

export default DashboardPage;
