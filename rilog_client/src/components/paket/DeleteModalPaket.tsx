"use client";

import { FaTrash } from "react-icons/fa";

interface DeleteModalPaketProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paketName: string;
}

const DeleteModalPaket = ({ isOpen, onClose, onConfirm, paketName }: DeleteModalPaketProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-center p-6">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTrash className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Paket?</h3>
        <p className="text-gray-500 text-sm mb-6">
          Anda yakin ingin menghapus paket <strong className="text-gray-800">{paketName}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModalPaket;