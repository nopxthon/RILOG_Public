"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { FaFileExport, FaPlus, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { exportStokMasukToExcel, exportStokMasukToPDF } from "@/utils/export";
import ModalExport from "@/components/ModalExport";
// import AlertPeringatanStok from "@/components/AlertPeringatanStok"; // ✅ Import AlertPeringatanStok

/* =========================
   TYPE FINAL (SESUAI API)
========================= */
export type DataStokMasuk = {
  id: number;
  nama: string;
  tanggal: string;
  qty: number;
  satuan: string;
  pemasok: string;
  diterimaOleh: string;
  tanggalKadaluarsa: string | null;
  notifikasiKadaluarsa: boolean;
  minStok?: number;
  maxStok?: number;
  sisaHariKadaluarsa?: number;
};

interface StokMasukSectionProps {
  data: DataStokMasuk[];
  onDragEnd: (result: DropResult) => void;
  onTambah: () => void;
  onEdit: (item: DataStokMasuk) => void;
  notifikasiList?: any[];
  onLihatDetail?: () => void;
}

export default function StokMasukSection({
  data,
  onDragEnd,
  onTambah,
  onEdit, 
  notifikasiList = [], 
  onLihatDetail = () => {} 
}: StokMasukSectionProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getNotifikasiData = () => {
    // Pastikan sisaHariKadaluarsa ada dan valid
    return data.filter(item => 
        item.sisaHariKadaluarsa !== undefined && item.sisaHariKadaluarsa <= 30
    );
  };

  const calculateNotificationCounts = () => {
    const kadaluarsaItems = getNotifikasiData();
    const counts = {
      stok_menipis: 0,
      sudah_kadaluarsa: kadaluarsaItems.filter(item => (item.sisaHariKadaluarsa || 0) < 0).length,
      mendekati_kadaluarsa: kadaluarsaItems.filter(item => (item.sisaHariKadaluarsa || 0) >= 0 && (item.sisaHariKadaluarsa || 0) <= 7).length,
      stok_berlebih: 0,
      stok_habis: 0,
      total: 0
    };
    return counts;
  };

  const notificationCounts = calculateNotificationCounts();
  const kadaluarsaItems = getNotifikasiData();
  const totalNotifications = Object.values(notificationCounts).reduce((a, b) => a + b, 0);

  // --- EXPORT HANDLERS ---
  const handleExportExcel = () => {
    const success = exportStokMasukToExcel(data);
    if (success) {
      Swal.fire({ icon: 'success', title: 'Berhasil Export!', text: 'Data Stok Masuk berhasil di-export ke Excel', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal Export', text: 'Terjadi kesalahan saat export data' });
    }
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const success = exportStokMasukToPDF(data);
    if (success) {
      Swal.fire({ icon: 'success', title: 'Berhasil Export!', text: 'Data Stok Masuk berhasil di-export ke PDF', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal Export', text: 'Terjadi kesalahan saat export data' });
    }
    setShowExportModal(false);
  };

  return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="masuk">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Daftar Stok Masuk</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
                  >
                    <FaFileExport /> Export
                  </button>
                  <button 
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
                    onClick={onTambah}
                  >
                    <FaPlus /> Tambah
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 text-left">No</th>
                      <th className="p-3 text-left">Nama Barang</th>
                      <th className="p-3 text-left">Tanggal Masuk</th>
                      <th className="p-3 text-left">Stok Masuk</th>
                      <th className="p-3 text-left">Satuan</th>
                      <th className="p-3 text-left">Pemasok</th>
                      <th className="p-3 text-left">Diterima Oleh</th>
                      <th className="p-3 text-left">Tanggal Kadaluarsa</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((item, index) => {
                        return (
                          <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                            {(provided) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                              >
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-medium">{item.nama}</td>
                                <td className="p-3">{formatTanggal(item.tanggal)}</td>
                                <td className="p-3 font-semibold">{item.qty}</td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                    {item.satuan}
                                  </span>
                                </td>
                                <td className="p-3">{item.pemasok}</td>
                                <td className="p-3">{item.diterimaOleh}</td>
                                <td className="p-3">
                                  {formatTanggal(item.tanggalKadaluarsa)}
                                  {item.notifikasiKadaluarsa && (
                                    <span className="ml-2 text-xs text-red-500" title="Notifikasi Aktif">⚠</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => onEdit(item)}
                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                    title="Edit Stok Masuk"
                                  >
                                    <FaEdit />
                                  </button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          Tidak ada data yang cocok dengan pencarian.
                        </td>
                      </tr>
                    )}
                    {provided.placeholder}
                  </tbody>
                </table>
              </div>

              {/* MODAL EXPORT */}
              <ModalExport
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                title="Export Stok Masuk"
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>
  );
}