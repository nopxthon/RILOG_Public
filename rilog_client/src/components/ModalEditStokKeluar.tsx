"use client";

import React, { useState } from "react";
import { FaTimes, FaCalendarAlt, FaUser, FaUserTag, FaClipboardList } from "react-icons/fa";

interface MasterItem { id: number; item_name: string; satuan: string; }

interface ModalEditStokKeluarProps {
  onClose: () => void;
  initialData: any;
  onUpdate: (data: any) => void;
  masterItems: MasterItem[];
}

export default function ModalEditStokKeluar({ onClose, initialData, onUpdate, masterItems }: ModalEditStokKeluarProps) {
  const [formData, setFormData] = useState(initialData);

  const selectedItemName = masterItems.find(i => String(i.id) === String(formData.itemId))?.item_name || "Item Tidak Ditemukan";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Stok Keluar</h2>
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

            {/* 2. Jumlah Keluar (Read Only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Keluar (Read Only)
              </label>
              <input
                type="number"
                value={formData.qty}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed outline-none"
              />
              
            </div>

            {/* 3. Customer / Tujuan */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Customer / Tujuan
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                  placeholder="Nama Customer"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUserTag className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 4. Tanggal Keluar */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Keluar
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggalKeluar"
                  value={formData.tanggalKeluar}
                  onChange={handleChange as any}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 5. Dikeluarkan Oleh (PIC) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dikeluarkan Oleh
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pic"
                  value={formData.pic}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                  placeholder="Nama PIC"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>

            {/* 6. Notes / Keterangan */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Keterangan / Notes
              </label>
              <div className="relative">
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors resize-none"
                  placeholder="Catatan tambahan..."
                />
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaClipboardList className="text-gray-400 text-sm" />
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