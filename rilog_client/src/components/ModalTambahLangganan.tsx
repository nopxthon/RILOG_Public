"use client";
import { useState, ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa"; // 🟢 Tambahan

interface ModalTambahLanggananProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalTambahLangganan({
  isOpen,
  onClose,
}: ModalTambahLanggananProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Data yang disimpan:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        
        {/* 🟢 Tombol Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Pengguna Baru
        </h2>

        {/* === FORM TAMBAH PENGGUNA === */}
        <input
          name="email"
          type="email"
          placeholder="Email Pengguna"
          className="w-full mb-3 border border-gray-300 p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="nama"
          placeholder="Nama Pengguna"
          className="w-full mb-3 border border-gray-300 p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="bisnis"
          placeholder="Nama Bisnis"
          className="w-full mb-3 border border-gray-300 p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="mulai"
          type="date"
          className="w-full mb-3 border border-gray-300 p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="berakhir"
          type="date"
          className="w-full mb-3 border border-gray-300 p-2 rounded"
          onChange={handleChange}
        />

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}