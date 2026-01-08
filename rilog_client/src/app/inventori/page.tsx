"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaBars, FaBell, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import { DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import ModalNotifikasi from "@/components/ModalNotifikasi";
import ModalAktivitas from "@/components/ModalAktivitas";
import { useNotifikasiAPI } from "@/hooks/useNotifikasiAPI";
import { useActivityAPI } from "@/hooks/useActivityAPI";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import GudangSelector from "@/components/GudangSelector";

// --- MODALS ---
import ModalTambahInventori from "@/components/ModalTambahDataInventori";
import ModalTambahStokMasuk from "@/components/ModalTambahStokMasuk";
import ModalTambahStokKeluar from "@/components/ModalTambahStokKeluar";
import ModalEditInventori from "@/components/ModalEditInventori";
import ModalEditStokMasuk from "@/components/ModalEditStokMasuk";
import ModalEditStokKeluar from "@/components/ModalEditStokKeluar";
import AlertPeringatanStok from "@/components/AlertPeringatanStok";

// --- SECTIONS ---
import DataInventoriSection from "@/components/DataInventoriSection";
import StokMasukSection from "@/components/StokMasukSection";
import StokKeluarSection from "@/components/StokKeluarSection";
import KadaluarsaSection from "@/components/KadaluarsaSection";

// --- TIPE DATA ---
type DataKeluar = {
  id: number;
  namaBarang: string;
  tanggalKeluar: string;
  qtyKeluar: number;
  satuan: string;
  dikeluarkanOleh: string;
  customer?: string;
  notes?: string;
  category_id?: string;
  item_id?: number; // Tambahan untuk mapping edit
  stokKeluar?: number; // Tambahan untuk mapping
};

type DataKategori = {
  id: number;
  namaBarang: string;
  namaKategori: string;
  klasifikasi: string;
  stok: number;
  satuan: string;
  tanggalKadaluarsa: string;
  sisaHariKadaluarsa: number;
  statusKadaluarsa: "aman" | "mendekati" | "sudah";
  category_id?: string;
};

type DataStokMasuk = {
  id: number;
  nama: string;
  tanggal: string;
  qty: number;
  pemasok: string;
  diterimaOleh: string;
  tanggalKadaluarsa: string;
  notifikasiKadaluarsa: boolean;
  satuan: string;
  category_id?: string;
  sisaHariKadaluarsa: number;
  item_id?: number; // Tambahan untuk mapping edit
};

export type MasterItem = {
  id: number;
  item_name: string;
  satuan: string;
};

type DataInventori = {
  id: number;
  namaBarang: string;
  namaKategori: string;
  satuan: string;
  stokTersedia: number;
  maxBarang: number;
  minBarang: number;
  statusStok: "Aman" | "Menipis" | "Habis" | "Berlebih";
  tanggalKadaluarsa: string;
  sisaHariKadaluarsa: number;
  item_name?: string;
  category_id?: number | string;
  min_stok?: number;
  max_stok?: number;
  statusLabel?: string;
};

