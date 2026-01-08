"use client";

import { FC } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalHapusProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalHapus: FC<ModalHapusProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>

        {/* Isi Modal */}
        <h2 className="text-lg font-semibold mb-2">
          Apakah kamu yakin ingin menghapus data ini?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Data yang sudah dihapus tidak bisa dikembalikan.
        </p>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-semibold transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHapus;
