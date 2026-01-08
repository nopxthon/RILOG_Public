"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { FaEdit, FaPlus } from "react-icons/fa";

/* =======================
   TYPE FINAL (SESUAI API)
   ======================= */
export type DataInventori = {
  id: number; // ✅ FIX
  namaBarang: string;
  namaKategori: string;
  satuan: string;
  stokTersedia: number;
  maxBarang: number;
  minBarang: number;
  statusStok: "Aman" | "Menipis" | "Habis" | "Berlebih";
  tanggalKadaluarsa: string;
  sisaHariKadaluarsa: number;
};

interface DataInventoriSectionProps {
  data: DataInventori[];
  onDragEnd: (result: DropResult) => void;
  onTambah: () => void;
  onEdit: (id: number) => void; // ✅ FIX
}

export default function DataInventoriSection({
  data,
  onDragEnd,
  onTambah,
  onEdit,
}: DataInventoriSectionProps) {
  const getStatusColor = (status: DataInventori["statusStok"]) => {
    switch (status) {
      case "Aman":
        return "bg-green-100 text-green-800";
      case "Menipis":
        return "bg-yellow-100 text-yellow-800";
      case "Habis":
        return "bg-red-100 text-red-800";
      case "Berlebih":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="inventori">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Daftar Data Inventori</h2>

              <button
                onClick={onTambah}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow"
              >
                <FaPlus /> Tambah
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 text-left">No</th>
                    <th className="p-3 text-left">Nama Barang</th>
                    <th className="p-3 text-left">Kategori</th>
                    <th className="p-3 text-left">Satuan</th>
                    <th className="p-3 text-left">Stok</th>
                    <th className="p-3 text-left">Max</th>
                    <th className="p-3 text-left">Min</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={String(item.id)} // ✅ string hanya untuk DND
                        index={index}
                      >
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-medium">
                              {item.namaBarang}
                            </td>
                            <td className="p-3">
                              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                {item.namaKategori}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                                {item.satuan}
                              </span>
                            </td>
                            <td className="p-3 font-semibold">
                              {item.stokTersedia}
                            </td>
                            <td className="p-3">{item.maxBarang}</td>
                            <td className="p-3">{item.minBarang}</td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                                  item.statusStok
                                )}`}
                              >
                                {item.statusStok}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => onEdit(item.id)} // ✅ number
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FaEdit size={16} />
                              </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada data inventori.
                      </td>
                    </tr>
                  )}
                  {provided.placeholder}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
