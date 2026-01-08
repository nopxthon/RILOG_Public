// src/components/TabelLaporan.tsx
import { FaFileExport } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";

type LaporanItem = {
  nama: string;
  stok: number;
  masuk: number;
  keluar: number;
};

interface TabelLaporanProps {
  data: LaporanItem[];
}

const TabelLaporan: React.FC<TabelLaporanProps> = ({ data }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Daftar Inventaris</h2>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">Nama Barang</th>
              <th className="p-3 text-center">Stok</th>
              <th className="p-3 text-center">Stok Masuk</th>
              <th className="p-3 text-center">Stok Keluar</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={item.nama} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-3">{item.nama}</td>
                <td className="p-3 text-center">{item.stok}</td>
                <td className="p-3 text-center text-green-600">{item.masuk}</td>
                <td className="p-3 text-center text-red-600">{item.keluar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TabelLaporan;