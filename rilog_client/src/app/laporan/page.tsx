"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBell, FaBars, FaFileExport, FaFilter, FaHistory } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";
import GrafikTrenStok from "@/components/GrafikTrenStok";
import ModalFilterLaporan from "@/components/ModalFilterLaporan";
import Swal from "sweetalert2";
import { exportLaporanToExcel, exportLaporanToPDF } from "@/utils/export";
import ModalExport from "@/components/ModalExport";

// Tipe Data
type LaporanItem = {
  id: number;
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  tanggal: string;
  status: string;
  jumlah: number;
  satuan: string;
  stokAwal: number;
  stokAkhir: number;
};

type ItemOption = { id: number; item_name: string; category_id?: number };
type CategoryOption = { id: number; category_name: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const LaporanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"laporan" | "grafik">("laporan");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false); // ✅ BARU
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedGudangId, setSelectedGudangId] = useState<string | null>(null);

  // --- STATE DATA ---
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [dataGrafik, setDataGrafik] = useState<any[]>([]);
  const [metaGrafik, setMetaGrafik] = useState<any>({}); 
  const [loading, setLoading] = useState(false);

  // --- STATE FILTER ---
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);
  
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSelectedItems, setFilterSelectedItems] = useState<number[]>([]); 

  // ✅ Hook Notifikasi API
  const {
    notifikasiList,
    loading: notifikasiLoading,
    refreshNotifikasi,
    deleteNotifikasi,
    deleteAllNotifikasi,
  } = useNotifikasiAPI(
    selectedGudangId ? Number(selectedGudangId) : null
  );

  // ✅ Hook Activity API (BARU)
  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useActivityAPI(
    selectedGudangId ? Number(selectedGudangId) : null,
    100
  );

  // 1. Fetch Master Data
  const fetchMasterData = useCallback(async () => {
    if (!selectedGudangId) return;
    try {
      const token = localStorage.getItem("token");
      const resCat = await fetch(`${API_BASE_URL}/api/kategori`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      const dataCat = await resCat.json();
      setCategories(dataCat);

      const resItem = await fetch(`${API_BASE_URL}/api/item?gudangId=${selectedGudangId}`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      const dataItem = await resItem.json();
      setAvailableItems(dataItem);
    } catch (err) {
      console.error("Gagal ambil master data:", err);
    }
  }, [selectedGudangId]);

  useEffect(() => { 
    if (selectedGudangId) fetchMasterData(); 
  }, [selectedGudangId, fetchMasterData]);

  // 2. Fetch Laporan
  const fetchLaporan = useCallback(async () => {
    if (!selectedGudangId) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("gudangId", selectedGudangId);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      if (filterCategory !== "all") params.append("categoryId", filterCategory);
      if (filterSelectedItems.length > 0) params.append("itemIds", filterSelectedItems.join(","));

      const res = await fetch(`${API_BASE_URL}/api/laporan?${params.toString()}`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });

      if (!res.ok) throw new Error("Gagal mengambil data laporan");
      const data = await res.json();
      setLaporan(data);
    } catch (error) {
      console.error(error);
      setLaporan([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGudangId, filterStartDate, filterEndDate, filterCategory, filterSelectedItems]);

  // 3. Fetch Grafik
  const fetchGrafik = useCallback(async () => {
    if (!selectedGudangId) return;
    const token = localStorage.getItem("token");
    try {
      const params = new URLSearchParams();
      params.append("gudangId", selectedGudangId);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      if (filterCategory !== "all") params.append("categoryId", filterCategory);
      if (filterSelectedItems.length > 0) params.append("itemIds", filterSelectedItems.join(","));

      const res = await fetch(`${API_BASE_URL}/api/laporan/grafik?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.chartData) {
        setDataGrafik(data.chartData);
        setMetaGrafik(data.meta);
      } else {
        setDataGrafik(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedGudangId, filterStartDate, filterEndDate, filterCategory, filterSelectedItems]);

  useEffect(() => {
    if (selectedGudangId) {
      if (activeTab === "laporan") fetchLaporan();
      else if (activeTab === "grafik") fetchGrafik();
    }
  }, [selectedGudangId, activeTab, fetchLaporan, fetchGrafik]);

  // Helper Functions
  const toggleSelectItem = (id: number) => setFilterSelectedItems(prev => 
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
  
  const handleResetFilter = () => {
    setFilterStartDate(""); 
    setFilterEndDate(""); 
    setFilterCategory("all"); 
    setFilterSelectedItems([]);
  };

  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("id-ID", {
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: false
      });
    } catch (e) { 
      return "-"; 
    }
  };

  const filteredLaporan = laporan.filter((item) =>
    item.namaBarang?.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.kodeBarang?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Fungsi Export
  const handleExportExcel = () => {
    const success = exportLaporanToExcel(filteredLaporan);
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Export!',
        text: 'Laporan berhasil di-export ke Excel',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Export',
        text: 'Terjadi kesalahan saat export data'
      });
    }
  };

  const handleExportPDF = () => {
    const success = exportLaporanToPDF(filteredLaporan);
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Export!',
        text: 'Laporan berhasil di-export ke PDF',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Export',
        text: 'Terjadi kesalahan saat export data'
      });
    }
  };

  const filterCount = [
    filterStartDate,
    filterEndDate,
    filterCategory !== 'all',
    filterSelectedItems.length > 0
  ].filter(Boolean).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-20">
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
              placeholder="Cari di tabel..." 
              className="flex-1" 
              onSearch={setSearchValue} 
            />
            <div className="flex items-center gap-4">
              {/* ✅ Tombol Activity Log (BARU) */}
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

              <div className="min-w-[200px]">
                <GudangSelector onGudangChange={setSelectedGudangId} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          
          <div className="flex mb-0 rounded-t-xl overflow-hidden border border-gray-200 font-semibold text-sm">
            <button 
              onClick={() => setActiveTab("laporan")} 
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === "laporan" 
                  ? "bg-gray-100 text-yellow-500 border-b-4 border-yellow-500" 
                  : "bg-gray-100 text-gray-500 hover:text-yellow-500"
              }`}
            >
              Laporan Inventaris
            </button>
            <button 
              onClick={() => setActiveTab("grafik")} 
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === "grafik" 
                  ? "bg-gray-100 text-yellow-500 border-b-4 border-yellow-500" 
                  : "bg-gray-100 text-gray-500 hover:text-yellow-500"
              }`}
            >
              Grafik Tren Stok
            </button>
          </div>

          <div className="bg-white rounded-b-xl shadow p-6 mt-0 min-h-[500px]">
            
            {/* Header Konten */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {activeTab === "laporan" ? "Daftar Inventaris" : "Analisis Pergerakan Stok"}
                </h2>
              </div>
               
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm relative transition-all shadow-sm"
                  onClick={() => setShowFilterModal(true)}
                >
                  <FaFilter /> Filter
                  {filterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white">
                      {filterCount}
                    </span>
                  )}
                </button>

                {activeTab === "laporan" && (
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
                  >
                    <FaFileExport /> Export
                  </button>
                )}
              </div>
            </div>

            {/* TABEL LAPORAN */}
            {activeTab === "laporan" && (
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-10 text-gray-500">
                    Sedang memuat data laporan...
                  </div>
                ) : (
                  <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left w-16">No</th>
                        <th className="px-4 py-3 text-left">Nama Barang</th>
                        <th className="px-4 py-3 text-left">Kategori</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-center font-semibold bg-gray-50">Stok Awal</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Jumlah</th>
                        <th className="px-4 py-3 text-center font-semibold bg-gray-50">Stok Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLaporan.length > 0 ? (
                        filteredLaporan.map((item, idx) => (
                          <tr 
                            key={`row-${item.id}-${idx}`} 
                            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{item.namaBarang}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                {item.kategori}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal)}</td>
                            <td className="px-4 py-3 text-center text-gray-500 font-medium bg-gray-50/50">
                              {item.stokAwal}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                item.status === "MASUK" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {item.status === "KELUAR" ? "-" : "+"} {item.jumlah} {item.satuan}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-gray-800 bg-gray-50/50">
                              {item.stokAkhir}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-6 text-gray-500">
                            Tidak ada data laporan ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "grafik" && (
              <GrafikTrenStok data={dataGrafik} meta={metaGrafik} />
            )}
          </div>
        </div>
      </main>

      {/* MODAL FILTER */}
      <ModalFilterLaporan 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        startDate={filterStartDate} 
        setStartDate={setFilterStartDate}
        endDate={filterEndDate} 
        setEndDate={setFilterEndDate}
        category={filterCategory} 
        setCategory={setFilterCategory}
        selectedItems={filterSelectedItems}
        categories={categories}
        availableItems={availableItems}
        toggleSelectItem={toggleSelectItem}
        onReset={handleResetFilter}
      />

      {/* MODAL NOTIFIKASI */}
      <ModalNotifikasi
        isOpen={showNotifikasi}
        onClose={() => setShowNotifikasi(false)}
        notifikasiList={notifikasiList}
        onHapusNotifikasi={(id) => deleteNotifikasi(Number(id))}
        onHapusSemuaNotifikasi={deleteAllNotifikasi}
      />

      {/* ✅ MODAL AKTIVITAS (BARU) */}
      <ModalAktivitas
        isOpen={showAktivitas}
        onClose={() => setShowAktivitas(false)}
        activities={activities}
        loading={activitiesLoading}
      />

      {/* MODAL EXPORT */}
      <ModalExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        title="Export Laporan Inventaris"
      />
    </div>
  );
};

export default LaporanPage;