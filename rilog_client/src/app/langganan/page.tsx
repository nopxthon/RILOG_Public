"use client";

import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "@/components/Sidebaradmin";
import SearchBar from "@/components/SearchBar";
import { useNotifikasiSuperAdmin } from "@/hooks/useNotifikasiSuperAdmin";
import { NotifikasiSuperAdminType } from "@/components/NotifikasiSuperAdmin"; // Pastikan path type benar
import NotifikasiSuperAdmin from "@/components/NotifikasiSuperAdmin";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// IMPORTS KOMPONEN TABEL
import UserTable from "@/components/superadmin-langganan/UserTable";
import PaymentTable from "@/components/superadmin-langganan/PaymentTable";
import LogTable from "@/components/superadmin-langganan/LogTable";

// URL API
const API_BASE_URL = "http://localhost:5000/api";
const API_LOGOUT_URL = "http://localhost:5000/api/superadmin/logout";

const LanggananPage: React.FC = () => {
  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState("pengguna");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  
  // --- STATE MODAL ---
  const [showModalBukti, setShowModalBukti] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // STATE EDIT STATUS
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState(""); 
  
  // --- STATE DATA ---
  const [buktiImage, setBuktiImage] = useState<string | null>(null);
  const [bisnisData, setBisnisData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [logData, setLogData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const router = useRouter();

  // --- NOTIFIKASI ---
  const notifikasiData: any[] = [
    { id: "1", message: "Langganan PT Maju berakhir!", type: "warning", icon: "notifikasi-expired.svg" },
  ];
  const { notifikasiList, handleHapusNotifikasi, handleHapusSemuaNotifikasi } = useNotifikasiSuperAdmin(notifikasiData);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("superToken");
      if (!token) {
         router.replace("/superadmin/login");
         return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = "";

      if (activeTab === "pengguna") {
        // 🔥 Pastikan URL ini benar sesuai server.js
        url = `${API_BASE_URL}/superadmin-langganan/users?status=${filterStatus}`; 
        const res = await axios.get(url, config);
        setBisnisData(res.data);

      } else if (activeTab === "verifikasi") {
        // 🔥 PERBAIKAN LOGIKA URL DISINI 🔥
        const queryStatus = filterStatus !== "Semua" ? `?status=${filterStatus}` : "";
        url = `${API_BASE_URL}/payment/all${queryStatus}`; // ✅ URL BARU
        
        const res = await axios.get(url, config);
        setPaymentData(res.data);
        console.log("Response Payment:", res.data); // Cek apakah data masuk

        // Pastikan response array
        setPaymentData(Array.isArray(res.data) ? res.data : []);

      } else if (activeTab === "log") {
        // 🔥 Pastikan URL ini benar sesuai server.js
        url = `${API_BASE_URL}/superadmin-langganan/logs`; 
        const res = await axios.get(url, config);
        setLogData(res.data);
    }
    } catch (error: any) {
      console.error("Gagal mengambil data:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        router.replace("/superadmin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, filterStatus]);

  // --- HANDLERS ---
  const handleSearch = (value: string) => setSearchValue(value);
  const handleLogout = () => setShowLogoutModal(true);
  
  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("superToken");
      if (token) {
        await axios.post(API_LOGOUT_URL, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      setShowLogoutModal(false);
      router.replace("/superadmin-sys-log");
    }
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // LOGIC EDIT STATUS USER
  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setEditStatus(item.originalStatus || "nonaktif"); 
    setShowEditModal(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedItem) return;

    const result = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Apakah Anda yakin ingin mengubah status menjadi "${editStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#eb893e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("superToken");
      await axios.put(`${API_BASE_URL}/superadmin/users/${selectedItem.id}`, 
        { status: editStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowEditModal(false);
      fetchData(); 

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status langganan telah diperbarui.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error: any) {
      console.error("Gagal update status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui status.',
      });
    }
  };

  // LOGIC VERIFIKASI PEMBAYARAN
  const handleVerifyPayment = async (id: number, action: 'approve' | 'reject', namaBisnis: string) => {
    const actionText = action === 'approve' ? 'menyetujui' : 'menolak';
    const confirmButtonColor = action === 'approve' ? '#eab308' : '#EF4444'; 

    const result = await Swal.fire({
      title: `Konfirmasi Verifikasi`,
      text: `Apakah Anda yakin ingin ${actionText} pembayaran dari ${namaBisnis}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Ya, ${action === 'approve' ? 'Setujui' : 'Tolak'}`,
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("superToken");
      
      // Menggunakan endpoint PUT verifikasi
      await axios.put(`${API_BASE_URL}/payment/process/${id}`, // ✅ URL BARU
        { action }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Pembayaran berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}.`,
        timer: 2000,
        showConfirmButton: false
      });

      fetchData(); 

    } catch (error: any) {
      console.error("Gagal verifikasi:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.response?.data?.msg || 'Terjadi kesalahan saat memproses verifikasi.',
      });
    }
  };

  // --- FILTER SEARCH ---
  const filteredData = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    
    if (activeTab === "pengguna") {
      return bisnisData.filter(item => 
        (item.bisnis?.toLowerCase() || "").includes(searchLower) ||
        (item.nama?.toLowerCase() || "").includes(searchLower)
      );
    } 
    
    if (activeTab === "verifikasi") {
      return paymentData.filter(item => 
        (item.bisnis?.toLowerCase() || "").includes(searchLower) || 
        (item.pemilik?.toLowerCase() || "").includes(searchLower) ||
        (item.pengirim?.toLowerCase() || "").includes(searchLower)
      );
    }
    
    if (activeTab === "log") {
      return logData.filter(item => 
        (item.nama?.toLowerCase() || "").includes(searchLower) ||
        (item.aktivitas?.toLowerCase() || "").includes(searchLower)
      );
    }
    return [];
  }, [activeTab, searchValue, bisnisData, paymentData, logData]);

  // RENDER FILTER BUTTONS
  const renderFilterButtons = () => {
    let options = [];
    if (activeTab === "verifikasi") {
        options = ["Semua", "Belum Terverifikasi", "Terverifikasi", "Ditolak"];
    } else {
        options = ["Semua", "Aktif", "Akan Berakhir", "Non Aktif"];
    }

    if (activeTab === "log") return null;

    return options.map((status) => (
        <button 
            key={status} 
            onClick={() => setFilterStatus(status)} 
            className={`px-3 py-1 rounded-full transition-all text-sm ${
                filterStatus === status 
                ? "bg-yellow-100 text-gray-800 font-semibold border border-yellow-200" 
                : "text-gray-500 hover:text-yellow-600 border border-transparent hover:border-gray-200"
            }`}
        >
            {status}
        </button>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        
        {/* HEADER */}
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 right-0 z-50">
          <div className="flex items-center justify-between gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl">
                <FaBars />
              </button>
            )}
            <SearchBar placeholder="Cari data..." className="flex-1" onSearch={handleSearch} />
            <div className="flex items-center gap-4">
              <button onClick={() => setShowNotifikasi(true)} className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm hover:shadow-md transition">
                <FaBell className="text-yellow-500 text-lg" />
                {notifikasiList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifikasiList.length}
                  </span>
                )}
              </button>
              <button onClick={handleLogout} className="bg-[#FFFAF0] hover:bg-[#FFF3E0] transition rounded-full p-3 shadow-sm hover:shadow-md">
                <Image src="/logout.svg" alt="Logout" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* KONTEN */}
        <div className="px-6 pb-6">
          <div className="flex mb-0 rounded-t-xl overflow-hidden border border-gray-200 font-semibold text-sm bg-gray-50">
            {[
              { id: "pengguna", label: "Manajemen Pengguna" },
              { id: "verifikasi", label: "Verifikasi Pembayaran" },
              { id: "log", label: "Log Aktivitas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setFilterStatus("Semua"); }}
                className={`flex-1 py-3 text-center transition-all ${
                  activeTab === tab.id 
                  ? "bg-white text-yellow-600 border-t-2 border-yellow-500 font-bold shadow-sm" 
                  : "text-gray-500 hover:text-yellow-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6 mt-0">
            <h1 className="text-xl font-bold text-gray-800 mb-4">
              {activeTab === "pengguna" ? "Daftar Pengguna" : activeTab === "verifikasi" ? "Daftar Transaksi" : "Riwayat Aktivitas"}
            </h1>

            {/* Filter Dinamis */}
            <div className="flex items-center justify-between mb-4 text-sm font-medium text-gray-600">
               <div className="flex items-center gap-3 flex-wrap">
                 {renderFilterButtons()}
               </div>
            </div>

            {/* Render Components */}
            <div className="min-h-[300px]">
              {activeTab === "pengguna" && (
                <UserTable 
                  data={filteredData} 
                  loading={loading} 
                  onEdit={handleEditClick} 
                />
              )}

              {activeTab === "verifikasi" && (
                <PaymentTable 
                  data={filteredData} 
                  loading={loading} 
                  onViewBukti={(url) => { 
                      const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                      setBuktiImage(fullUrl); 
                      setShowModalBukti(true); 
                  }}
                  onVerify={handleVerifyPayment} 
                />
              )}

              {activeTab === "log" && (
                <LogTable data={filteredData} loading={loading} />
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button className="text-sm font-medium text-black hover:text-yellow-500 flex items-center gap-1">Next ›</button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL LAINNYA */}
      <NotifikasiSuperAdmin isOpen={showNotifikasi} onClose={() => setShowNotifikasi(false)} notifikasiList={notifikasiList} onHapusNotifikasi={handleHapusNotifikasi} onHapusSemuaNotifikasi={handleHapusSemuaNotifikasi} />
      
      {showModalBukti && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4" onClick={() => setShowModalBukti(false)}>
            <div className="bg-white rounded-lg p-2 max-w-2xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
               <div className="flex justify-end p-2">
                   <button onClick={() => setShowModalBukti(false)} className="text-gray-500 hover:text-red-500 text-2xl"><FaTimes /></button>
               </div>
               <div className="flex-1 overflow-auto flex justify-center bg-gray-100 rounded border p-2">
                  {buktiImage ? (
                      <img src={buktiImage} alt="Bukti Transfer" className="object-contain max-h-full" />
                  ) : (
                      <p className="p-10 text-gray-500">Gambar tidak ditemukan.</p>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* Modal Edit Status */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"><FaTimes /></button>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Ubah Status Langganan</h2>
            <p className="text-sm text-gray-600 mb-4">Mengubah status untuk bisnis: <b>{selectedItem?.bisnis}</b></p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non Aktif</option>
                <option value="suspended">Suspended (Ditangguhkan)</option>
                <option value="trial">Trial</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-md text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Batal</button>
              <button onClick={handleSaveStatus} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 shadow-sm transition">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center w-80 relative">
            <h2 className="font-semibold mb-6 text-gray-800">Yakin ingin keluar?</h2>
            <div className="flex justify-center gap-3">
              <button onClick={cancelLogout} className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700 transition">Batal</button>
              <button onClick={confirmLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 shadow-md transition">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanggananPage;