"use client";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface PaketFormModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  initialData?: any; 
  isEdit?: boolean;
}

const PaketFormModal = ({ isOpen, onClose, onSave, initialData, isEdit = false }: PaketFormModalProps) => {
  // State Form
  const [formData, setFormData] = useState<{
    nama_paket: string;
    tipe: string; 
    harga: number | string; 
    durasi_hari: number | string;
    limit_gudang: number | string;
    limit_staff: number | string;
    is_active: boolean;
  }>({ 
    nama_paket: "", 
    tipe: "MONTHLY", // Default set ke salah satu tipe valid
    harga: 0, 
    durasi_hari: 30, 
    limit_gudang: 1,
    limit_staff: 1,
    is_active: true 
  });

  useEffect(() => {
    if (isOpen && isEdit && initialData) {
      setFormData({
        nama_paket: initialData.nama_paket || initialData.name || "",
        // Ambil tipe dari data, default ke MONTHLY jika tidak ada
        tipe: initialData.tipe || "MONTHLY", 
        harga: initialData.harga || initialData.price || 0,
        durasi_hari: initialData.durasi_hari || initialData.duration || 30,
        limit_gudang: initialData.limit_gudang || 1,
        limit_staff: initialData.limit_staff || 1,
        is_active: initialData.is_active ?? true,
      });
    } else if (isOpen && !isEdit) {
      // Reset form untuk mode Tambah
      setFormData({ 
        nama_paket: "", 
        tipe: "MONTHLY", 
        harga: "", 
        durasi_hari: "", 
        limit_gudang: "", 
        limit_staff: "", 
        is_active: true 
      });
    }
  }, [isOpen, isEdit, initialData]);

  // Helper untuk handle input angka agar bisa dihapus
  const handleNumberChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b">
          <h3 className="font-bold text-xl text-gray-800">
            {isEdit ? "Edit Paket Langganan" : "Tambah Paket Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          
          {/* Grid: Nama Paket & Tipe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Paket</label>
              <input 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition" 
                placeholder="Contoh: Gold Plan" 
                value={formData.nama_paket} 
                onChange={e => setFormData({...formData, nama_paket: e.target.value})} 
              />
            </div>
            {/* ✅ UPDATED: TIPE PAKET SESUAI DATABASE */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Paket</label>
              <select 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                value={formData.tipe}
                onChange={e => setFormData({...formData, tipe: e.target.value})}
              >
                <option value="MONTHLY">Monthly (Bulanan)</option>
                <option value="YEARLY">Yearly (Tahunan)</option>
                <option value="TRIAL">Trial (Uji Coba)</option>
                <option value="PROMO">Promo</option>
              </select>
            </div>
          </div>

          {/* Grid: Harga & Durasi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition" 
                placeholder="0" 
                value={formData.harga} 
                onChange={e => handleNumberChange("harga", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Durasi (Hari)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition" 
                placeholder="30" 
                value={formData.durasi_hari} 
                onChange={e => handleNumberChange("durasi_hari", e.target.value)} 
              />
            </div>
          </div>

          {/* Grid: Limit Gudang & Staff */}
          <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Limit Gudang</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none text-sm" 
                placeholder="1" 
                value={formData.limit_gudang} 
                onChange={e => handleNumberChange("limit_gudang", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Limit Staff</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none text-sm" 
                placeholder="1" 
                value={formData.limit_staff} 
                onChange={e => handleNumberChange("limit_staff", e.target.value)} 
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white" 
              value={formData.is_active ? "1" : "0"} 
              onChange={e => setFormData({...formData, is_active: e.target.value === "1"})}
            >
              <option value="1">Aktif (Tampil)</option>
              <option value="0">Tidak Aktif (Sembunyi)</option>
            </select>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            Batal
          </button>
          <button 
            onClick={() => {
                // Pastikan nilai dikembalikan ke 0 jika string kosong sebelum disimpan
                const finalData = {
                    ...formData,
                    harga: formData.harga === "" ? 0 : formData.harga,
                    durasi_hari: formData.durasi_hari === "" ? 0 : formData.durasi_hari,
                    limit_gudang: formData.limit_gudang === "" ? 0 : formData.limit_gudang,
                    limit_staff: formData.limit_staff === "" ? 0 : formData.limit_staff,
                };
                onSave(finalData);
            }} 
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-md transition transform active:scale-95"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
export default PaketFormModal;