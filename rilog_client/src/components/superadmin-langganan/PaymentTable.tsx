import React from "react";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";

interface PaymentTableProps {
  data: any[];
  loading: boolean;
  onViewBukti: (url: string) => void;
  onVerify: (id: number, action: 'approve' | 'reject', namaBisnis: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ data, loading, onViewBukti, onVerify }) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // Format tanggal Indonesia
    return date.toLocaleDateString("id-ID", {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  const formatRupiah = (number: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Sedang memuat data...</div>;

  return (
    <div className="overflow-x-auto min-h-[300px] bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">Info Bisnis</th>
            <th className="px-6 py-3 text-left font-semibold">Info Pengirim</th>
            <th className="px-6 py-3 text-left font-semibold">Paket</th>
            <th className="px-6 py-3 text-left font-semibold">Jumlah</th>
            <th className="px-6 py-3 text-center font-semibold">Bukti</th>
            <th className="px-6 py-3 text-center font-semibold">Status</th>
            <th className="px-6 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {/* Kolom Info Bisnis */}
              <td className="px-6 py-4">
                <div className="font-bold text-gray-800">{row.bisnis}</div>
                <div className="text-xs text-gray-500 mt-1">Owner: {row.pemilik}</div>
                <div className="text-xs text-gray-400">{row.email}</div>
              </td>

              {/* Kolom Info Pengirim */}
              <td className="px-6 py-4">
                <div className="font-medium text-gray-800">{row.pengirim}</div>
                <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded w-fit mt-1 inline-block border border-gray-200">
                  {row.bank}
                </div>
                <div className="text-xs text-gray-400 mt-1 block">{formatDate(row.tanggal)}</div>
              </td>

              {/* Kolom Paket */}
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold border
                    ${row.paket === 'Basic' ? 'bg-gray-50 text-gray-600 border-gray-200' : ''}
                    ${row.paket === 'Pro' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                    ${row.paket === 'Enterprise' ? 'bg-purple-50 text-purple-600 border-purple-200' : ''}
                `}>
                  {row.paket}
                </span>
              </td>

              {/* Kolom Jumlah */}
              <td className="px-6 py-4 font-bold text-gray-700">
                {formatRupiah(row.jumlah)}
              </td>

              {/* Kolom Bukti */}
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onViewBukti(row.bukti ? `${process.env.NEXT_PUBLIC_API_URL}${row.bukti}` : "")}
                  className="text-blue-500 hover:text-blue-700 flex flex-col items-center gap-1 text-xs font-medium mx-auto"
                >
                  <FaEye size={16} />
                  <span>Lihat</span>
                </button>
              </td>

              {/* Kolom Status */}
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                    row.status === "Terverifikasi"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : row.status === "Ditolak"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                   {row.status === "Terverifikasi" && <FaCheck size={10} />}
                   {row.status === "Ditolak" && <FaTimes size={10} />}
                   {row.status}
                </span>
              </td>

              {/* Kolom Aksi */}
              <td className="px-6 py-4 text-center">
                {row.status === "Belum Terverifikasi" ? (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onVerify(row.id, 'approve', row.bisnis)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md shadow-sm transition-all hover:shadow-md"
                      title="Setujui Pembayaran"
                    >
                      <FaCheck size={14} />
                    </button>
                    <button
                      onClick={() => onVerify(row.id, 'reject', row.bisnis)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow-sm transition-all hover:shadow-md"
                      title="Tolak Pembayaran"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">Selesai</span>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={7} className="text-center py-10 text-gray-400 italic">Tidak ada data transaksi ditemukan.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;