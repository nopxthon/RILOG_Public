// src/types/notifikasi.ts

/* =======================
   NOTIFIKASI
======================= */
export type NotifikasiType =
  | "stok_habis"
  | "stok_menipis"
  | "stok_berlebih"
  | "mendekati_kadaluarsa"
  | "sudah_kadaluarsa";

export type NotifikasiPriority = "high" | "medium" | "low";

export interface NotifikasiItem {
  id: number;
  type: NotifikasiType;
  title: string;
  message: string;
  produk: string;
  qty: number;
  satuan: string;
  tanggal: string;
  priority: NotifikasiPriority;
  minStok?: number;
  maxStok?: number;
  hariMenujuKadaluarsa?: number;
  gudangId?: number;      // ✅ TAMBAH
  gudangNama?: string;    // ✅ TAMBAH
}

/* =======================
   DATA MASUK
======================= */
export interface DataMasuk {
  id: number;
  nama: string;
  tanggal: string;
  kategori: string;
  qty: number;
  satuan: string;
  supplier: string;
  maxStok?: number;
  minStok?: number;
  tanggalKadaluarsa?: string;
}

/* =======================
   STOK OPNAME
======================= */
export type StokOpnameItem = {
  nama: string;
  tanggal: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  catatan: string;
};

/* =======================
   LAPORAN
======================= */
export type LaporanItem = {
  nama: string;
  stok: number;
  masuk: number;
  keluar: number;
};

export type DataGrafik = {
  minggu: string;
} & Record<string, number | string>;

/* =======================
   STATUS PRODUK
======================= */
export type StatusProduk = {
  produk: string;
  kesimpulan: string;
  rekomendasi: string;
  status: "Restock" | "Aman" | "Stabil";
  warna: string;
};

/* =======================
   STAFF
======================= */
export type Staff = {
  id: number;
  username: string;
  email: string;
  password: string;
};

/* =======================
   GUDANG
======================= */
export interface Gudang {
  id: number;
  nama: string;
  tipe: string;
  alamat: string;
}