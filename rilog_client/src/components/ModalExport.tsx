// components/ModalExport.tsx
"use client";

import React from 'react';
import { FaFileExcel, FaFilePdf, FaTimes } from 'react-icons/fa';

interface ModalExportProps {
  isOpen: boolean;
  onClose: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  title?: string;
}

const ModalExport: React.FC<ModalExportProps> = ({
  isOpen,
  onClose,
  onExportExcel,
  onExportPDF,
  title = "Export Data"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Pilih format file yang ingin Anda download:
          </p>

          <div className="space-y-3">
            {/* Export Excel */}
            <button
              onClick={() => {
                onExportExcel();
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all group"
            >
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <FaFileExcel className="text-green-600 text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Export ke Excel</h3>
                <p className="text-sm text-gray-500">Format .xlsx</p>
              </div>
            </button>

            {/* Export PDF */}
            <button
              onClick={() => {
                onExportPDF();
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all group"
            >
              <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-200 transition-colors">
                <FaFilePdf className="text-red-600 text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Export ke PDF</h3>
                <p className="text-sm text-gray-500">Format .pdf</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExport;