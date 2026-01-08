"use client";

import { FC, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { FaBell, FaBars, FaFileExport } from "react-icons/fa";
import Sidebar from "@/components/Sidebaradmin";
import SearchBar from "@/components/SearchBar";
import PopupDatePicker from "@/components/PopupDatePicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNotifikasiSuperAdmin } from "@/hooks/useNotifikasiSuperAdmin";
import NotifikasiSuperAdmin, {
  NotifikasiSuperAdminType,
} from "@/components/NotifikasiSuperAdmin";

const LaporanSuperAdminPage: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  // Fungsi Export
  const handleExport = () => {
    alert("Data berhasil diexport!");
  };

  const handleSearch = (value: string) => setSearchValue(value.toLowerCase());

  const notifikasiData: NotifikasiSuperAdminType[] = [
    {
      id: "1",
      message: "Langganan PT Maju Bersama berakhir 5 hari lagi!",
      type: "warning",
      icon: "notifikasi-expired.svg",
    },
    {
      id: "2",
      message: "Transaksi CV Berkah gagal!",
      type: "error",
      icon: "notifikasi-peringatan.svg",
    },
    {
      id: "3",
      message: "PT Sumber Jaya Overdue!",
      type: "warning",
      icon: "notifikasi-expired.svg",
    },
    {
      id: "4",
      message: "Transaksi Ifood Shop gagal!",
      type: "error",
      icon: "notifikasi-peringatan.svg",
    },
  ];

  const { notifikasiList, handleHapusNotifikasi, handleHapusSemuaNotifikasi } =
    useNotifikasiSuperAdmin(notifikasiData);

  const filteredNotifications = useMemo(
    () =>
      notifikasiList.filter((n) =>
        n.message.toLowerCase().includes(searchValue)
      ),
    [notifikasiList, searchValue]
  );
  const pathname = usePathname();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "subscription") {
      router.push("/laporansuperadmin"); // Halaman utama laporan subscription
    } else if (value === "pendapatan") {
      router.push("/laporansuperadmin/pendapatan"); // Halaman laporan pendapatan
    } else if (value === "user") {
      router.push("/laporansuperadmin/user"); // Halaman laporan user
    }
  };

  // Data grafik berdasarkan tabel di bawahnya
  const chartData = [
    {
      name: "Aktif",
      Bulanan: 60,
      Tahunan: 20,
    },
    {
      name: "Tidak Aktif",
      Bulanan: 23,
      Tahunan: 26,
    },
    {
      name: "Total",
      Bulanan: 196,
      Tahunan: 121,
    },
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
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-yellow-500 text-2xl"
              >
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
          <div className="bg-white p-6 rounded-xl shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
            </div>

            {/* Filter */}
            <div className="flex items-center justify-between mb-6 -ml-2">
            <div className="flex items-center gap-4">
              {/* Dropdown dengan ikon custom */}
              <div className="relative">
                <select
                  value={
                    pathname.includes("pendapatan")
                      ? "pendapatan"
                      : pathname.includes("user")
                      ? "user"
                      : "subscription"
                  }
                  onChange={handleSelectChange}
                  className="bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm shadow-sm h-10 appearance-none cursor-pointer"
                >
                  <option value="subscription">Laporan Subscription</option>
                  <option value="pendapatan">Laporan Pendapatan</option>
                  <option value="user">Laporan User</option>
                </select>

                {/* Icon dropdown custom */}
                <svg
                  className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Date Picker */}
              <div className="h-10 flex items-center">
                <PopupDatePicker />
              </div>
            </div>

            {/* Tombol Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-medium shadow-sm transition-all h-10"
            >
              <FaFileExport />
              Export
            </button>
          </div>


             {/* Chart */}
            <div className="mb-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Bulanan" fill="#8884d8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Tahunan" fill="#f87171" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className="mt-8">
              <table className="min-w-full bg-gray-50 rounded-xl overflow-hidden shadow">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-left">Paket</th>
                    <th className="py-3 px-4 text-left">Aktif</th>
                    <th className="py-3 px-4 text-left">Tidak Aktif</th>
                    <th className="py-3 px-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="bg-white">
                    <td className="py-3 px-4">Bulanan</td>
                    <td className="py-3 px-4">60</td>
                    <td className="py-3 px-4">23</td>
                    <td className="py-3 px-4">196</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4">Tahunan</td>
                    <td className="py-3 px-4">20</td>
                    <td className="py-3 px-4">26</td>
                    <td className="py-3 px-4">121</td>
                  </tr>
                </tbody>
              </table>
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

export default LaporanSuperAdminPage;