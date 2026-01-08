// src/components/superadmin/langganan/LogTable.tsx
import React from "react";

interface LogTableProps {
  data: any[];
  loading: boolean;
}

const LogTable: React.FC<LogTableProps> = ({ data, loading }) => {
  if (loading) return <div className="text-center py-10 text-gray-500">Sedang memuat data...</div>;

  return (
    <div className="overflow-x-auto min-h-[300px]">
      <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Waktu</th>
            <th className="px-4 py-3 text-left font-semibold">Nama</th>
            <th className="px-4 py-3 text-left font-semibold">Role</th>
            <th className="px-4 py-3 text-left font-semibold">Aktivitas</th>
            <th className="px-4 py-3 text-left font-semibold">Detail</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 text-gray-700">
                {new Date(row.waktu).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-700">{row.nama}</td>
              <td className="px-4 py-3 text-gray-700">{row.role}</td>
              <td className="px-4 py-3 text-gray-700">{row.aktivitas}</td>
              <td className="px-4 py-3 text-blue-500 cursor-pointer hover:underline">
                {row.detail}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4">Tidak ada log aktivitas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;