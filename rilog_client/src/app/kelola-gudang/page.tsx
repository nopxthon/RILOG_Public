"use client";

import { FC, useState, useEffect, useMemo } from "react";
import { FaBell, FaPlus, FaEdit, FaTrash, FaBars, FaCheck, FaWarehouse, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";

import AuthGuard from "@/components/AuthGuard";
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import ModalTambahGudang from "@/components/ModalTambahGudang";
import ModalEditGudang from "@/components/ModalEditGudang";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";

// Interface Data Gudang
interface Gudang {
  id: number;
  nama_gudang: string;
  tipe_gudang: string;
  alamat_gudang: string;
  is_active: boolean;
  bisnis_id: number;
  bisnis?: {
    id: number;
    nama_bisnis: string;
    user_id?: number;
  };
}

const KelolaGudangPage: FC = () => {
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState<Gudang | null>(null);

  // Data States
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [bisnisId, setBisnisId] = useState<number | null>(null);

  // Limit States
  const [limitGudang, setLimitGudang] = useState<number>(0);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);

  // Notifikasi & Activity States
  const [notifGudangId, setNotifGudangId] = useState<number | null>(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("userRole"));
      const id = localStorage.getItem("bisnis_id");
      if (id) setBisnisId(Number(id));
      
      const storedGudangId = localStorage.getItem("gudang_id");
      if (storedGudangId) setNotifGudangId(Number(storedGudangId));
      
      fetchUserProfile();
    }
  }, []);

  // --- 2. HOOKS API ---
  const {
    notifikasiList,
    deleteNotifikasi,
    deleteAllNotifikasi,
  } = useNotifikasiAPI(notifGudangId);

  const {
    activities,
    loading: activitiesLoading,
  } = useActivityAPI(notifGudangId, 100);

  // --- 3. FETCH LIMIT USER ---
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.status === 'success' && json.data) {
            const realLimit = json.data.limit_gudang; 
            if (realLimit >= 1000000) {
                setIsUnlimited(true);
                setLimitGudang(9999);
            } else {
                setIsUnlimited(false);
                setLimitGudang(realLimit || 1); 
            }
        }
    } catch (err) {
        console.error("Gagal fetch limit:", err);
    }
  };

  // --- 4. FETCH DATA GUDANG ---
  const fetchGudang = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    try {
      setLoading(true);
      const roleLocal = localStorage.getItem("userRole");
      const bisnisIdLocal = localStorage.getItem("bisnis_id");

      const endpoint =
        roleLocal === "staff"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/gudang`
          : bisnisIdLocal
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/gudang?bisnis_id=${bisnisIdLocal}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/gudang`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setGudangList(json.data || []);
    } catch (e) {
      console.error("Fetch error:", e);
      setGudangList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGudang();
  }, [bisnisId, role]);

  // --- 5. LOGIC SEARCH & LIMIT ---
  const handleSearch = (value: string) => setSearchValue(value);

  const filteredGudang = gudangList.filter((g) =>
    g.nama_gudang.toLowerCase().includes(searchValue.toLowerCase())
  );

  const usedSlots = useMemo(() => {
    return gudangList.filter(g => g.is_active).length;
  }, [gudangList]);

  const isFull = !isUnlimited && usedSlots >= limitGudang;

  // --- 6. HANDLERS CRUD ---

  // SAVE GUDANG
  const handleSaveGudang = async (data: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gudang`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          bisnis_id: bisnisId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setGudangList((prev) => [...prev, json.data]);
      setIsModalTambahOpen(false);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: json.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: e.message,
      });
    }
  };

  // EDIT GUDANG
  const handleOpenEdit = (g: Gudang) => {
    setSelectedEditData(g);
    setIsModalEditOpen(true);
  };

  const handleUpdateGudang = async (id: number, data: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gudang/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setGudangList((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...data } : g))
      );

      setIsModalEditOpen(false);
      setSelectedEditData(null);

      Swal.fire({
        icon: "success",
        title: "Update Berhasil!",
        text: json.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Gagal!", "Gagal update gudang.", "error");
    }
  };

  // HAPUS GUDANG
  const handleHapusGudang = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Gudang?",
      text: "Data stok di dalamnya akan hilang permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (!result.isConfirmed) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gudang/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Gagal menghapus");

      const updatedList = gudangList.filter((g) => g.id !== id);
      setGudangList(updatedList);

      // Cek apakah gudang yang dihapus adalah gudang yang sedang aktif di session
      const currentActiveId = localStorage.getItem("gudang_id");
      if (currentActiveId && String(id) === currentActiveId) {
        if (updatedList.length > 0) {
           // Pindah ke gudang lain jika ada
           const nextGudang = updatedList[0];
           localStorage.setItem("gudang_id", String(nextGudang.id));
           localStorage.setItem("gudang_nama", nextGudang.nama_gudang);
           Swal.fire({
             icon: "success",
             title: "Terhapus!",
             text: `Gudang aktif terhapus. Berpindah ke ${nextGudang.nama_gudang}...`,
             timer: 2000,
             showConfirmButton: false
           }).then(() => window.location.reload());
        } else {
           // Jika habis semua
           localStorage.removeItem("gudang_id");
           localStorage.removeItem("gudang_nama");
           Swal.fire({
             icon: "warning",
             title: "Gudang Habis",
             text: "Semua gudang telah dihapus.",
             timer: 2000,
           }).then(() => window.location.reload());
        }
      } else {
        Swal.fire({
            icon: "success",
            title: "Gudang dihapus!",
            timer: 2000,
            showConfirmButton: false,
        });
      }
    } catch (err: any) {
      Swal.fire("Gagal!", err.message, "error");
    }
  };

  // ✅ HANDLER TOGGLE STATUS (FIXED)
  const handleToggleStatus = async (gudang: Gudang) => {
    // 1. Cek jika sudah aktif
    if (gudang.is_active) {
      Swal.fire({
        icon: 'info',
        title: 'Gudang Sudah Aktif',
        text: 'Gudang ini sudah terpilih sebagai gudang aktif.',
        confirmButtonColor: '#eab308',
      });
      return;
    }

    // 2. Cek Limit
    if (isFull) {
        Swal.fire({
            icon: 'warning',
            title: 'Slot Penuh',
            text: `Kuota gudang aktif Anda (${limitGudang}) sudah penuh. Upgrade paket untuk menambah slot.`,
            confirmButtonColor: '#eab308',
            footer: '<a href="/pricing">Lihat Paket Langganan</a>'
        });
        return;
    }

    // 3. Konfirmasi
    const result = await Swal.fire({
      title: 'Aktifkan Gudang Ini?',
      text: "Anda akan menggunakan 1 slot gudang aktif.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#eb893e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Aktifkan!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/gudang/${gudang.id}/status`;
      
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: true }), 
      });

      let json;
      try { json = await res.json(); } catch (err) { throw new Error("Terjadi kesalahan pada server."); }

      if (res.status === 403) {
          Swal.fire({
             icon: 'warning',
             title: 'Gagal Mengaktifkan',
             text: json.message || "Limit tercapai.",
          });
          return;
      }

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengaktifkan gudang");
      }

      // Update State Lokal
      setGudangList((prev) =>
        prev.map((g) => (g.id === gudang.id ? { ...g, is_active: true } : g))
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Gudang telah diaktifkan.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengaktifkan",
        text: err.message || "Terjadi kesalahan koneksi.",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
          {/* TOPBAR */}
          <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl">
                  <FaBars />
                </button>
              )}

              <SearchBar placeholder="Cari gudang..." className="flex-1" onSearch={handleSearch} />

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
                <button
                  className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm hover:bg-[#FFF8DC] transition-colors"
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
                  <GudangSelector />
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-2xl shadow p-6">
              
              {/* HEADER + SLOT INFO */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">Kelola Gudang</h1>
                    
                    {!loading && limitGudang > 0 && (
                        <div className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1
                            ${isFull 
                                ? 'bg-red-50 border-red-200 text-red-600' 
                                : 'bg-blue-50 border-blue-200 text-blue-600'
                            }`}>
                            <FaWarehouse className="text-xs" />
                            <span>Slot Gudang:</span>
                            <strong>{usedSlots} / {isUnlimited ? '∞' : limitGudang}</strong>
                        </div>
                    )}
                </div>

                <button
                  onClick={() => setIsModalTambahOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white transition
                    ${isFull 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  disabled={isFull}
                >
                  <FaPlus /> Tambah Gudang
                </button>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-4">Memuat data...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 uppercase text-xs rounded-lg">
                        <th className="px-6 py-3 text-center">Nama Gudang</th>
                        <th className="px-6 py-3 text-center">Tipe</th>
                        <th className="px-6 py-3 text-center">Alamat</th>
                        <th className="px-6 py-3 text-center">Status Aktif</th>
                        <th className="px-6 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGudang.map((g, i) => (
                        <tr
                          key={g.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-3 text-center font-medium">{g.nama_gudang}</td>
                          <td className="px-6 py-3 text-center">{g.tipe_gudang}</td>
                          <td className="px-6 py-3 text-center truncate max-w-[200px]">{g.alamat_gudang}</td>
                          
                          {/* STATUS & AKTIVASI */}
                          <td className="px-6 py-3 text-center">
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handleToggleStatus(g)}
                                    className={`
                                        flex items-center justify-center w-8 h-8 rounded-md border-2 transition-all
                                        ${g.is_active 
                                            ? "bg-green-500 border-green-500 text-white cursor-default shadow-md" 
                                            : "bg-white border-gray-300 text-transparent hover:border-green-400 cursor-pointer"
                                        }
                                    `}
                                    title={g.is_active ? "Gudang Aktif (Terkunci)" : "Klik untuk Mengaktifkan"}
                                >
                                    <FaCheck className="text-sm" />
                                </button>
                            </div>
                            <span className={`text-[10px] mt-1 block font-bold ${g.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                {g.is_active ? 'AKTIF' : 'NON-AKTIF'}
                            </span>
                          </td>

                          <td className="px-6 py-3 text-center flex justify-center gap-3">
                            <button
                              onClick={() => handleOpenEdit(g)}
                              className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleHapusGudang(g.id)}
                              className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-500"
                              title="Hapus"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredGudang.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-gray-400">
                            Tidak ada data gudang.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        <ModalNotifikasi
          isOpen={showNotifikasi}
          onClose={() => setShowNotifikasi(false)}
          notifikasiList={notifikasiList}
          onHapusNotifikasi={(id) => deleteNotifikasi(Number(id))}
          onHapusSemuaNotifikasi={deleteAllNotifikasi}
        />

        <ModalAktivitas
          isOpen={showAktivitas}
          onClose={() => setShowAktivitas(false)}
          activities={activities}
          loading={activitiesLoading}
        />

        <ModalTambahGudang
          isOpen={isModalTambahOpen}
          onClose={() => setIsModalTambahOpen(false)}
          onSave={handleSaveGudang}
        />
        <ModalEditGudang
          isOpen={isModalEditOpen}
          onClose={() => setIsModalEditOpen(false)}
          data={selectedEditData}
          onUpdate={handleUpdateGudang}
        />
      </div>
    </AuthGuard>
  );
};

export default KelolaGudangPage;