import React, { useEffect, useState } from "react";
import { FaTimes, FaChevronDown } from "react-icons/fa";

// Interface Data
interface FormInventori {
  item_name: string;
  category_id: string;
  satuan: string;
  min_stok: string;
  max_stok: string;
}

interface Category {
  id: number;
  category_name: string;
}

interface ModalProps {
  onClose: () => void;
  formInventori: FormInventori;
  onFormChange: (field: string, value: string) => void;
  onTambah: () => void;
}

export default function ModalTambahInventori({ 
  onClose, 
  formInventori, 
  onFormChange, 
  onTambah 
}: ModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch Kategori saat modal dibuka
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/kategori`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Gagal ambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Tambah Barang Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Nama Barang */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Barang<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Beras Premium 5kg"
                value={formInventori.item_name}
                onChange={(e) => onFormChange("item_name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 2. Kategori */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Kategori<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formInventori.category_id}
                  onChange={(e) => onFormChange("category_id", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors appearance-none bg-white pr-10 cursor-pointer"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaChevronDown className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 3. Satuan */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Satuan<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Pcs, Kg, Box, dll"
                value={formInventori.satuan}
                onChange={(e) => onFormChange("satuan", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 4. Min Stok (WAJIB) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Min. Stok<span className="text-red-500">*</span> (Peringatan Menipis)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 10"
                value={formInventori.min_stok}
                onChange={(e) => {
                  const val = e.target.value;
                  // Regex: Hanya angka atau kosong
                  if (val === "" || /^[0-9]+$/.test(val)) {
                    onFormChange("min_stok", val);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 5. Max Stok (WAJIB) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max. Stok<span className="text-red-500">*</span> (Peringatan Berlebih)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 100"
                value={formInventori.max_stok}
                onChange={(e) => {
                  const val = e.target.value;
                  // Regex: Hanya angka atau kosong
                  if (val === "" || /^[0-9]+$/.test(val)) {
                    onFormChange("max_stok", val);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
            >
              Batal
            </button>
            <button
              onClick={onTambah}
              // ✅ DISABLED JIKA ADA FIELD YANG KOSONG
              disabled={
                !formInventori.item_name || 
                !formInventori.category_id || 
                !formInventori.satuan ||
                !formInventori.min_stok ||  // Wajib
                !formInventori.max_stok     // Wajib
              }
              className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              Simpan Barang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}