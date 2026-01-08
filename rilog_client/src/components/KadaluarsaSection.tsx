"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

/* =========================
   TYPE FINAL (SESUAI API)
========================= */
export type DataKadaluarsa = {
  id: number; // ✅ FIX
  namaBarang: string;
  klasifikasi: string;
  stok: number;
  satuan: string;
  tanggalKadaluarsa: string;
  sisaHariKadaluarsa: number;

  // tambahan → sinkron notifikasi
  statusKadaluarsa: "aman" | "mendekati" | "sudah";
};

interface KadaluarsaSectionProps {
  data: DataKadaluarsa[];
  onDragEnd: (result: DropResult) => void;
}

export default function KadaluarsaSection({
  data,
  onDragEnd,
}: KadaluarsaSectionProps) {
  const getStatusUI = (status: DataKadaluarsa["statusKadaluarsa"]) => {
    switch (status) {
      case "sudah":
        return {
          text: "Sudah Kadaluarsa",
          color: "bg-red-100 text-red-800",
        };
      case "mendekati":
        return {
          text: "Mendekati Kadaluarsa",
          color: "bg-orange-100 text-orange-800",
        };
      default:
        return {
          text: "Aman",
          color: "bg-green-100 text-green-800",
        };
    }
  };

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="kadaluarsa">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <h2 className="text-lg font-bold mb-4">
              Daftar Produk Kadaluarsa
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 text-left">No</th>
                    <th className="p-3 text-left">Nama Barang</th>
                    <th className="p-3 text-left">Klasifikasi</th>
                    <th className="p-3 text-left">Stok</th>
                    <th className="p-3 text-left">Satuan</th>
                    <th className="p-3 text-left">Tanggal Kadaluarsa</th>
                    <th className="p-3 text-left">Sisa Hari</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => {
                      const statusUI = getStatusUI(item.statusKadaluarsa);

                      return (
                        <Draggable
                          key={item.id}
                          draggableId={String(item.id)} // ✅ DND only
                          index={index}
                        >
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={
                                index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50"
                              }
                            >
                              <td className="p-3">{index + 1}</td>
                              <td className="p-3 font-medium">
                                {item.namaBarang}
                              </td>
                              <td className="p-3">
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                  {item.klasifikasi}
                                </span>
                              </td>
                              <td className="p-3 font-semibold">
                                {item.stok}
                              </td>
                              <td className="p-3">
                                <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                                  {item.satuan}
                                </span>
                              </td>
                              <td className="p-3">
                                {formatTanggal(item.tanggalKadaluarsa)}
                              </td>
                              <td className="p-3 font-semibold">
                                <span
                                  className={
                                    item.sisaHariKadaluarsa <= 30
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }
                                >
                                  {item.sisaHariKadaluarsa} hari
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`text-xs px-3 py-1 rounded-full ${statusUI.color}`}
                                >
                                  {statusUI.text}
                                </span>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada data kadaluarsa
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
