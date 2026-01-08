"use client";
import { FaEdit, FaTrash, FaWarehouse, FaUsers } from "react-icons/fa";

interface PaketTableProps {
  data: any[];
  loading: boolean;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

const PaketTable = ({ data, loading, onEdit, onDelete }: PaketTableProps) => {
  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  const formatDurasi = (hari: number) => (hari === 30 ? "1 Bulan" : hari === 365 ? "1 Tahun" : `${hari} Hari`);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-3"></div>
       <p>Memuat data paket...</p>
    </div>
  );

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left">Nama Paket</th>
            {/* ✅ KOLOM BARU: TIPE */}
            <th className="px-6 py-4 text-left">Tipe</th>
            <th className="px-6 py-4 text-left">Limit (Gudang / Staff)</th>
            <th className="px-6 py-4 text-left">Durasi</th>
            <th className="px-6 py-4 text-left">Harga</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length > 0 ? data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4">
                <div className="font-bold text-gray-800 text-base">{row.nama_paket || row.name}</div>
              </td>
              
              {/* ✅ DATA BARU: TIPE */}
              <td className="px-6 py-4">
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded border border-gray-200 uppercase">
                  {row.tipe || "REGULAR"}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-3 text-gray-600">
                   <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold" title="Limit Gudang">
                      <FaWarehouse size={12}/> {row.limit_gudang || 0}
                   </div>
                   <span className="text-gray-300">|</span>
                   <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-semibold" title="Limit Staff">
                      <FaUsers size={12}/> {row.limit_staff || 0}
                   </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">{formatDurasi(row.durasi_hari || row.duration)}</td>
              <td className="px-6 py-4 font-bold text-green-600">{formatRupiah(row.harga || row.price)}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {row.is_active ? 'Aktif' : 'Non-Aktif'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onEdit(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => onDelete(row)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={7} className="text-center py-10 text-gray-400 italic">Belum ada data paket.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default PaketTable;