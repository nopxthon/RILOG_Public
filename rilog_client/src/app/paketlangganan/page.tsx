"use client";

import { useState, useEffect } from "react";
import { FaBars, FaBell, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// --- IMPORTS KOMPONEN ---
import Sidebar from "@/components/Sidebaradmin";
import SearchBar from "@/components/SearchBar";
import { useNotifikasiSuperAdmin } from "@/hooks/useNotifikasiSuperAdmin";
import NotifikasiSuperAdmin from "@/components/NotifikasiSuperAdmin";
import { NotifikasiSuperAdmin as NotifikasiType } from "@/types/notifikasisuperadmin";

// Import Komponen Baru Kita
import PaketTable from "@/components/paket/PaketTable";
import PaketFormModal from "@/components/paket/PaketFormModal";
import DeleteModalPaket from "@/components/paket/DeleteModalPaket";

const PaketLanggananPage: React.FC = () => {
  // State UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ State Modal Logout
  
  // State Data
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  
  // State Modal Logic
  const [modalType, setModalType] = useState<"ADD" | "EDIT" | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<any>(null);

  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // --- TOKEN HELPER ---
  const getToken = () => {
    let token = localStorage.getItem("superToken") || localStorage.getItem("token");
    if (token && token.startsWith('"')) token = token.slice(1, -1);
    return token;
  };

  // --- 1. FETCH DATA ---
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { 
        router.push("/superadmin/login");
        return; 
      }

      const response = await axios.get(`${API_BASE_URL}/api/sub-plans/superadmin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      setPlans(Array.isArray(result) ? result : (result.data || []));
    } catch (error: any) {
      console.error("Fetch Error:", error);
      if (error.response?.status === 401) {
        toast.error("Sesi kadaluarsa.");
        localStorage.removeItem("superToken");
        router.push("/superadmin-sys-log");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  // --- 2. HANDLE CREATE/UPDATE ---
  const handleSave = async (formData: any) => {
    try {
      const token = getToken();
      
      if (modalType === "ADD") {
        await axios.post(`${API_BASE_URL}/api/sub-plans`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Paket berhasil ditambahkan!");
      } else if (modalType === "EDIT" && selectedPaket) {
        await axios.put(`${API_BASE_URL}/api/sub-plans/${selectedPaket.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Paket berhasil diperbarui!");
      }

      setModalType(null); // Tutup modal
      fetchPlans();       // Refresh data
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data.");
    }
  };

  // --- 3. HANDLE DELETE ---
  const handleDelete = async () => {
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/api/sub-plans/${selectedPaket.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Paket dihapus.");
      setShowDeleteModal(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus.");
    }
  };

  // --- 🔥 4. HANDLE LOGOUT (EKSEKUSI) ---
  const handleLogout = async () => {
    const toastId = toast.loading("Sedang logout...");
    try {
      const token = getToken();
      // Panggil API Logout Backend
      if (token) {
        await axios.post(`${API_BASE_URL}/api/superadmin/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.warn("Gagal logout di server, tetap lanjutkan logout client.");
    } finally {
      toast.dismiss(toastId);
      
      // Bersihkan Client Side
      localStorage.clear(); 
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      setShowLogoutModal(false); // Tutup modal
      router.replace("/superadmin-sys-log");
    }
  };

  // --- FILTERING ---
  const filteredData = plans.filter((item) => {
    const name = item.nama_paket || item.name || "";
    const matchSearch = name.toLowerCase().includes(searchValue.toLowerCase());
    
    let matchStatus = true;
    if (filterStatus === "Aktif") matchStatus = item.is_active === true;
    if (filterStatus === "Tidak Aktif") matchStatus = item.is_active === false;

    return matchSearch && matchStatus;
  });

  // --- NOTIFIKASI DUMMY ---
  const notifikasiData: NotifikasiType[] = [
    { id: "1", message: "Langganan PT Maju berakhir segera!", type: "warning", icon: "notifikasi-expired.svg" },
  ];
  const { notifikasiList, handleHapusNotifikasi, handleHapusSemuaNotifikasi } = useNotifikasiSuperAdmin(notifikasiData);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Toaster position="top-center" />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        {/* TOPBAR */}
        <div className="bg-white shadow-sm border-b p-4 mb-6 sticky top-0 right-0 z-40">
          <div className="flex items-center justify-between gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl"><FaBars /></button>
            )}
            <SearchBar placeholder="Cari paket..." className="flex-1 max-w-lg" onSearch={setSearchValue} />
            
            <div className="flex items-center gap-3">
              <button onClick={() => setShowNotifikasi(true)} className="relative bg-orange-50 hover:bg-orange-100 p-3 rounded-full text-yellow-600">
                <FaBell className="text-lg" />
                {notifikasiList.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{notifikasiList.length}</span>}
              </button>
              
              {/* ✅ TOMBOL LOGOUT: Hanya membuka modal */}
              <button 
                onClick={() => setShowLogoutModal(true)} 
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full text-gray-600 transition"
                title="Keluar"
              >
                <FaSignOutAlt className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            
            {/* Header & Tombol Tambah */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Paket Langganan</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola harga dan durasi langganan.</p>
              </div>
              <button 
                onClick={() => { setSelectedPaket(null); setModalType("ADD"); }}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md transition"
              >
                <FaPlus /> Tambah Paket
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
              {["Semua", "Aktif", "Tidak Aktif"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                    filterStatus === status ? "text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* TABEL KOMPONEN */}
            <PaketTable 
              data={filteredData}
              loading={loading}
              onEdit={(item) => { setSelectedPaket(item); setModalType("EDIT"); }}
              onDelete={(item) => { setSelectedPaket(item); setShowDeleteModal(true); }}
            />
          </div>
        </div>
      </main>

      {/* --- KUMPULAN MODAL --- */}
      
      {/* 1. Modal Notifikasi */}
      <NotifikasiSuperAdmin
        isOpen={showNotifikasi}
        onClose={() => setShowNotifikasi(false)}
        notifikasiList={notifikasiList as any} 
        onHapusNotifikasi={handleHapusNotifikasi}
        onHapusSemuaNotifikasi={handleHapusSemuaNotifikasi}
      />

      {/* 2. Modal Form (Dipakai untuk Add & Edit) */}
      <PaketFormModal 
        isOpen={modalType !== null}
        isEdit={modalType === "EDIT"}
        initialData={selectedPaket}
        onClose={() => setModalType(null)}
        onSave={handleSave}
      />

      {/* 3. Modal Delete Paket */}
      <DeleteModalPaket 
        isOpen={showDeleteModal}
        paketName={selectedPaket?.nama_paket || selectedPaket?.name || ""}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      {/* ✅ 4. MODAL LOGOUT BARU */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center relative transform transition-all scale-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Konfirmasi Keluar</h3>
            <p className="text-gray-600 mb-6 text-sm">Apakah Anda yakin ingin mengakhiri sesi ini?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Batal
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaketLanggananPage;