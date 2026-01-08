"use client";

import AuthGuard from "@/components/AuthGuard";
import React, { FC, useState, useEffect, useCallback, useMemo } from "react";
import { 
  FaBell, FaBars, FaExclamationTriangle, FaHistory
} from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import { DataMasuk } from "@/types/notifikasi";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";
import AlertPeringatanStok from "@/components/AlertPeringatanStok";

// --- TIPE DATA ---
interface DashboardData {
  stats: {
    stokMasuk: number;
    stokKeluar: number;
    totalStok: number;
    barangTerlaris: string;
  };
  chartMovement: {
    date: string;
    masuk: number;
    keluar: number;
  }[];
  chartCategory: {
    name: string;
    value: number;
  }[];
}

interface CardItem {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6666'];

// ✅ Initial empty state untuk reset
const EMPTY_DASHBOARD_DATA: DashboardData = {
  stats: { stokMasuk: 0, stokKeluar: 0, totalStok: 0, barangTerlaris: "-" },
  chartMovement: [],
  chartCategory: []
};

const DashboardPage: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false);
  const [searchValue, setSearchValue] = useState(""); 
  const [selectedGudangId, setSelectedGudangId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // State Data Dashboard (Dinamis)
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);

  // Hook Notifikasi API
  const {
    notifikasiList,
    loading: notifikasiLoading,
    refreshNotifikasi,
    deleteNotifikasi,
    deleteAllNotifikasi,
  } = useNotifikasiAPI(
    selectedGudangId ? Number(selectedGudangId) : null
  );

  // Hook Activity API - AMBIL SEMUA AKTIVITAS UNTUK MODAL
  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useActivityAPI(
    selectedGudangId ? Number(selectedGudangId) : null,
    100
  );

  // --- FETCH DATA API ---
  const fetchDashboardData = useCallback(async (gudangId: string) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard?gudangId=${gudangId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Gagal mengambil data dashboard");
        const data = await res.json();

        setDashboardData({
            stats: {
                stokMasuk: data.stats.stokMasuk || 0,
                stokKeluar: data.stats.stokKeluar || 0,
                totalStok: data.stats.totalStok || 0,
                barangTerlaris: data.stats.barangTerlaris || "-"
            },
            chartMovement: data.chartMovement || [],
            chartCategory: data.chartCategory || []
        });

    } catch (err) {
        console.error(err);
        setDashboardData(EMPTY_DASHBOARD_DATA);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // ✅ CRITICAL FIX: Reset dashboard data saat gudang berubah
  useEffect(() => {
    setDashboardData(EMPTY_DASHBOARD_DATA);
    
    if (selectedGudangId) {
        fetchDashboardData(selectedGudangId);
    }
  }, [selectedGudangId, fetchDashboardData]);

  const handleGudangChange = (id: string) => {
    setSelectedGudangId(id);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value.toLowerCase());
  };

  // --- CONFIG KARTU (Menggunakan Icon SVG via Next Image) ---
  const cards: CardItem[] = [
    { label: "Stok Masuk", value: dashboardData.stats.stokMasuk, color: "bg-teal-100", icon: "stok-masuk.svg" },
    { label: "Stok Keluar", value: dashboardData.stats.stokKeluar, color: "bg-blue-100", icon: "stok-keluar.svg" },
    { label: "Jumlah Stok", value: dashboardData.stats.totalStok, color: "bg-orange-100", icon: "jumlah-stok.svg" },
    { label: "Barang Terlaris", value: dashboardData.stats.barangTerlaris, color: "bg-pink-100", icon: "barang-terlaris.svg" },
  ];

  // --- MAPPING ICON NOTIFIKASI BERDASARKAN TYPE ---
  const getNotificationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'stok_habis': 'notifikasi-peringatan.svg',
      'stok_menipis': 'notifikasi-peringatan.svg',
      'stok_berlebih': 'notifikasi-peringatan.svg',
      'mendekati_kadaluarsa': 'notifikasi-expired.svg',
      'sudah_kadaluarsa': 'notifikasi-expired.svg',
    };
    return iconMap[type] || 'notifikasi-peringatan.svg';
  };

  // --- MAPPING ICON ACTIVITY BERDASARKAN TYPE ---
  const getActivityIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'STOK MASUK': 'aktifitas-stok-masuk.svg',
      'STOK KELUAR': 'aktifitas-stok-keluar.svg',
      'TAMBAH ITEM': 'aktifitas-stok-masuk.svg',
      'OPNAME': 'aktifitas-stok-keluar.svg',
    };
    return iconMap[type] || 'aktifitas-stok-masuk.svg';
  };

  // --- FILTER NOTIFIKASI UNTUK DITAMPILKAN (Max 3) ---
  const filteredNotifications = useMemo(() => {
    const filtered = notifikasiList
      .filter(n => n.message.toLowerCase().includes(searchValue))
      .slice(0, 3);
    
    return filtered;
  }, [notifikasiList, searchValue]);

  // --- FILTER ACTIVITIES (Max 3 untuk preview) ---
  const filteredActivities = useMemo(() => {
    const filtered = activities
      .filter(a => a.text.toLowerCase().includes(searchValue))
      .slice(0, 3);
    
    return filtered;
  }, [activities, searchValue]);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
          {/* Topbar */}
          <div className="bg-white shadow-md p-4 mb-6 sticky top-0 right-0 z-10">
            <div className="flex items-center justify-between gap-4">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl">
                  <FaBars />
                </button>
              )}

              <SearchBar placeholder="Cari notifikasi atau aktivitas..." className="flex-1" onSearch={handleSearch} />

              <div className="flex items-center gap-4">
                {/* Tombol Activity Log */}
                <button 
                  className="relative bg-[#FFF4E6] rounded-full p-3 shadow-sm hover:bg-[#FFE4B5] transition-colors" 
                  onClick={() => setShowAktivitas(true)}
                  title="Lihat Aktivitas"
                >
                  <FaHistory className="text-orange-500 text-lg" />
                  {activities.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activities.length}
                    </span>
                  )}
                </button>

                {/* Tombol Notifikasi */}
                <button className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm hover:bg-[#FFF8DC] transition-colors" onClick={() => setShowNotifikasi(true)}>
                  <FaBell className="text-yellow-500 text-lg" />
                  {notifikasiList.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifikasiList.length}
                    </span>
                  )}
                </button>

                <GudangSelector onGudangChange={handleGudangChange} />
              </div>
            </div>
          </div>

          {/* Konten Dashboard */}
          <div className="px-6 pb-6">
            
            {/* Alert Notifikasi (Jika ada notif real) */}
            {notifikasiList.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500 text-xl" />
                    <div>
                      <h3 className="font-semibold text-red-800">Peringatan Stok</h3>
                      <p className="text-red-600 text-sm">Ada {notifikasiList.length} notifikasi yang perlu perhatian Anda</p>
                    </div>
                  </div>
                  <button onClick={() => setShowNotifikasi(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Lihat Detail
                  </button>
                </div>
              </div>
            )}

            {/* Cards (GRID 4 Kolom) */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-lg font-bold mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-4">
                    <div className={`${item.color} w-12 h-12 flex items-center justify-center rounded-full`}>
                      <Image src={`/${item.icon}`} alt={item.label} width={28} height={28} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-2xl font-bold truncate max-w-[120px]" title={String(item.value)}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts (GRID 2 Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* KIRI: GRAFIK STOK (Bar Chart) */}
              <div className="bg-white p-4 rounded-xl shadow h-80 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Grafik Stok</h3>
                </div>
                <div className="flex-1 w-full min-h-0">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Memuat data...
                      </div>
                    ) : dashboardData.chartMovement.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                              data={dashboardData.chartMovement}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                              <Legend verticalAlign="top" height={36} iconType="circle" />
                              <Bar dataKey="masuk" name="Masuk" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                              <Bar dataKey="keluar" name="Keluar" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                          </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Belum ada data
                      </div>
                    )}
                </div>
              </div>

              {/* KANAN: GRAFIK KATEGORI (Pie Chart) */}
              <div className="bg-white p-4 rounded-xl shadow h-80 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Grafik Stok per Kategori</h3>
                </div>
                <div className="flex-1 w-full min-h-0">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Memuat data...
                      </div>
                    ) : dashboardData.chartCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboardData.chartCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={3}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {dashboardData.chartCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            Belum ada data
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* Notifications & Activity (GRID 2 Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Notifikasi Box - DINAMIS dari API */}
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">Notifikasi</h3>
                  <button 
                    className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors" 
                    onClick={() => setShowNotifikasi(true)}
                  >
                    Lihat Lengkapnya
                  </button>
                </div>
                <ul className="space-y-3 text-sm">
                  {notifikasiLoading ? (
                    <li className="text-gray-400 italic text-center py-4">Memuat notifikasi...</li>
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                      <li key={notif.id} className="flex items-center gap-3 text-gray-700">
                        <Image 
                          src={`/${getNotificationIcon(notif.type)}`} 
                          alt={notif.type} 
                          width={20} 
                          height={20} 
                        />
                        <span>{notif.message}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic text-center py-4">
                      {searchValue ? "Tidak ada notifikasi ditemukan" : "Tidak ada notifikasi"}
                    </li>
                  )}
                </ul>
              </div>

              {/* Aktivitas Box - DINAMIS dari API */}
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">Aktivitas Terbaru</h3>
                  <button 
                    className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                    onClick={() => setShowAktivitas(true)}
                  >
                    Lihat Lengkapnya
                  </button>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  {activitiesLoading ? (
                    <li className="text-gray-400 italic text-center py-4">Memuat aktivitas...</li>
                  ) : filteredActivities.length > 0 ? (
                    filteredActivities.map((act) => (
                      <li key={act.id} className="flex items-center gap-3">
                        <Image 
                          src={`/${getActivityIcon(act.type)}`} 
                          alt={act.type} 
                          width={20} 
                          height={20} 
                        />
                        <span>{act.text} ({act.date})</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic text-center py-4">
                      {searchValue ? "Tidak ada aktivitas ditemukan" : "Tidak ada aktivitas"}
                    </li>
                  )}
                </ul>
              </div>

            </div>
          </div>
        </main>

        {/* Modal Notifikasi */}
        <ModalNotifikasi
          isOpen={showNotifikasi}
          onClose={() => setShowNotifikasi(false)}
          notifikasiList={notifikasiList}
          onHapusNotifikasi={(id) => deleteNotifikasi(Number(id))}
          onHapusSemuaNotifikasi={deleteAllNotifikasi}
        />

        {/* Modal Aktivitas */}
        <ModalAktivitas
          isOpen={showAktivitas}
          onClose={() => setShowAktivitas(false)}
          activities={activities}
          loading={activitiesLoading}
        />

      </div>
    </AuthGuard>
  );
};

export default DashboardPage;