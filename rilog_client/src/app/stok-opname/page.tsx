"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaBars, FaBell, FaPlus, FaTimes, FaCalendarAlt, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation"; 
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";

// --- TIPE DATA ---
type ItemBatch = {
    id: number;
    item_id: number;
    stok: number; 
    satuan: string;
    expiry_date: string;
    item_name: string;
};

type StokOpnameItem = {
  id: string;
  nama: string;
  tanggal: string;
  satuan: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  catatan: string;
};

type FormOpname = {
    batchId: string; 
    itemId: string;
    tanggal: string;
    stokFisik: string;
    catatan: string;
    stokSistem: number;
};

const INITIAL_FORM: FormOpname = {
    batchId: "",
    itemId: "",
    tanggal: new Date().toISOString().split('T')[0],
    stokFisik: "",
    catatan: "",
    stokSistem: 0,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function StokOpnamePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false);
  const [showModalTambah, setShowModalTambah] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false); 
  
  const [selectedGudangId, setSelectedGudangId] = useState<string | null>(null);
  const [availableBatches, setAvailableBatches] = useState<ItemBatch[]>([]);
  const [formOpname, setFormOpname] = useState<FormOpname>(INITIAL_FORM);
  const [dataOpname, setDataOpname] = useState<StokOpnameItem[]>([]); 

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

  // Hook Activity API
  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useActivityAPI(
    selectedGudangId ? Number(selectedGudangId) : null,
    100
  );

  // --- 🔥 HELPER ERROR HANDLING 🔥 ---
  const handleResponseError = async (res: Response) => {
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const msg = errorBody.message || errorBody.msg || "Terjadi kesalahan pada server.";
        
        // Deteksi Error Gudang Non-Aktif (403)
        if (res.status === 403) {
             throw new Error("GUDANG_FROZEN: " + msg);
        }
        throw new Error(msg);
    }
    return res.json();
  };

  const showErrorAlert = (err: any) => {
    if (err.message && err.message.startsWith("GUDANG_FROZEN:")) {
        const cleanMsg = err.message.replace("GUDANG_FROZEN: ", "");
        Swal.fire({
            icon: 'warning', 
            title: 'Akses Dibatasi',
            text: cleanMsg,
            footer: 'Silakan aktifkan gudang di menu Kelola Gudang untuk melakukan stok opname.',
            confirmButtonColor: '#f59e0b' 
        });
    } else {
        Swal.fire({ 
            icon: 'error', 
            title: 'Gagal', 
            text: err.message || "Gagal memproses permintaan.",
            showConfirmButton: false,
            timer: 2000
        });
    }
  };

  // --- FETCH API ---
  const fetchAllBatches = useCallback(async (gudangId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/opname/batches?gudangId=${gudangId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      // GET Batches aman (Read Only), jadi pakai standard check
      if(!res.ok) throw new Error("Gagal mengambil data batch.");
      const rawData = await res.json();

      const mappedBatches: ItemBatch[] = rawData.map((b: any) => ({
        id: b.id,
        item_id: b.item_id,
        stok: b.stok || b.stok_tersedia || b.stock || 0, 
        satuan: b.satuan || b.item?.satuan || 'Unit', 
        expiry_date: b.expiry_date || 'N/A',
        item_name: b.item_name || b.item?.item_name || 'Item Name Missing' 
      }));
      setAvailableBatches(mappedBatches);
    } catch (err: any) { console.error("Error batch fetch:", err.message); }
  }, []);

  const fetchDataOpname = useCallback(async (gudangId: string) => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/opname/stok-opname?gudangId=${gudangId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if(!res.ok) throw new Error("Gagal mengambil histori stok opname.");
        const rawData = await res.json();
        const mappedData: StokOpnameItem[] = rawData.map((item: any) => ({
            id: String(item.id),
            nama: item.nama || item.item?.item_name || 'Unknown Item',
            tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
            satuan: item.satuan || 'Unit',
            stokSistem: item.stokSistem || 0, 
            stokFisik: item.stokFisik || 0, 
            selisih: (item.stokFisik || 0) - (item.stokSistem || 0),
            catatan: item.catatan || item.notes || '-',
        }));
        setDataOpname(mappedData);
    } catch (err: any) { console.error("Error opname fetch:", err.message); setDataOpname([]); } 
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (!selectedGudangId) {
        const initialGudangId = localStorage.getItem("gudang_id");
        if (initialGudangId) {
            setSelectedGudangId(initialGudangId);
        }
        setIsClientReady(true);
        return;
    }

    // Fetch data setiap kali selectedGudangId berubah
    fetchDataOpname(selectedGudangId);
    fetchAllBatches(selectedGudangId);
    localStorage.setItem("gudang_id", selectedGudangId);
    setIsClientReady(true);
}, [selectedGudangId, fetchDataOpname, fetchAllBatches]);

  const handleGudangChange = (id: string) => { setSelectedGudangId(id); };
  
  // --- LOGIKA DROPDOWN ---
  const uniqueItems = useMemo(() => {
    const itemsMap = new Map();
    availableBatches.forEach(batch => {
        if (!itemsMap.has(batch.item_id)) {
            itemsMap.set(batch.item_id, batch.item_name);
        }
    });
    return Array.from(itemsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [availableBatches]);

  const filteredBatches = useMemo(() => {
    if (!formOpname.itemId) return [];
    return availableBatches.filter(b => String(b.item_id) === formOpname.itemId);
  }, [availableBatches, formOpname.itemId]);

  const isFormComplete = useMemo(() => {
      return (
          formOpname.itemId !== "" &&
          formOpname.batchId !== "" &&
          formOpname.tanggal !== "" &&
          formOpname.stokFisik !== ""
      );
  }, [formOpname]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormOpname(prev => {
        const newState = { ...prev, [name]: value };
        
        if (name === 'itemId') {
            newState.batchId = "";
            newState.stokSistem = 0;
        }

        if (name === 'batchId') {
            const selectedBatch = availableBatches.find(batch => String(batch.id) === value);
            newState.stokSistem = selectedBatch?.stok || 0;
        }
        return newState;
    });
  };

  const handleCloseModal = () => {
    setFormOpname(INITIAL_FORM);
    setShowModalTambah(false);
  };

  // ✅ HANDLER SIMPAN (Updated with Smart Error Handling)
  const handleSimpanOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    const token = localStorage.getItem("token");
    const physicalStock = parseInt(formOpname.stokFisik) || 0;
    const systemStock = formOpname.stokSistem || 0;

    try {
        const res = await fetch(`${API_BASE_URL}/api/opname/stok-opname/batch`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                item_id: parseInt(formOpname.itemId),
                batch_id: parseInt(formOpname.batchId), 
                gudang_id: selectedGudangId,
                date: formOpname.tanggal,
                system_stock: systemStock, 
                physical_stock: physicalStock, 
                notes: formOpname.catatan,
            })
        });

        // 🔥 Cek Error (termasuk Gudang Non-Aktif)
        await handleResponseError(res);

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Stok Opname berhasil disimpan",
          timer: 1500,
          showConfirmButton: false
        });
        
        setShowModalTambah(false);
        setFormOpname(INITIAL_FORM);
        
        // Refresh semua data termasuk activity log
        fetchDataOpname(selectedGudangId!);
        fetchAllBatches(selectedGudangId!);
        refreshActivities(); // Refresh activity log
        
    } catch (error: any) { 
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: error.message,
            showConfirmButton: false,
            timer: 2000
        });
    }
  };

  const handleSearch = (value: string) => setSearchValue(value);

  const filteredData = useMemo(() => {
    const keyword = searchValue.toLowerCase();
    return dataOpname.filter(
      (item) =>
        item.nama.toLowerCase().includes(keyword) ||
        item.catatan.toLowerCase().includes(keyword) ||
        item.satuan.toLowerCase().includes(keyword) ||
        item.tanggal.toLowerCase().includes(keyword)
    );
  }, [dataOpname, searchValue]);

  const formatNumber = (num: number): string => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (!isClientReady) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 text-2xl"><FaBars /></button>}
            <SearchBar placeholder="Cari histori opname..." className="flex-1" onSearch={handleSearch} />
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
              <button className="relative bg-[#FFFAF0] rounded-full p-3 shadow-sm" onClick={() => setShowNotifikasi(true)}>
                <FaBell className="text-yellow-500 text-lg" />
                {notifikasiList.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{notifikasiList.length}</span>}
              </button>

              <GudangSelector className="min-w-[200px]" onGudangChange={handleGudangChange} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-4 mb-0 rounded-t-xl overflow-hidden">
            <button className="py-3 px-6 font-semibold border-b-4 bg-gray-100 text-yellow-500 border-yellow-500 text-left w-full">
                Histori Stok Opname
            </button>
            <div className="py-3 border-b-4 border-transparent bg-gray-100"></div>
            <div className="py-3 border-b-4 border-transparent bg-gray-100"></div>
            <div className="py-3 border-b-4 border-transparent bg-gray-100"></div>
          </div>

          <div className="bg-white rounded-b-xl shadow p-6 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Daftar Hasil Opname</h2>
              <button 
                  onClick={() => selectedGudangId ? setShowModalTambah(true) : Swal.fire('Pilih Gudang', 'Pilih gudang dulu', 'warning')}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!selectedGudangId}
              >
                  <FaPlus /> Tambah Opname
              </button>
            </div>

            {isLoading ? ( <div className="text-center py-10 text-gray-500">Sedang memuat data...</div> ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 text-left">No</th>
                      <th className="p-3 text-left min-w-[150px]">Nama Produk</th>
                      <th className="p-3 text-left">Tanggal</th>
                      <th className="p-3 text-left">Satuan</th>
                      <th className="p-3 text-left">Stok Sistem</th>
                      <th className="p-3 text-left">Stok Fisik</th>
                      <th className="p-3 text-left min-w-[80px]">Selisih</th>
                      <th className="p-3 text-left min-w-[200px]">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium">{item.nama}</td>
                          <td className="p-3">{item.tanggal}</td>
                          <td className="p-3">
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                {item.satuan}
                              </span>
                          </td>
                          <td className="p-3 text-gray-600">{formatNumber(item.stokSistem)}</td>
                          <td className="p-3 font-bold">{formatNumber(item.stokFisik)}</td>
                          <td className={`p-3 font-semibold ${item.selisih > 0 ? "text-green-600" : item.selisih < 0 ? "text-red-600" : "text-gray-400"}`}>
                            {item.selisih > 0 ? `+${formatNumber(item.selisih)}` : formatNumber(item.selisih)}
                          </td>
                          <td className="p-3 text-gray-500 italic truncate max-w-xs" title={item.catatan}>
                            {item.catatan}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={8} className="text-center py-8 text-gray-500">Tidak ada data opname yang cocok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Tambah Stok Opname */}
      {showModalTambah && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-[480px] rounded-2xl shadow-lg p-6 relative">
            <button 
                onClick={handleCloseModal} 
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
            >
                <FaTimes />
            </button>
            <h3 className="text-lg font-bold text-center mb-4">Tambah Stok Opname</h3>
            
            <form className="space-y-4" onSubmit={handleSimpanOpname}>
              <div>
                <label className="block text-sm font-semibold mb-1">Pilih Produk <span className="text-red-500">*</span></label>
                <select 
                    name="itemId" 
                    value={formOpname.itemId} 
                    onChange={handleFormChange} 
                    className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">-- Pilih Produk --</option>
                  {uniqueItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Pilih Batch <span className="text-red-500">*</span></label>
                <select 
                    name="batchId" 
                    value={formOpname.batchId} 
                    onChange={handleFormChange} 
                    disabled={!formOpname.itemId}
                    className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Pilih Batch --</option>
                  {filteredBatches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                        Exp: {new Date(batch.expiry_date).toLocaleDateString()} (Stok: {batch.stok})
                    </option>
                  ))}
                </select>
              </div>

              {formOpname.batchId && (
                <div className="bg-yellow-50 p-3 rounded-lg text-sm border border-yellow-200 flex justify-between items-center">
                  <span>Stok Sistem Tercatat:</span>
                  <span className="font-bold text-yellow-800 text-lg">{formOpname.stokSistem}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Tanggal <span className="text-red-500">*</span></label>
                    <div className="relative"><input type="date" name="tanggal" value={formOpname.tanggal} onChange={handleFormChange} className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Stok Fisik <span className="text-red-500">*</span></label>
                    <input type="number" name="stokFisik" value={formOpname.stokFisik} onChange={handleFormChange} className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" placeholder="0" />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Catatan (Opsional)</label>
                <textarea name="catatan" value={formOpname.catatan} onChange={handleFormChange} className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 resize-none" rows={2} placeholder="Contoh: 2 pcs rusak, 1 hilang"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-100"
                >
                    Batal
                </button>
                
                <button 
                    type="submit" 
                    disabled={!isFormComplete}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${isFormComplete ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Simpan Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  );
}

export default StokOpnamePage;