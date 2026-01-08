import React from "react";
import { FaTimes, FaChevronDown } from "react-icons/fa";

// Tipe Master Item untuk Dropdown
type ItemOption = {
  id: number;
  item_name: string;
  satuan: string;
};

interface FormStokKeluar {
  itemId: string; 
  qty: string;
  notes: string;
  customer: string;
  tanggalKeluar: string;
  pic: string; // ✅ TAMBAHAN: Field PIC
}

interface ModalProps {
  onClose: () => void;
  formStokKeluar: FormStokKeluar;
  onFormChange: (field: string, value: string) => void;
  onTambah: () => void;
  masterItems: ItemOption[];
}

export default function ModalTambahStokKeluar({ 
  onClose, 
  formStokKeluar, 
  onFormChange, 
  onTambah,
  masterItems 
}: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Keluarkan Stok</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Pilih Barang (Dropdown) - Full Width */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Pilih Barang<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formStokKeluar.itemId}
                  onChange={(e) => onFormChange("itemId", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors appearance-none bg-white pr-10 cursor-pointer"
                >
                  <option value="">-- Pilih Barang yang Mau Dikeluarkan --</option>
                  {masterItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} (Satuan: {item.satuan})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaChevronDown className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 2. Tanggal Keluar */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tanggal Keluar<span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formStokKeluar.tanggalKeluar} // 👈 PENTING
                onChange={(e) => onFormChange("tanggalKeluar", e.target.value)} // 👈 PENTING
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>

            {/* 3. Jumlah Keluar */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Keluar<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={formStokKeluar.qty}
                onChange={(e) => onFormChange("qty", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 4. Nama Pelanggan (Customer) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Pelanggan / Tujuan
              </label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Budi / Gudang B"
                value={formStokKeluar.customer}
                onChange={(e) => onFormChange("customer", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 5. Dikeluarkan Oleh (PIC) - ✅ NEW FIELD */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dikeluarkan Oleh (PIC)
              </label>
              <input
                type="text"
                placeholder="Nama Staff / Admin"
                value={formStokKeluar.pic}
                onChange={(e) => onFormChange("pic", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 6. Catatan (Notes) - Full Width */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Catatan / Alasan
              </label>
              <textarea
                value={formStokKeluar.notes}
                onChange={(e) => onFormChange("notes", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors h-24 resize-none"
                placeholder="Contoh: Penjualan reguler, barang rusak, donasi, dll..."
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
              disabled={!formStokKeluar.itemId || !formStokKeluar.qty || !formStokKeluar.tanggalKeluar}
              className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              Keluarkan Stok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}