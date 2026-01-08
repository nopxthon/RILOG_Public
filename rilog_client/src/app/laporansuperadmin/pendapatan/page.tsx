"use client";

import { FC, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { FaBell, FaBars, FaFileExport } from "react-icons/fa";
import Sidebar from "@/components/Sidebaradmin";
import SearchBar from "@/components/SearchBar";
import PopupDatePicker from "@/components/PopupDatePicker";
import {
  LineChart,
  Line,
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

const LaporanPendapatanPage: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
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

  // Fungsi untuk menghitung durasi dalam hari
  const calculateDaysDifference = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Tentukan tipe chart berdasarkan rentang tanggal
  const getChartType = () => {
    const days = calculateDaysDifference(dateRange.start, dateRange.end);
    
    if (days === 0) return "monthly"; // Default jika belum pilih tanggal
    if (days <= 31) return "weekly"; // 1 bulan atau kurang = per minggu
    if (days <= 365) return "monthly"; // 1 tahun atau kurang = per bulan
    return "yearly"; // Lebih dari 1 tahun = per tahun
  };

  const chartType = getChartType();

  // Data grafik pendapatan berdasarkan tipe
  const getChartData = () => {
    if (chartType === "weekly") {
      return [
        { name: "Minggu 1", "Total Pendapatan": 18000000 },
        { name: "Minggu 2", "Total Pendapatan": 22000000 },
        { name: "Minggu 3", "Total Pendapatan": 15000000 },
        { name: "Minggu 4", "Total Pendapatan": 20000000 },
      ];
    } else if (chartType === "monthly") {
      return [
        { name: "Januari", "Total Pendapatan": 75000000 },
        { name: "Februari", "Total Pendapatan": 60000000 },
        { name: "Maret", "Total Pendapatan": 30000000 },
        { name: "April", "Total Pendapatan": 30000000 },
        { name: "Mei", "Total Pendapatan": 30000000 },
        { name: "Juni", "Total Pendapatan": 45000000 },
        { name: "Juli", "Total Pendapatan": 50000000 },
        { name: "Agustus", "Total Pendapatan": 55000000 },
        { name: "September", "Total Pendapatan": 40000000 },
        { name: "Oktober", "Total Pendapatan": 60000000 },
        { name: "November", "Total Pendapatan": 70000000 },
        { name: "Desember", "Total Pendapatan": 80000000 },
      ];
    } else {
      return [
        { name: "2021", "Total Pendapatan": 450000000 },
        { name: "2022", "Total Pendapatan": 520000000 },
        { name: "2023", "Total Pendapatan": 580000000 },
        { name: "2024", "Total Pendapatan": 625000000 },
        { name: "2025", "Total Pendapatan": 700000000 },
      ];
    }
  };

  const chartData = getChartData();

  // Data tabel berdasarkan tipe
  const getTableData = () => {
    if (chartType === "weekly") {
      return [
        { period: "Minggu 1", amount: "Rp 18.000.000" },
        { period: "Minggu 2", amount: "Rp 22.000.000" },
        { period: "Minggu 3", amount: "Rp 15.000.000" },
        { period: "Minggu 4", amount: "Rp 20.000.000" },
      ];
    } else if (chartType === "monthly") {
      return [
        { period: "Januari", amount: "Rp 75.000.000" },
        { period: "Februari", amount: "Rp 60.000.000" },
        { period: "Maret", amount: "Rp 30.000.000" },
        { period: "April", amount: "Rp 30.000.000" },
        { period: "Mei", amount: "Rp 30.000.000" },
        { period: "Juni", amount: "Rp 45.000.000" },
        { period: "Juli", amount: "Rp 50.000.000" },
        { period: "Agustus", amount: "Rp 55.000.000" },
        { period: "September", amount: "Rp 40.000.000" },
        { period: "Oktober", amount: "Rp 60.000.000" },
        { period: "November", amount: "Rp 70.000.000" },
        { period: "Desember", amount: "Rp 80.000.000" },
      ];
    } else {
      return [
        { period: "2021", amount: "Rp 450.000.000" },
        { period: "2022", amount: "Rp 520.000.000" },
        { period: "2023", amount: "Rp 580.000.000" },
        { period: "2024", amount: "Rp 625.000.000" },
        { period: "2025", amount: "Rp 700.000.000" },
      ];
    }
  };

  const tableData = getTableData();

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
                  <PopupDatePicker 
                  />
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
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Total Pendapatan" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className="mt-8">
              <table className="min-w-full bg-gray-50 rounded-xl overflow-hidden shadow">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-center">Waktu</th>
                    <th className="py-3 px-4 text-center">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {tableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 text-center">{row.period}</td>
                      <td className="py-3 px-4 text-center">{row.amount}</td>
                    </tr>
                  ))}
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

export default LaporanPendapatanPage;