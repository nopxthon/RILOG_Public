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
import { exportStokKeluarToExcel, exportStokKeluarToPDF } from "@/utils/export";
import ModalExport from "@/components/ModalExport";

/* =========================
   TYPE DEFINITIONS
========================= */
export type DataKeluar = {
  id: number;
  namaBarang: string;
  tanggalKeluar: string;
  qtyKeluar: number;
  satuan: string;
  dikeluarkanOleh: string;
  customer?: string;
  notes?: string;
  category_id?: string;
  stokSetelahKeluar?: number;
  stokKeluar?: number; // Optional alias for qtyKeluar
};

// Pastikan tipe DataInventori ada jika digunakan di props
export type DataInventori = {
  id: number;
  namaBarang: string;
  statusStok: string;
};

interface StokKeluarSectionProps {
  data: DataKeluar[];
  onDragEnd: (result: DropResult) => void;
  onTambah: () => void;
  onEdit: (item: DataKeluar) => void;
  notifikasiList?: any[];
  onLihatDetail?: () => void;
  dataInventori?: DataInventori[]; 
}

export default function StokKeluarSection({
  data,
  onDragEnd,
  onTambah,
  onEdit, 
  notifikasiList = [],
  onLihatDetail = () => {},
  dataInventori = []
}: StokKeluarSectionProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- LOGIC NOTIFIKASI ---
  const getBarangSeringKeluar = () => {
    const tujuhHariLalu = new Date();
    tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);
    
    const barangKeluarCount: Record<string, number> = {};
    
    data.forEach(item => {
      const tanggalKeluar = new Date(item.tanggalKeluar);
      if (tanggalKeluar >= tujuhHariLalu) {
        barangKeluarCount[item.namaBarang] = (barangKeluarCount[item.namaBarang] || 0) + 1;
      }
    });
    
    return Object.entries(barangKeluarCount)
      .filter(([_, count]) => count > 3)
      .map(([nama, count]) => ({
        nama,
        count,
        jenis: "sering_keluar"
      }));
  };

  const getStokMenipisNotifikasi = () => {
    if (dataInventori.length === 0) return [];
    
    return dataInventori.filter(item => {
      const tigapuluhHariLalu = new Date();
      tigapuluhHariLalu.setDate(tigapuluhHariLalu.getDate() - 30);
      
      const totalKeluar = data
        .filter(keluar => {
          const tanggalKeluar = new Date(keluar.tanggalKeluar);
          return keluar.namaBarang === item.namaBarang && tanggalKeluar >= tigapuluhHariLalu;
        })
        .reduce((sum, keluar) => sum + (keluar.qtyKeluar || keluar.stokKeluar || 0), 0);
      
      return (item.statusStok === "Menipis" || item.statusStok === "Habis") && totalKeluar > 0;
    }).map(item => ({
      ...item,
      jenis: "stok_menipis"
    }));
  };

  const barangSeringKeluar = getBarangSeringKeluar();
  const stokMenipisNotifikasi = getStokMenipisNotifikasi();
  
  const notificationCounts = {
      stok_menipis: stokMenipisNotifikasi.length,
      stok_berlebih: barangSeringKeluar.length 
  };

  const totalNotifications = notificationCounts.stok_menipis + notificationCounts.stok_berlebih;

  const renderStokKeluarDescription = () => {
    const parts = [];
    if (notificationCounts.stok_menipis > 0) {
      parts.push(`${notificationCounts.stok_menipis} stok menipis akibat pengeluaran`);
    }
    if (notificationCounts.stok_berlebih > 0) {
      parts.push(`${notificationCounts.stok_berlebih} barang sering keluar`);
    }
    return parts.length > 0 ? parts.join(", ") : "Tidak ada peringatan baru.";
  };

  // --- EXPORT HANDLERS ---
  const handleExportExcel = () => {
    const success = exportStokKeluarToExcel(data);
    if (success) {
      Swal.fire({ icon: 'success', title: 'Berhasil Export!', text: 'Data Stok Keluar berhasil di-export ke Excel', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal Export', text: 'Terjadi kesalahan saat export data' });
    }
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const success = exportStokKeluarToPDF(data);
    if (success) {
      Swal.fire({ icon: 'success', title: 'Berhasil Export!', text: 'Data Stok Keluar berhasil di-export ke PDF', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal Export', text: 'Terjadi kesalahan saat export data' });
    }
    setShowExportModal(false);
  };

  return (
    <>
      {/* NOTIFIKASI ALERT */}
      {totalNotifications > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-red-500 text-xl">⚠</div>
              <div>
                <h3 className="font-semibold text-red-800">
                  Peringatan Stok Keluar
                </h3>
                <p className="text-sm text-red-600">{renderStokKeluarDescription()}</p>
              </div>
            </div>
            <button
              onClick={onLihatDetail}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      )}
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="keluar">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {/* HEADER SECTION */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Daftar Stok Keluar</h2>
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

              {/* TABLE SECTION */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 text-left">No</th>
                      <th className="p-3 text-left">Nama Barang</th>
                      <th className="p-3 text-left">Tanggal Keluar</th>
                      <th className="p-3 text-left">Stok Keluar</th>
                      <th className="p-3 text-left">Satuan</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-left">Dikeluarkan Oleh</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((item, index) => {
                        const seringKeluar = barangSeringKeluar.find(b => b.nama === item.namaBarang);
                        const menyebabkanStokMenipis = stokMenipisNotifikasi.find(b => b.namaBarang === item.namaBarang);
                        
                        // Handle properti yang mungkin berbeda nama dari API
                        const qty = item.qtyKeluar || item.stokKeluar || 0;

                        return (
                          <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                            {(provided) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                  ${menyebabkanStokMenipis ? "bg-red-50" : ""}
                                  ${seringKeluar ? "bg-yellow-50" : ""}
                                  hover:bg-gray-100 transition-colors
                                `}
                              >
                                <td className="p-3">
                                  {index + 1}
                                  {(seringKeluar || menyebabkanStokMenipis) && (
                                    <span className="ml-2 text-xs text-red-500" title="Ada Peringatan">⚠</span>
                                  )}
                                </td>
                                <td className="p-3 font-medium">
                                  {item.namaBarang}
                                  {seringKeluar && (
                                    <span className="block mt-1 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full w-fit">
                                      Sering keluar ({seringKeluar.count}x)
                                    </span>
                                  )}
                                  {menyebabkanStokMenipis && (
                                    <span className="block mt-1 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full w-fit">
                                      Stok menipis
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">{formatTanggal(item.tanggalKeluar)}</td>
                                <td className="p-3 font-semibold">{qty}</td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                    {item.satuan}
                                  </span>
                                </td>
                                <td className="p-3">{item.customer || "-"}</td>
                                <td className="p-3">{item.dikeluarkanOleh}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => onEdit(item)} 
                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                    title="Edit Stok Keluar"
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
                        <td colSpan={8} className="text-center py-8 text-gray-500"> 
                          Tidak ada data stok keluar.
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
                title="Export Stok Keluar"
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}