// --- DEFAULT STATE ---
const INITIAL_FORM_STATE = { item_name: "", category_id: "", satuan: "", min_stok: "", max_stok: "" };
const INITIAL_FORM_STOK_MASUK = { itemId: "", qty: "", pemasok: "", expiryDate: "", notifikasiKadaluarsa: false, tanggal: "", pic: "", };
const INITIAL_FORM_STOK_KELUAR = { itemId: "", qty: "", notes: "", customer: "", tanggalKeluar: "", pic: "", };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function InventoriPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"inventori" | "masuk" | "keluar" | "kategori">("inventori");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [selectedGudangId, setSelectedGudangId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // --- Modal States ---
  const [showTambahStok, setShowTambahStok] = useState(false);
  const [showTambahStokKeluar, setShowTambahStokKeluar] = useState(false);
  const [showTambahInventori, setShowTambahInventori] = useState(false);

  // Edit Modal States
  const [showEditInventori, setShowEditInventori] = useState(false);
  const [showEditStokMasuk, setShowEditStokMasuk] = useState(false);
  const [showEditStokKeluar, setShowEditStokKeluar] = useState(false);

  const [showNotifikasi, setShowNotifikasi] = useState(false);
  const [showAktivitas, setShowAktivitas] = useState(false);

  // State Edit Data
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null); // Untuk Inventori
  const [selectedStokId, setSelectedStokId] = useState<number | null>(null); // Untuk Stok Masuk/Keluar

  const [formEditInventori, setFormEditInventori] = useState(INITIAL_FORM_STATE);
  const [formEditStokMasuk, setFormEditStokMasuk] = useState(INITIAL_FORM_STOK_MASUK);
  const [formEditStokKeluar, setFormEditStokKeluar] = useState(INITIAL_FORM_STOK_KELUAR);

  // UI States
  const [isClient, setIsClient] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [dataInventori, setDataInventori] = useState<DataInventori[]>([]);
  const [dataMasuk, setDataMasuk] = useState<DataStokMasuk[]>([]);
  const [dataKeluar, setDataKeluar] = useState<DataKeluar[]>([]);
  const [dataKategori, setDataKategori] = useState<DataKategori[]>([]);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

  // Form States (Create)
  const [formStok, setFormStok] = useState(INITIAL_FORM_STOK_MASUK);
  const [formStokKeluar, setFormStokKeluar] = useState(INITIAL_FORM_STOK_KELUAR);
  const [formInventori, setFormInventori] = useState(INITIAL_FORM_STATE);

  // ✅ HOOKS
  const {
    notifikasiList,
    refreshNotifikasi,
    deleteNotifikasi,
    deleteAllNotifikasi,
  } = useNotifikasiAPI(
    selectedGudangId ? Number(selectedGudangId) : null
  );

  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useActivityAPI(
    selectedGudangId ? Number(selectedGudangId) : null,
    100
  );

  useEffect(() => {
    setIsClient(true);
    setFormStok(prev => ({ ...prev, tanggal: new Date().toISOString().split('T')[0] }));
    setFormStokKeluar(prev => ({ ...prev, tanggalKeluar: new Date().toISOString().split('T')[0] }));

    const storedGudangId = localStorage.getItem("gudang_id");
    if (storedGudangId) setSelectedGudangId(storedGudangId);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser.id);
      } catch (e) { }
    }
  }, []);

  const handleResponseError = async (res: Response) => {
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const msg = errorBody.message || errorBody.msg || "Terjadi kesalahan pada server.";
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
        confirmButtonColor: '#f59e0b'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message || "Gagal memproses permintaan."
      });
    }
  };

  const fetchMasterItems = useCallback(async () => {
    if (!selectedGudangId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/item?gudangId=${selectedGudangId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setMasterItems(data);
    } catch (err) {
      console.error("Error fetching master items:", err);
      setMasterItems([]);
    }
  }, [selectedGudangId]);

  const calculateExpiry = (expiryDate: string | null | undefined) => {
    if (!expiryDate || expiryDate === 'N/A') return { sisaHari: 0 };
    const today = new Date();
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) return { sisaHari: 0 };
    const diff = exp.getTime() - today.getTime();
    const sisaHari = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { sisaHari };
  };

  const getStatusKadaluarsa = (sisaHari: number): "aman" | "mendekati" | "sudah" => {
    if (sisaHari < 0) return "sudah";
    if (sisaHari <= 30) return "mendekati";
    return "aman";
  };

  // ✅ FETCH DATA INVENTORI & KADALUARSA (untuk notifikasi)
  const fetchNotificationData = useCallback(async () => {
    if (!selectedGudangId) return;
    const token = localStorage.getItem("token");

    try {
      // Fetch inventori
      const invRes = await fetch(`${API_BASE_URL}/api/inventori?gudangId=${selectedGudangId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (invRes.ok) {
        const invData = await invRes.json();
        const mappedInv = invData.map((item: any) => {
          const rawDate = item.tanggalKadaluarsa || item.expiryDate || item.expired_date || null;
          const { sisaHari } = calculateExpiry(rawDate);
          const stok = item.stokTersedia ?? item.stok ?? 0;
          const min = item.minBarang ?? item.min_stok ?? 0;
          const max = item.maxBarang ?? item.max_stok ?? 0;

          return {
            ...item,
            id: Number(item.id),
            namaBarang: item.namaBarang || item.item_name || "Tanpa Nama",
            stokTersedia: stok,
            minBarang: min,
            maxBarang: max,
            statusStok: stok === 0 ? "Habis" :
              stok <= min ? "Menipis" :
                (max > 0 && stok > max) ? "Berlebih" : "Aman",
            sisaHariKadaluarsa: sisaHari,
          };
        });
        setDataInventori(mappedInv);
      }

      // Fetch kadaluarsa
      const kadRes = await fetch(`${API_BASE_URL}/api/inventori/kadaluarsa?gudangId=${selectedGudangId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (kadRes.ok) {
        const kadData = await kadRes.json();
        const mappedKad = kadData.map((item: any) => {
          const rawDate = item.tanggalKadaluarsa || item.expiryDate || null;
          const { sisaHari } = calculateExpiry(rawDate);
          return {
            ...item,
            id: Number(item.id),
            sisaHariKadaluarsa: item.sisaHariKadaluarsa !== undefined ? item.sisaHariKadaluarsa : sisaHari,
            statusKadaluarsa: getStatusKadaluarsa(item.sisaHariKadaluarsa !== undefined ? item.sisaHariKadaluarsa : sisaHari),
          };
        });
        setDataKategori(mappedKad);
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
    }
  }, [selectedGudangId]);

  const fetchData = useCallback(async () => {
    if (!selectedGudangId) return;
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "inventori") endpoint = `/api/inventori?gudangId=${selectedGudangId}`;
      else if (activeTab === "masuk") endpoint = `/api/inventori/histori?tipe=MASUK&gudangId=${selectedGudangId}`;
      else if (activeTab === "keluar") endpoint = `/api/inventori/histori?tipe=KELUAR&gudangId=${selectedGudangId}`;
      else if (activeTab === "kategori") endpoint = `/api/inventori/kadaluarsa?gudangId=${selectedGudangId}`;

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal");
      const rawData = await res.json();

      if (activeTab === "inventori") {
        const mappedData = rawData.map((item: any) => {
          const rawDate = item.tanggalKadaluarsa || item.expiryDate || item.expired_date || null;
          const { sisaHari } = calculateExpiry(rawDate);

          const stok = item.stokTersedia ?? item.stok ?? 0;
          const min = item.minBarang ?? item.min_stok ?? 0;
          const max = item.maxBarang ?? item.max_stok ?? 0;

          return {
            ...item,
            id: Number(item.id),
            namaBarang: item.namaBarang || item.item_name || "Tanpa Nama",
            namaKategori: item.namaKategori || item.kategori?.category_name || "-",
            satuan: item.satuan,
            stokTersedia: stok,
            minBarang: min,
            maxBarang: max,
            statusStok: stok === 0 ? "Habis" :
              stok <= min ? "Menipis" :
                (max > 0 && stok > max) ? "Berlebih" : "Aman",
            item_name: item.item_name || item.namaBarang,
            category_id: item.category_id || item.kategori?.id,
            min_stok: min,
            max_stok: max,
            tanggalKadaluarsa: rawDate || "-",
            sisaHariKadaluarsa: item.sisaHariKadaluarsa !== undefined ? item.sisaHariKadaluarsa : sisaHari,
          };
        });
        setDataInventori(mappedData);
      }
      else if (activeTab === "masuk") {
        const mappedData = rawData.map((item: any) => ({
          ...item,
          id: Number(item.id),
          nama: item.nama || item.namaBarang || "-",
          qty: item.qty || item.stokMasuk || 0,
          sisaHariKadaluarsa: item.sisaHariKadaluarsa || 0,
        }));
        setDataMasuk(mappedData);
      }
      else if (activeTab === "keluar") {
        const mappedData = rawData.map((item: any) => ({
          ...item,
          id: Number(item.id),
          qtyKeluar: item.qtyKeluar || item.stokKeluar || 0,
          stokKeluar: item.stokKeluar || 0,
        }));
        setDataKeluar(mappedData);
      }
      else if (activeTab === "kategori") {
        const mappedKategori = rawData.map((item: any) => {
          const rawDate = item.tanggalKadaluarsa || item.expiryDate || null;
          const { sisaHari } = calculateExpiry(rawDate);
          const statusKadaluarsa = getStatusKadaluarsa(
            item.sisaHariKadaluarsa !== undefined ? item.sisaHariKadaluarsa : sisaHari
          );

          return {
            ...item,
            id: Number(item.id),
            category_id: item.category_id || item.categoryId || item.kategori?.id,
            namaKategori: item.klasifikasi || item.kategori?.category_name || "-",
            sisaHariKadaluarsa: item.sisaHariKadaluarsa !== undefined ? item.sisaHariKadaluarsa : sisaHari,
            statusKadaluarsa: statusKadaluarsa,
          };
        });
        setDataKategori(mappedKategori);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      if (activeTab === "inventori") setDataInventori([]);
      else if (activeTab === "masuk") setDataMasuk([]);
      else if (activeTab === "keluar") setDataKeluar([]);
      else if (activeTab === "kategori") setDataKategori([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedGudangId]);

  useEffect(() => {
    if (isClient && selectedGudangId) {
      fetchMasterItems();
      fetchData();
      fetchNotificationData();
      refreshActivities();
    }
  }, [selectedGudangId, fetchData, fetchMasterItems, fetchNotificationData, isClient, refreshActivities]);

  // --- LOGIC NOTIFIKASI ---
  const calculateNotifikasiCounts = useCallback(() => {
    const counts = { stok_habis: 0, stok_menipis: 0, stok_berlebih: 0, mendekati_kadaluarsa: 0, sudah_kadaluarsa: 0, total: 0 };

    dataInventori.forEach(item => {
      if (item.statusStok === "Habis") counts.stok_habis++;
      else if (item.statusStok === "Menipis") counts.stok_menipis++;
      else if (item.statusStok === "Berlebih") counts.stok_berlebih++;
    });

    dataKategori.forEach(item => {
      if (item.sisaHariKadaluarsa < 0) counts.sudah_kadaluarsa++;
      else if (item.sisaHariKadaluarsa <= 30) counts.mendekati_kadaluarsa++;
    });

    counts.total = counts.stok_habis + counts.stok_menipis + counts.stok_berlebih + counts.mendekati_kadaluarsa + counts.sudah_kadaluarsa;
    return counts;
  }, [dataInventori, dataKategori]);

  const generateNotifikasiList = useCallback(() => {
    const notifikasiList = [];

    dataInventori.forEach(item => {
      if (item.statusStok === "Menipis") {
        notifikasiList.push({ id: `stok-menipis-${item.id}`, type: "stok_menipis", title: "Stok Menipis", message: `${item.namaBarang} stok menipis (${item.stokTersedia} ${item.satuan})`, timestamp: new Date().toISOString(), itemId: item.id });
      } else if (item.statusStok === "Habis") {
        notifikasiList.push({ id: `stok-habis-${item.id}`, type: "stok_habis", title: "Stok Habis", message: `${item.namaBarang} stok sudah habis`, timestamp: new Date().toISOString(), itemId: item.id });
      } else if (item.statusStok === "Berlebih") {
        notifikasiList.push({ id: `stok-berlebih-${item.id}`, type: "stok_berlebih", title: "Stok Berlebih", message: `${item.namaBarang} stok berlebih (${item.stokTersedia} ${item.satuan})`, timestamp: new Date().toISOString(), itemId: item.id });
      }
    });

    dataKategori.forEach(item => {
      if (item.sisaHariKadaluarsa < 0) {
        notifikasiList.push({ id: `kadaluarsa-${item.id}`, type: "sudah_kadaluarsa", title: "Barang Kadaluarsa", message: `${item.namaBarang} sudah kadaluarsa`, timestamp: new Date().toISOString(), itemId: item.id, sisaHari: item.sisaHariKadaluarsa });
      } else if (item.sisaHariKadaluarsa <= 30) {
        notifikasiList.push({ id: `mendekati-kadaluarsa-${item.id}`, type: "mendekati_kadaluarsa", title: "Mendekati Kadaluarsa", message: `${item.namaBarang} mendekati kadaluarsa (${item.sisaHariKadaluarsa} hari lagi)`, timestamp: new Date().toISOString(), itemId: item.id, sisaHari: item.sisaHariKadaluarsa });
      }
    });

    return notifikasiList;
  }, [dataInventori, dataKategori]);

  // --- HANDLERS CLOSE MODAL ---
  const handleCloseModalInventori = () => { setShowTambahInventori(false); setFormInventori(INITIAL_FORM_STATE); };
  const handleCloseModalStokMasuk = () => { setShowTambahStok(false); setFormStok(INITIAL_FORM_STOK_MASUK); };
  const handleCloseModalStokKeluar = () => { setShowTambahStokKeluar(false); setFormStokKeluar(INITIAL_FORM_STOK_KELUAR); };
  const handleCloseModalEdit = () => { setShowEditInventori(false); setFormEditInventori(INITIAL_FORM_STATE); setSelectedItemId(null); };
  const handleCloseModalEditStokMasuk = () => { setShowEditStokMasuk(false); setFormEditStokMasuk(INITIAL_FORM_STOK_MASUK); setSelectedStokId(null); };
  const handleCloseModalEditStokKeluar = () => { setShowEditStokKeluar(false); setFormEditStokKeluar(INITIAL_FORM_STOK_KELUAR); setSelectedStokId(null); };

  // --- FORM HANDLERS (CREATE) ---
  const handleFormInventoriChange = (field: string, value: string) => setFormInventori(prev => ({ ...prev, [field]: value }));
  const handleFormStokChange = (field: string, value: string | boolean) => setFormStok(prev => ({ ...prev, [field]: value }));
  const handleFormStokKeluarChange = (field: string, value: string) => setFormStokKeluar(prev => ({ ...prev, [field]: value }));

  // ✅ CREATE INVENTORI
  const handleTambahInventori = async () => {
    const token = localStorage.getItem("token");
    if (!formInventori.item_name || !formInventori.category_id) return Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Mohon lengkapi Nama Barang dan Kategori!', confirmButtonColor: '#facc15' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          item_name: formInventori.item_name,
          category_id: formInventori.category_id,
          satuan: formInventori.satuan,
          min_stok: parseInt(formInventori.min_stok) || 0,
          max_stok: parseInt(formInventori.max_stok) || 0,
          gudang_id: selectedGudangId,
          user_id: userId
        })
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.message || errorBody.msg || "Gagal menyimpan item baru ke server.");
      }

      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Item inventori berhasil didaftarkan.', timer: 1500, showConfirmButton: false });
      handleCloseModalInventori();

      // ✅ FIX: Syntax corrected
      await fetchData();
      await fetchNotificationData();
      refreshNotifikasi();

    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
    }
  };

  const handleEditClick = (id: number) => {
    const itemToEdit = dataInventori.find(item => item.id === id);
    if (itemToEdit) {
      setFormEditInventori({
        item_name: itemToEdit.item_name || itemToEdit.namaBarang,
        category_id: itemToEdit.category_id ? String(itemToEdit.category_id) : "",
        satuan: itemToEdit.satuan,
        min_stok: String(itemToEdit.min_stok ?? itemToEdit.minBarang ?? 0),
        max_stok: String(itemToEdit.max_stok ?? itemToEdit.maxBarang ?? 0)
      });
      setSelectedItemId(id);
      setShowEditInventori(true);
    }
  };

  const handleUpdateInventori = async (updatedData: any) => {
    const token = localStorage.getItem("token");
    const payload = {
      item_name: updatedData.item_name,
      category_id: parseInt(updatedData.category_id),
      satuan: updatedData.satuan,
      min_stok: parseInt(updatedData.min_stok) || 0,
      max_stok: parseInt(updatedData.max_stok) || 0,
      user_id: userId
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/item/${selectedItemId}`, { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload) });
      await handleResponseError(res);
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1500, showConfirmButton: false });
      handleCloseModalEdit(); fetchData();
    } catch (err: any) { showErrorAlert(err); }
  };

  // ✅ CREATE STOK MASUK
  const handleTambahStok = async () => {
    const token = localStorage.getItem("token");
    if (!formStok.itemId || !formStok.qty) return Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Pilih barang dan isi jumlah!', confirmButtonColor: '#facc15' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventori/stok-masuk`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ gudangId: selectedGudangId, itemId: parseInt(formStok.itemId), quantity: parseInt(formStok.qty), supplierName: formStok.pemasok, pic: formStok.pic, date: formStok.tanggal, expiryDate: formStok.expiryDate || null, }) });
      await handleResponseError(res);
      Swal.fire({ icon: 'success', title: 'Stok Masuk Tersimpan', timer: 1500, showConfirmButton: false });

      await fetchData();
      await fetchNotificationData();
      refreshNotifikasi();

      handleCloseModalStokMasuk();
    } catch (err) { showErrorAlert(err); }
  };

  // ✅ EDIT STOK MASUK - CLICK HANDLER
  const handleEditStokMasukClick = (item: DataStokMasuk) => {
    setFormEditStokMasuk({
      itemId: String(item.item_id || item.id),
      qty: String(item.qty),
      pemasok: item.pemasok,
      expiryDate: item.tanggalKadaluarsa ? new Date(item.tanggalKadaluarsa).toISOString().split('T')[0] : "",
      notifikasiKadaluarsa: item.notifikasiKadaluarsa,
      tanggal: item.tanggal ? new Date(item.tanggal).toISOString().split('T')[0] : "",
      pic: item.diterimaOleh
    });
    setSelectedStokId(item.id);
    setShowEditStokMasuk(true);
  };

  // ✅ UPDATE STOK MASUK - API CALL
  const handleUpdateStokMasuk = async (updatedData: any) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventori/stok-masuk/${selectedStokId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          gudangId: selectedGudangId,
          itemId: parseInt(updatedData.itemId),
          quantity: parseInt(updatedData.qty),
          supplierName: updatedData.pemasok,
          pic: updatedData.pic,
          date: updatedData.tanggal,
          expiryDate: updatedData.expiryDate || null,
        })
      });
      await handleResponseError(res);
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data Stok Masuk diperbarui', timer: 1500, showConfirmButton: false });
      handleCloseModalEditStokMasuk();
      fetchData();
    } catch (err: any) {
      showErrorAlert(err);
    }
  };

  // ✅ CREATE STOK KELUAR (Fungsi yang diperbaiki)
  const handleTambahStokKeluar = async () => {
    const token = localStorage.getItem("token");
    if (!formStokKeluar.itemId || !formStokKeluar.qty) return Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Pilih barang dan isi jumlah!', confirmButtonColor: '#facc15' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventori/stok-keluar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          gudangId: selectedGudangId,
          itemId: parseInt(formStokKeluar.itemId),
          quantity: parseInt(formStokKeluar.qty),
          notes: formStokKeluar.notes,
          customer: formStokKeluar.customer,
          pic: formStokKeluar.pic,
          date: formStokKeluar.tanggalKeluar
        })
      });
      await handleResponseError(res);
      Swal.fire({ icon: 'success', title: 'Stok Keluar Tersimpan', timer: 1500, showConfirmButton: false });

      await fetchData();
      await fetchNotificationData();
      refreshNotifikasi();

      handleCloseModalStokKeluar();
    } catch (err: any) { showErrorAlert(err); }
  };

  // ✅ EDIT STOK KELUAR - CLICK HANDLER
  const handleEditStokKeluarClick = (item: DataKeluar) => {
    setFormEditStokKeluar({
      itemId: String(item.item_id || item.id),
      qty: String(item.qtyKeluar || item.stokKeluar),
      notes: item.notes || "",
      customer: item.customer || "",
      tanggalKeluar: item.tanggalKeluar ? new Date(item.tanggalKeluar).toISOString().split('T')[0] : "",
      pic: item.dikeluarkanOleh
    });
    setSelectedStokId(item.id);
    setShowEditStokKeluar(true);
  };

  // ✅ UPDATE STOK KELUAR - API CALL
  const handleUpdateStokKeluar = async (updatedData: any) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventori/stok-keluar/${selectedStokId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          gudangId: selectedGudangId,
          itemId: parseInt(updatedData.itemId),
          quantity: parseInt(updatedData.qty),
          notes: updatedData.notes,
          customer: updatedData.customer,
          pic: updatedData.pic,
          date: updatedData.tanggalKeluar,
        })
      });
      await handleResponseError(res);
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data Stok Keluar diperbarui', timer: 1500, showConfirmButton: false });
      handleCloseModalEditStokKeluar();
      fetchData();
    } catch (err: any) {
      showErrorAlert(err);
    }
  };

  // ✅ LOGIKA SEARCH GLOBAL (Hanya 1 definisi yang benar)
  const checkGlobalSearch = useCallback((item: any, term: string) => {
    if (!term) return true;
    const lowerTerm = term.toLowerCase();

    const substringMatches = (val: string | number | undefined | null) =>
      val ? String(val).toLowerCase().includes(lowerTerm) : false;

    const stockStatusExactMatch = item.statusStok && item.statusStok.toLowerCase() === lowerTerm;

    const numberOnlySearch = lowerTerm.replace(/\D/g, '');
    let sisaHariMatch = false;
    if (numberOnlySearch && item.sisaHariKadaluarsa !== undefined && item.sisaHariKadaluarsa !== null) {
      if (String(item.sisaHariKadaluarsa).includes(numberOnlySearch)) sisaHariMatch = true;
    }

    let statusKadaluarsaMatch = false;
    if (item.sisaHariKadaluarsa !== undefined && item.sisaHariKadaluarsa !== null) {
      const sisa = Number(item.sisaHariKadaluarsa);
      let statusKeywords = "";

      if (sisa < 0) statusKeywords = "kadaluarsa expired sudah lewat sudah";
      else if (sisa <= 30) statusKeywords = "menipis warning mendekati kritis mendekati";
      else statusKeywords = "aman safe aman";

      if (statusKeywords.includes(lowerTerm)) {
        statusKadaluarsaMatch = true;
      }
    }

    const generalMatch = (
      substringMatches(item.namaBarang) ||
      substringMatches(item.nama) ||
      substringMatches(item.namaKategori) ||
      substringMatches(item.klasifikasi) ||
      substringMatches(item.satuan) ||
      substringMatches(item.stokTersedia) ||
      substringMatches(item.stok) ||
      substringMatches(item.qty) ||
      substringMatches(item.qtyKeluar) ||
      substringMatches(item.pemasok) ||
      substringMatches(item.diterimaOleh) ||
      substringMatches(item.customer) ||
      substringMatches(item.dikeluarkanOleh) ||
      substringMatches(item.notes) ||
      substringMatches(item.tanggalKadaluarsa) ||
      substringMatches(item.tanggal) ||
      substringMatches(item.tanggalKeluar)
    );

    return generalMatch || stockStatusExactMatch || statusKadaluarsaMatch || sisaHariMatch;
  }, []);

  const filteredInventori = useMemo(() =>
    dataInventori.filter(i => checkGlobalSearch(i, searchValue)),
    [dataInventori, searchValue, checkGlobalSearch]
  );

  const filteredMasuk = useMemo(() =>
    dataMasuk.filter(i => checkGlobalSearch(i, searchValue)),
    [dataMasuk, searchValue, checkGlobalSearch]
  );

  const filteredKeluar = useMemo(() =>
    dataKeluar.filter(i => checkGlobalSearch(i, searchValue)),
    [dataKeluar, searchValue, checkGlobalSearch]
  );

  const filteredKategori = useMemo(() =>
    dataKategori.filter(i => checkGlobalSearch(i, searchValue)),
    [dataKategori, searchValue, checkGlobalSearch]
  );

  const alertNotifikasiList = useMemo(() => generateNotifikasiList(), [generateNotifikasiList]);
  const notifikasiCounts = useMemo(() => calculateNotifikasiCounts(), [calculateNotifikasiCounts]);

  const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result: DropResult, type: string) => {
    if (!result.destination) return;

    if (type === "inventori") {
      const items = reorder(dataInventori, result.source.index, result.destination.index);
      setDataInventori(items);
    } else if (type === "masuk") {
      const items = reorder(dataMasuk, result.source.index, result.destination.index);
      setDataMasuk(items);
    } else if (type === "keluar") {
      const items = reorder(dataKeluar, result.source.index, result.destination.index);
      setDataKeluar(items);
    } else if (type === "kategori") {
      const items = reorder(dataKategori, result.source.index, result.destination.index);
      setDataKategori(items);
    }
  };

  const handleLihatDetailPeringatan = () => {
    setShowNotifikasi(true);
  };

  if (!isClient) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
        <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-10">
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
              placeholder="Cari barang..."
              className="flex-1"
              onSearch={setSearchValue}
            />
            <div className="flex items-center gap-4">
              {/* Tombol Log Aktivitas */}
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
                onGudangChange={(id) => setSelectedGudangId(id)}
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {alertNotifikasiList.length > 0 && (
            <AlertPeringatanStok
              notifikasiList={alertNotifikasiList}
              notifikasiCounts={notifikasiCounts}
              onLihatDetail={handleLihatDetailPeringatan}
              variant="inventori"
            />
          )}

          <div className="grid grid-cols-4 mb-0 rounded-t-xl overflow-hidden">
            {[
              { key: "inventori", label: "Data Inventori" },
              { key: "masuk", label: "Stok Masuk" },
              { key: "keluar", label: "Stok Keluar" },
              { key: "kategori", label: "Kadaluarsa" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 font-semibold border-b-4 transition-all ${activeTab === tab.key
                    ? "bg-gray-100 text-yellow-500 border-yellow-500"
                    : "bg-gray-100 text-gray-500 border-transparent hover:text-yellow-500"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-b-xl shadow p-6 mt-0">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500">
                Sedang memuat data...
              </div>
            ) : (
              <>
                {activeTab === "inventori" && (
                  <DataInventoriSection
                    data={filteredInventori}
                    onDragEnd={(r) => handleDragEnd(r, "inventori")}
                    onTambah={() => setShowTambahInventori(true)}
                    onEdit={handleEditClick}
                  />
                )}

                {activeTab === "masuk" &&
                  <StokMasukSection
                    data={filteredMasuk}
                    onDragEnd={(r) => handleDragEnd(r, "masuk")}
                    onTambah={() => setShowTambahStok(true)}
                    onEdit={handleEditStokMasukClick}
                  />
                }

                {activeTab === "keluar" &&
                  <StokKeluarSection
                    data={filteredKeluar}
                    onDragEnd={(r) => handleDragEnd(r, "keluar")}
                    onTambah={() => setShowTambahStokKeluar(true)}
                    onEdit={handleEditStokKeluarClick}
                  />
                }

                {activeTab === "kategori" && (
                  <KadaluarsaSection
                    data={filteredKategori}
                    onDragEnd={(r) => handleDragEnd(r, "kategori")}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL FORMS --- */}
      {showTambahInventori && (
        <ModalTambahInventori
          onClose={handleCloseModalInventori}
          formInventori={formInventori as any}
          onFormChange={handleFormInventoriChange}
          onTambah={handleTambahInventori}
        />
      )}

      {showEditInventori && (
        <ModalEditInventori
          onClose={handleCloseModalEdit}
          initialData={formEditInventori}
          onUpdate={handleUpdateInventori}
        />
      )}

      {showTambahStok && (
        <ModalTambahStokMasuk
          onClose={handleCloseModalStokMasuk}
          formStok={formStok}
          onFormChange={handleFormStokChange}
          onTambah={handleTambahStok}
          masterItems={masterItems}
        />
      )}

      {showTambahStokKeluar && (
        <ModalTambahStokKeluar
          onClose={handleCloseModalStokKeluar}
          formStokKeluar={formStokKeluar}
          onFormChange={handleFormStokKeluarChange}
          onTambah={handleTambahStokKeluar}
          masterItems={masterItems}
        />
      )}

      {/* ✅ TAMBAHKAN MODAL EDIT STOK YANG HILANG SEBELUMNYA */}
      {showEditStokMasuk && (
        <ModalEditStokMasuk
          onClose={handleCloseModalEditStokMasuk}
          initialData={formEditStokMasuk}
          onUpdate={handleUpdateStokMasuk}
          masterItems={masterItems} // Pastikan komponen ini menerima props masterItems jika diperlukan
        />
      )}

      {showEditStokKeluar && (
        <ModalEditStokKeluar
          onClose={handleCloseModalEditStokKeluar}
          initialData={formEditStokKeluar}
          onUpdate={handleUpdateStokKeluar}
          masterItems={masterItems}
        />
      )}

      {/* Modal Notifikasi */}
      <ModalNotifikasi
        isOpen={showNotifikasi}
        onClose={() => setShowNotifikasi(false)}
        notifikasiList={notifikasiList}
        onHapusNotifikasi={(id) => deleteNotifikasi(Number(id))}
        onHapusSemuaNotifikasi={deleteAllNotifikasi}
      />

      {/* Modal Log Aktivitas */}
      <ModalAktivitas
        isOpen={showAktivitas}
        onClose={() => setShowAktivitas(false)}
        activities={activities}
        loading={activitiesLoading}
      />
    </div>
  );
}

export default InventoriPage;