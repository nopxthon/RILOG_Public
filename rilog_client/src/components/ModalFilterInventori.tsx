import React from "react";
import { FaTimes, FaFilter, FaUndo } from "react-icons/fa";

// Definisi Tipe Data Filter Lengkap
export interface FilterState {
  name: string;
  category: string;
  satuan: string;
  minStok: string; // Stok atau Qty
  maxStok: string;
  startDate: string; // Khusus Masuk/Keluar
  endDate: string;
  status: string;    // Khusus Kadaluarsa
  minSisaHari: string; // Khusus Kadaluarsa
  maxSisaHari: string;
}

interface CategoryOption { id: number; category_name: string; }

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "inventori" | "masuk" | "keluar" | "kategori"; // Tab Aktif
  
  values: FilterState; // State Filter
  onChange: (field: keyof FilterState, value: string) => void; // Handler Input
  
  categories: CategoryOption[];
  availableUnits: string[];
  
  onReset: () => void;
  onApply: () => void;
}

export default function ModalFilterInventori({
  isOpen, onClose, activeTab,
  values, onChange,
  categories, availableUnits,
  onReset, onApply
}: ModalProps) {
  
  if (!isOpen) return null;

  // Judul Dinamis
  const getTitle = () => {
    switch(activeTab) {
      case "inventori": return "Filter Data Inventori";
      case "masuk": return "Filter Stok Masuk";
      case "keluar": return "Filter Stok Keluar";
      case "kategori": return "Filter Kadaluarsa";
      default: return "Filter";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaFilter className="text-blue-500" /> {getTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* 1. GLOBAL: Nama Barang */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Barang</label>
            <input 
              type="text" 
              placeholder="Cari nama barang..."
              className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={values.name} 
              onChange={(e) => onChange("name", e.target.value)} 
            />
          </div>

          {/* 2. GLOBAL: Kategori & Satuan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
              <select 
                className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm py-2"
                value={values.category}
                onChange={(e) => onChange("category", e.target.value)}
              >
                <option value="all">📂 Semua</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
              </select>
            </div>
            {/* Satuan (Tampilkan di semua tab kecuali mungkin kadaluarsa jika dirasa penuh, tapi default tampilkan saja) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Satuan</label>
              <select 
                className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm py-2"
                value={values.satuan}
                onChange={(e) => onChange("satuan", e.target.value)}
              >
                <option value="all">📦 Semua</option>
                {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* 3. KHUSUS MASUK & KELUAR: Range Tanggal */}
          {(activeTab === "masuk" || activeTab === "keluar") && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Periode Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <span className="text-[10px] text-gray-500 block mb-1">Dari Tanggal</span>
                        <input type="date" className="w-full border-gray-300 rounded text-xs" value={values.startDate} onChange={(e) => onChange("startDate", e.target.value)} />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-500 block mb-1">Sampai Tanggal</span>
                        <input type="date" className="w-full border-gray-300 rounded text-xs" value={values.endDate} onChange={(e) => onChange("endDate", e.target.value)} />
                    </div>
                </div>
            </div>
          )}

          {/* 4. KHUSUS KADALUARSA: Status & Sisa Hari */}
          {activeTab === "kategori" && (
             <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-3">
                <div>
                    <label className="block text-xs font-bold text-red-700 uppercase mb-1">Status Kadaluarsa</label>
                    <select className="w-full border-red-200 rounded text-sm" value={values.status} onChange={(e) => onChange("status", e.target.value)}>
                        <option value="all">Semua Status</option>
                        <option value="aman">✅ Aman (&gt; 90 Hari)</option>
                        <option value="warning">⚠️ Mendekati (0-90 Hari)</option>
                        <option value="expired">💀 Sudah Kadaluarsa</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-red-700 uppercase mb-1">Sisa Hari (Range)</label>
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="Min" className="w-full border-red-200 rounded text-sm" value={values.minSisaHari} onChange={(e) => onChange("minSisaHari", e.target.value)} />
                        <span className="text-gray-400">-</span>
                        <input type="number" placeholder="Max" className="w-full border-red-200 rounded text-sm" value={values.maxSisaHari} onChange={(e) => onChange("maxSisaHari", e.target.value)} />
                    </div>
                </div>
             </div>
          )}

          <hr className="border-gray-100" />

          {/* 5. GLOBAL: Range Stok/Qty */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                {activeTab === "inventori" ? "Rentang Jumlah Stok" : "Rentang Jumlah Qty"}
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min"
                className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={values.minStok} 
                onChange={(e) => onChange("minStok", e.target.value)} 
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                placeholder="Max"
                className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={values.maxStok} 
                onChange={(e) => onChange("maxStok", e.target.value)} 
              />
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex justify-between items-center">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium transition"
          >
            <FaUndo size={12} /> Reset
          </button>
          <button 
            onClick={() => { onApply(); onClose(); }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            Terapkan Filter
          </button>
        </div>

      </div>
    </div>
  );
}