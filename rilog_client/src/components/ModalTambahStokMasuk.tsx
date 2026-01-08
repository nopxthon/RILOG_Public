import React from "react";
import { FaTimes, FaChevronDown } from "react-icons/fa";

type ItemOption = {
  id: number;
  item_name: string;
  satuan: string;
};

interface FormStok {
  itemId: string; 
  tanggal: string; 
  qty: string;
  pemasok: string;
  expiryDate: string; 
  notifikasiKadaluarsa: boolean;
  pic: string; // ✅ Tambahkan State PIC
}

interface ModalTambahStokMasukProps {
  onClose: () => void;
  formStok: FormStok;
  onFormChange: (field: string, value: string | boolean) => void;
  onTambah: () => void;
  masterItems: ItemOption[];
}

export default function ModalTambahStokMasuk({
  onClose,
  formStok,
  onFormChange,
  onTambah,
  masterItems
}: ModalTambahStokMasukProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Tambah Stok Masuk</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Nama Barang (Full Width) */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Barang<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formStok.itemId}
                  onChange={(e) => onFormChange("itemId", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors appearance-none bg-white pr-10 cursor-pointer"
                >
                  <option value="">-- Pilih Barang --</option>
                  {masterItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} ({item.satuan})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaChevronDown className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 2. Tanggal Masuk & Tanggal Kadaluarsa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tanggal Masuk<span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formStok.tanggal} // 👈 PENTING: Ambil dari props
                onChange={(e) => onFormChange("tanggal", e.target.value)} // 👈 PENTING: Update ke parent
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Kadaluarsa
              </label>
              <input
                type="date"
                value={formStok.expiryDate}
                onChange={(e) => onFormChange("expiryDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
              <p className="text-xs text-gray-500">Kosongkan jika tidak ada expired.</p>
            </div>

            {/* 3. Jumlah Masuk (Full Width Sementara) */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Masuk<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={formStok.qty}
                onChange={(e) => onFormChange("qty", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* 4. Pemasok & PIC */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pemasok (Supplier)
              </label>
              <input
                type="text"
                placeholder="Contoh: PT. Sumber Makmur"
                value={formStok.pemasok}
                onChange={(e) => onFormChange("pemasok", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            {/* ⬇️ INPUT DITERIMA OLEH (PIC) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Diterima Oleh (PIC)
              </label>
              <input
                type="text"
                placeholder="Nama Penerima"
                value={formStok.pic}
                onChange={(e) => onFormChange("pic", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

          </div>

          {/* Opsi Notifikasi */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="notifikasiKadaluarsa"
              checked={formStok.notifikasiKadaluarsa}
              onChange={(e) => onFormChange("notifikasiKadaluarsa", e.target.checked)}
              className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
            />
            <label
              htmlFor="notifikasiKadaluarsa"
              className="text-sm font-medium text-gray-700 cursor-pointer select-none"
            >
              Aktifkan pengingat kadaluarsa untuk stok ini
            </label>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
            >
              Batal
            </button>
            <button
              onClick={onTambah}
              disabled={
                !formStok.itemId ||
                !formStok.qty ||
                !formStok.tanggal
              }
              className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              Simpan Stok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}