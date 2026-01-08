"use client";

import React, { useState } from "react";
import { FaTimes, FaCalendarAlt, FaUser, FaBuilding } from "react-icons/fa";

interface MasterItem { id: number; item_name: string; satuan: string; }

interface ModalEditStokMasukProps {
  onClose: () => void;
  initialData: any;
  onUpdate: (data: any) => void;
  masterItems: MasterItem[];
}

export default function ModalEditStokMasuk({ onClose, initialData, onUpdate, masterItems }: ModalEditStokMasukProps) {
  const [formData, setFormData] = useState(initialData);

  // Cari nama barang untuk ditampilkan (Read-only)
  const selectedItemName = masterItems.find(i => String(i.id) === String(formData.itemId))?.item_name || "Item Tidak Ditemukan";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Stok Masuk</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Nama Barang (Read Only) */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Barang (Read Only)
              </label>
              <input
                type="text"
                value={selectedItemName}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed outline-none"
              />
            </div>

            {/* 2. Jumlah Masuk (Read Only - Demi Keamanan Stok) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Masuk (Read Only)
              </label>
              <input
                type="number"
                value={formData.qty}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed outline-none"
              />
              
            </div>

            {/* 3. Pemasok */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pemasok
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pemasok"
                  value={formData.pemasok}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                  placeholder="Nama Supplier"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaBuilding className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 4. Tanggal Masuk */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Masuk
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 5. Diterima Oleh (PIC) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Diterima Oleh
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pic"
                  value={formData.pic}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                  placeholder="Nama Penerima"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 6. Tanggal Kadaluarsa */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Kadaluarsa (Opsional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onUpdate(formData); }}
              className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}