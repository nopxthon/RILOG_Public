import React from "react";
import { FaEdit } from "react-icons/fa";

interface UserTableProps {
  data: any[];
  loading: boolean;
  onEdit: (item: any) => void;
}

const UserTable: React.FC<UserTableProps> = ({ data, loading, onEdit }) => {
  
  // ✅ FORMAT TANGGAL BARU (dd/mm/yyyy, HH.MM)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    
    // Format dd/mm/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    // Format HH.MM (Penting: pakai titik, bukan titik dua)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}.${minutes}`;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Sedang memuat data...</div>;

  return (
    <div className="overflow-x-auto min-h-[300px]">
      <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Bisnis</th>
            <th className="px-4 py-3 text-left font-semibold">Tipe</th> 
            <th className="px-4 py-3 text-left font-semibold">Paket</th>
            <th className="px-4 py-3 text-left font-semibold">Pemilik</th>
            <th className="px-4 py-3 text-left font-semibold">Mulai</th>
            <th className="px-4 py-3 text-left font-semibold">Berakhir</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-medium text-gray-800">
                {row.bisnis}
                <div className="text-xs text-gray-400 font-normal">{row.email}</div>
              </td>
              <td className="px-4 py-3 text-gray-1000 capitalize">{row.tipe_bisnis}</td>
              <td className="px-4 py-3">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs font-bold">
                  {row.paket}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{row.nama}</td>
              
              {/* Gunakan formatDate baru */}
              <td className="px-4 py-3 text-gray-1000 whitespace-nowrap">{formatDate(row.mulai)}</td>
              <td className="px-4 py-3 text-gray-1000 whitespace-nowrap">{formatDate(row.berakhir)}</td>
              
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    row.status === "Aktif"
                      ? "bg-green-100 text-green-700"
                      : row.status === "Akan Berakhir"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => onEdit(row)} className="text-blue-500 hover:text-blue-700 transition" title="Ubah Status">
                  <FaEdit size={16} />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={8} className="text-center py-6 text-gray-400 italic">Tidak ada data pengguna ditemukan.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;