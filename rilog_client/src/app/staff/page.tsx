"use client";

import { FC, useState, useEffect, useCallback, useMemo } from "react";
import { FaBell, FaEdit, FaTrash, FaPlus, FaBars, FaToggleOn, FaToggleOff, FaUserTie, FaHistory } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import AuthGuard from "@/components/AuthGuard";
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";
import ModalHapus from "@/components/ModalHapus";
import ModalTambahStaff from "@/components/ModalTambahStaff";
import ModalEditStaff from "@/components/ModalEditStaff";

// --- TIPE DATA SESUAI BACKEND ---
type Staff = {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'pending' | 'suspended'; 
  bisnis: { id: number; nama_bisnis: string } | null;
  gudang: { id: number; nama_gudang: string }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =========================
// Helper GET API
// =========================
async function apiGet(path: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  return json;
}

// =========================
// DELETE API
// =========================
async function apiDelete(path: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// =========================
// Mapper Staff
// =========================
function mapStaffArray(raw: any): Staff[] {
  const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null;

  if (!data) {
    console.error("❌ API tidak mengembalikan array. Data diterima:", raw);
    return [];
  }

  return data.map((s: any) => ({
    id: s.id,
    username: s.name,
    email: s.email,
    status: s.status,
    bisnis: s.bisnis || null,
    gudang: s.gudangs || [],
  }));
}

const StaffPage: FC = () => {
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  // Modal States
  const [showModalTambah, setShowModalTambah] = useState(false);
  const [showModalHapus, setShowModalHapus] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  
  // Data States
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gudang State (Untuk Notif & Activity)
  const [selectedGudangId, setSelectedGudangId] = useState<string | null>(null);

  // Limit Staff State
  const [limitStaff, setLimitStaff] = useState<number>(0);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);

  // ✅ 1. SETUP HOOKS DI LEVEL ATAS (JANGAN DALAM FUNGSI LAIN)
  
  // Hook Notifikasi
  const {
    notifikasiList,
    deleteNotifikasi,
    deleteAllNotifikasi,
  } = useNotifikasiAPI(
    selectedGudangId ? Number(selectedGudangId) : null
  );

  // Hook Activity
  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useActivityAPI(
    selectedGudangId ? Number(selectedGudangId) : null,
    100
  );

  // =================================================================
  // 🔥 HELPER: ERROR HANDLER
  // =================================================================
  const handleResponseError = async (res: Response) => {
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || data.msg || "Terjadi kesalahan pada server.";
        
        if (res.status === 403) {
             throw new Error("LIMIT_REACHED: " + msg);
        }
        throw new Error(msg);
    }
    return res.json();
  };

  const showErrorAlert = (err: any) => {
    if (err.message && err.message.startsWith("LIMIT_REACHED:")) {
        const cleanMsg = err.message.replace("LIMIT_REACHED: ", "");
        Swal.fire({
            icon: 'warning',
            title: 'Upgrade Diperlukan',
            text: cleanMsg,
            confirmButtonColor: '#f59e0b',
            footer: '<a href="/pricing">Lihat Paket Langganan</a>'
        });
    } else {
        Swal.fire({ 
            icon: 'error', 
            title: 'Gagal', 
            text: err.message || "Gagal memproses permintaan." 
        });
    }
  };

  // =============================
  // 2. FETCH DATA & EFFECTS
  // =============================

  // Init Gudang ID dari LocalStorage
  useEffect(() => {
    const initialGudangId = localStorage.getItem("gudang_id");
    if (initialGudangId) {
      setSelectedGudangId(initialGudangId);
    }
  }, []);

  // Fetch Limit Staff Profile
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.status === 'success' && json.data) {
            const realLimit = json.data.limit_staff;
            
            if (realLimit >= 1000000) {
                setIsUnlimited(true);
                setLimitStaff(9999);
            } else {
                setIsUnlimited(false);
                setLimitStaff(realLimit || 1);
            }
        }
    } catch (err) {
        console.error("Gagal fetch limit staff:", err);
    }
  };

  // Load Staff Data
  const loadStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data staff");
      
      const data = await res.json();
      const mapped = Array.isArray(data) ? data : (data.data || []);
      
      setStaffData(mapped.map((s: any) => ({
        id: s.id,
        username: s.name,
        email: s.email,
        status: s.status,
        bisnis: s.bisnis || null,
        gudang: s.gudangs || [],
      })));

    } catch (err) {
      console.error(err);
      setStaffData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect Utama
  useEffect(() => {
    loadStaff();
    fetchUserProfile();
  }, [loadStaff]);

  // =============================
  // 🔥 HITUNG SLOT STAFF TERPAKAI
  // =============================
  const usedSlots = useMemo(() => {
    return staffData.filter(s => s.status === 'active' || s.status === 'pending').length;
  }, [staffData]);

  const isFull = !isUnlimited && usedSlots >= limitStaff;
  
  const filteredStaff = staffData.filter(
    (staff) =>
      staff.username.toLowerCase().includes(searchValue.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  // =============================
  // 3. EVENT HANDLERS
  // =============================

  const handleGudangChange = (id: string) => {
    setSelectedGudangId(id);
    localStorage.setItem("gudang_id", id);
  };

  // --- Tambah Staff ---
  const handleTambahStaff = async (data: {
    username: string;
    email: string;
    gudangIds: number[];
    bisnis_id: number; 
  }) => {
    if (isFull) {
        Swal.fire({
            icon: 'warning',
            title: 'Slot Penuh',
            confirmButtonColor: '#eab308',
            text: `Kuota staff aktif Anda (${limitStaff}) sudah penuh. Upgrade paket untuk menambah staff.`,
            footer: '<a href="/pricing">Lihat Paket Langganan</a>'
        });
        return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/staff/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(data),
      });

      await handleResponseError(res);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Undangan staff berhasil dikirim.",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowModalTambah(false);
      loadStaff(); 
      refreshActivities();
    } catch (err) {
      showErrorAlert(err);
    }
  };

  // --- Toggle Status (Aktif/Suspend) ---
  const handleToggleStatus = async (staff: Staff) => {
    if (staff.status === 'pending') {
        Swal.fire({
            icon: 'info',
            title: 'Menunggu Aktivasi',
            text: 'Staff ini belum melakukan aktivasi email. Status tidak dapat diubah manual.',
        });
        return;
    }

    const isCurrentlyActive = staff.status === 'active';

    if (!isCurrentlyActive && isFull) {
        Swal.fire({
            icon: 'warning',
            title: 'Slot Penuh',
            confirmButtonColor: '#eab308',
            text: `Kuota staff aktif Anda (${limitStaff}) sudah penuh. Tidak bisa mengaktifkan staff ini.`,
            footer: '<a href="/pricing">Lihat Paket Langganan</a>'
        });
        return;
    }

    const actionText = isCurrentlyActive ? 'Menonaktifkan (Suspend)' : 'Mengaktifkan';
    const confirmColor = isCurrentlyActive ? '#d33' : '#22c55e';

    const result = await Swal.fire({
        title: `${actionText} Staff?`,
        text: isCurrentlyActive 
            ? "Staff ini tidak akan bisa login lagi (Slot akan kosong)." 
            : "Staff ini akan bisa login kembali (Menggunakan 1 Slot).",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#a2a6abff',
        confirmButtonText: `Ya, ${isCurrentlyActive ? 'Suspend' : 'Aktifkan'}!`
    });

    if (!result.isConfirmed) return;

    try {
        const token = localStorage.getItem("token");
        const targetStatusActive = !isCurrentlyActive; 

        const res = await fetch(`${API_URL}/api/staff/${staff.id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ is_active: targetStatusActive }),
        });

        await handleResponseError(res);

        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: `Status staff berhasil diperbarui.`,
            timer: 1500,
            showConfirmButton: false,
        });

        loadStaff(); 
    } catch (err: any) {
        showErrorAlert(err);
    }
  };

  // --- Update Staff ---
  const handleUpdateStaff = async ({ staffId, gudangIds, bisnis_id }: { staffId: number; gudangIds: number[]; bisnis_id: number; }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/staff/update-access`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ staffId, gudangIds, bisnis_id }),
      });

      await handleResponseError(res);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Akses staff berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      loadStaff();
      refreshActivities();
      setShowModalEdit(false);
    } catch (err) {
      showErrorAlert(err);
    }
  };

  // --- Hapus Staff ---
  const handleOpenModalHapus = (id: number) => {
    setSelectedStaffId(id);
    setShowModalHapus(true);
  };

  const handleConfirmHapus = async () => {
    if (selectedStaffId == null) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/staff/${selectedStaffId}`, {
         method: "DELETE",
         headers: { Authorization: "Bearer " + token },
      });
      
      // Khusus delete, mungkin backend mengembalikan JSON langsung atau 204
      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         throw new Error(data.message || "Gagal menghapus staff");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Staff berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      loadStaff();
      refreshActivities();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.message });
    }
    setShowModalHapus(false);
  };

  // ==========================================================
  // RENDER UI
  // ==========================================================
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
          {/* Topbar */}
          <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl hover:opacity-80 transition">
                  <FaBars />
                </button>
              )}
              <SearchBar placeholder="Cari staff (nama/email)..." className="flex-1" onSearch={setSearchValue} />
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

                <GudangSelector 
                  className="min-w-[200px]" 
                  onGudangChange={handleGudangChange}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 pb-6">
            
            {/* 🔥 HEADER + INDIKATOR SLOT */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">Manajemen Staff</h2>

                  {/* BADGE SLOT */}
                  {!isLoading && limitStaff > 0 && (
                        <div className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1
                            ${isFull 
                                ? 'bg-red-50 border-red-200 text-red-600' 
                                : 'bg-purple-50 border-purple-200 text-purple-600'
                            }`}>
                            <FaUserTie className="text-xs" />
                            <span>Slot Staff:</span>
                            <strong>{usedSlots} / {isUnlimited ? '∞' : limitStaff}</strong>
                        </div>
                    )}
              </div>

              <button
                onClick={() => setShowModalTambah(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm text-white
                    ${isFull 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                disabled={isFull}
              >
                <FaPlus /> Tambah Staff
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow p-4 min-h-[400px]">
              {isLoading ? (
                  <div className="text-center py-10 text-gray-400">Memuat data staff...</div>
              ) : (
                <table className="min-w-full text-sm table-auto">
                    <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
                        <th className="px-4 py-3 font-semibold w-12 text-center">No</th>
                        <th className="px-4 py-3 font-semibold">Nama Staff</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold text-center">Status</th>
                        <th className="px-4 py-3 font-semibold text-center">Status Akun</th>
                        <th className="px-4 py-3 font-semibold">Akses Gudang</th>
                        <th className="px-4 py-3 font-semibold w-32 text-center">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredStaff.length > 0 ? (
                        filteredStaff.map((staff, index) => (
                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{staff.username}</td>
                            <td className="px-4 py-3 text-gray-600">{staff.email}</td>
                            
                            {/* KOLOM STATUS (Badge) */}
                            <td className="px-4 py-3 text-center">
                                {staff.status === "pending" && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                )}
                                {staff.status === "active" && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                )}
                                {staff.status === "suspended" && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Suspended
                                    </span>
                                )}
                            </td>

                            {/* KOLOM TOGGLE SWITCH (Aksi Status) */}
                            <td className="px-4 py-3 text-center">
                                <button 
                                    onClick={() => handleToggleStatus(staff)}
                                    disabled={staff.status === 'pending'}
                                    className={`
                                        text-2xl transition-colors focus:outline-none 
                                        ${staff.status === 'pending' ? 'text-gray-300 cursor-not-allowed' : ''}
                                        ${staff.status === 'active' ? 'text-green-500 hover:text-green-600' : ''}
                                        ${staff.status === 'suspended' ? 'text-gray-400 hover:text-gray-500' : ''}
                                    `}
                                    title={
                                        staff.status === 'pending' ? 'Menunggu Aktivasi User' : 
                                        staff.status === 'active' ? 'Klik untuk Suspend' : 'Klik untuk Aktifkan'
                                    }
                                >
                                    {staff.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                                </button>
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                                {staff.gudang.length > 0
                                    ? staff.gudang.map((g: any) => g.nama_gudang).join(", ")
                                    : <span className="text-gray-400 italic">Tidak ada akses</span>}
                            </td>

                            <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                    onClick={() => {
                                        setSelectedStaff(staff);
                                        setShowModalEdit(true);
                                    }}
                                    title="Edit Akses"
                                >
                                <FaEdit />
                                </button>

                                <button
                                    onClick={() => handleOpenModalHapus(staff.id)}
                                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                                    title="Hapus Staff"
                                >
                                <FaTrash />
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                            Tidak ada staff yang cocok dengan pencarian.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* --- MODALS --- */}
        <ModalHapus
          isOpen={showModalHapus}
          onClose={() => setShowModalHapus(false)}
          onConfirm={handleConfirmHapus}
        />

        <ModalTambahStaff
          isOpen={showModalTambah}
          onClose={() => setShowModalTambah(false)}
          onTambah={handleTambahStaff}
        />

        <ModalEditStaff
          isOpen={showModalEdit}
          onClose={() => setShowModalEdit(false)}
          staff={selectedStaff}
          onUpdate={handleUpdateStaff}
        />

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
      </div>
    </AuthGuard>
  );
};

export default StaffPage;