"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
  FaTimes, FaArrowUp, FaArrowDown, FaMinus, FaExclamationTriangle, 
  FaCheckCircle, FaShoppingCart, FaSkull, FaClock, FaTrophy, FaBoxOpen
} from "react-icons/fa";

type DataGrafik = {
  periode: string;
} & Record<string, number | string>;

interface Props {
  data?: DataGrafik[];
  meta?: Record<string, { min: number; max: number; lastActivity?: string }>;
}

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const GrafikTrenStok: React.FC<Props> = ({ data = [], meta = {} }) => {
  
  const availableProducts = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== "periode");
  }, [data]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    // Default to show top 5 items
    setSelectedItems(availableProducts.slice(0, 5));
  }, [availableProducts]);

  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(prev => prev.filter(i => i !== item));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const analisisLengkap = useMemo(() => {
    if (data.length < 2) return [];

    const dataTerbaru = data[data.length - 1]; 
    const durasiHari = data.length;

    const statsProduk = availableProducts.map(produk => {
      let totalTerjual = 0;
      for (let i = 1; i < durasiHari; i++) {
        const stokKemarin = Number(data[i-1][produk] || 0);
        const stokHariIni = Number(data[i][produk] || 0);
        if (stokHariIni < stokKemarin) {
          totalTerjual += (stokKemarin - stokHariIni);
        }
      }
      return {
        produk,
        totalTerjual,
        stokSekarang: Number(dataTerbaru[produk] || 0),
        rataRataJual: totalTerjual / durasiHari
      };
    });

    const sortedStats = [...statsProduk].sort((a, b) => b.totalTerjual - a.totalTerjual);
    const totalSemuaPenjualan = sortedStats.reduce((acc, curr) => acc + curr.totalTerjual, 0);

    return statsProduk.map(stat => {
      const { produk, stokSekarang, rataRataJual, totalTerjual } = stat;
      
      // ✅ FIX: Calculate hariTanpaTransaksi HERE
      const lastActivityDate = meta[produk]?.lastActivity ? new Date(meta[produk].lastActivity!) : new Date();
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastActivityDate.getTime());
      const hariTanpaTransaksi = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      // --- LOGIKA ABC ---
      const rankIndex = sortedStats.findIndex(s => s.produk === produk);
      const percentile = (rankIndex + 1) / sortedStats.length;
      let kelasABC = "C";
      let badgeABC = "bg-gray-100 text-gray-600";
      
      if (totalSemuaPenjualan > 0) {
          if (percentile <= 0.2 || (rankIndex === 0 && totalTerjual > 0)) {
            kelasABC = "A (Fast)"; badgeABC = "bg-purple-100 text-purple-700 border-purple-200";
          } else if (percentile <= 0.5) {
            kelasABC = "B (Med)"; badgeABC = "bg-blue-50 text-blue-600 border-blue-100";
          } else {
            kelasABC = "C (Slow)"; badgeABC = "bg-gray-50 text-gray-500 border-gray-100";
          }
      }

      // --- LOGIKA STATUS ---
      const minStok = meta[produk]?.min ?? 10;
      const maxStok = meta[produk]?.max ?? 100;

      let status = "Aman";
      let pesan = "Kondisi stok normal.";
      let warnaBadge = "bg-green-100 text-green-700 border-green-200";
      let icon = <FaCheckCircle />;
      let prediksiHari = "∞";

      if (rataRataJual > 0) {
        const hari = Math.floor(stokSekarang / rataRataJual);
        prediksiHari = `${hari} Hari`;
      }

      if (stokSekarang <= 0) {
        status = "Habis";
        pesan = "Stok 0. Segera lakukan restok!";
        warnaBadge = "bg-gray-800 text-white border-gray-600";
        icon = <FaExclamationTriangle />;
      }
      // ✅ Now this variable is defined above
      else if (hariTanpaTransaksi > 30 && totalTerjual === 0) {
        status = "Dead Stock";
        pesan = `Tidak ada penjualan > 1 Bulan (${hariTanpaTransaksi} hari). Evaluasi item ini.`;
        warnaBadge = "bg-gray-200 text-gray-700 border-gray-400";
        icon = <FaSkull />;
      }
      else if (totalTerjual === 0) {
        status = "Stok Pasif"; 
        pesan = `Belum ada penjualan dalam ${hariTanpaTransaksi} hari terakhir.`;
        warnaBadge = "bg-blue-50 text-blue-600 border-blue-200";
        icon = <FaBoxOpen />;
      }
      else if (rataRataJual > 0 && (stokSekarang / rataRataJual) <= 3) {
        status = "Kritis";
        pesan = `Habis dalam ${prediksiHari}! Restock segera.`;
        warnaBadge = "bg-red-100 text-red-700 border-red-200";
        icon = <FaClock />;
      }
      else if (stokSekarang <= minStok) {
        status = "Menipis";
        pesan = `Di bawah batas minimal (${minStok}).`;
        warnaBadge = "bg-orange-100 text-orange-700 border-orange-200";
        icon = <FaShoppingCart />;
      }
      else if (stokSekarang > maxStok) {
        status = "Berlebih";
        pesan = "Overstock. Tahan pembelian.";
        warnaBadge = "bg-blue-100 text-blue-700 border-blue-200";
        icon = <FaMinus />;
      }

      return {
        produk,
        stokSekarang,
        rataRataJual: rataRataJual.toFixed(1),
        prediksiHari,
        kelasABC,
        badgeABC,
        status,
        pesan,
        warnaBadge,
        icon
      };
    });
  }, [data, availableProducts, meta]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="mb-4 flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div><h2 className="text-lg font-bold text-gray-800">Analisis Tren & Pergerakan</h2><p className="text-sm text-gray-500">Visualisasi data historis</p></div>
          <div className="text-xs text-gray-400 italic">*Klik nama produk untuk filter grafik (Tabel tetap menampilkan semua)</div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6 max-h-32 overflow-y-auto">
          {availableProducts.map((item) => {
            const isSelected = selectedItems.includes(item); const color = stringToColor(item);
            return (
              <button key={item} onClick={() => toggleItem(item)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected ? "bg-white text-gray-800 border-gray-300 shadow-sm ring-1 ring-transparent" : "bg-gray-100 text-gray-400 border-transparent opacity-60"}`} style={isSelected ? { borderColor: color, color: '#374151' } : {}}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isSelected ? color : '#9CA3AF' }} /> {item} {isSelected && <FaTimes className="ml-1 text-[10px] text-gray-400 hover:text-red-500" />}
              </button>
            );
          })}
        </div>

        <div className="h-[350px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="periode" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                {selectedItems.map((key) => (<Line key={key} type="monotone" dataKey={key} stroke={stringToColor(key)} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} animationDuration={1000} />))}
              </LineChart>
            </ResponsiveContainer>
          ) : (<div className="h-full flex items-center justify-center text-gray-400 flex-col"><p>Belum ada data transaksi.</p></div>)}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div><h3 className="text-md font-bold text-gray-800 flex items-center gap-2"><FaTrophy className="text-yellow-500" /> Analisis Cerdas (DSS)</h3><p className="text-xs text-gray-500">Prediksi, Pareto (ABC), dan Status Stok</p></div>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-white text-gray-600 border-b sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left font-semibold bg-gray-50">Produk</th>
                <th className="px-6 py-3 text-center font-semibold bg-gray-50">Kelas ABC</th>
                <th className="px-6 py-3 text-center font-semibold bg-gray-50">Sisa Stok</th>
                <th className="px-6 py-3 text-center font-semibold bg-gray-50">Est. Habis</th>
                <th className="px-6 py-3 text-left font-semibold bg-gray-50">Rekomendasi</th>
                <th className="px-6 py-3 text-center font-semibold bg-gray-50">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analisisLengkap.length > 0 ? (
                analisisLengkap.map((item) => (
                  <tr key={item.produk} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.produk}</td>
                    <td className="px-6 py-4 text-center"><span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${item.badgeABC}`}>{item.kelasABC}</span></td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{item.stokSekarang}<div className="text-[10px] text-gray-400 font-normal">Avg: {item.rataRataJual}/hari</div></td>
                    <td className="px-6 py-4 text-center"><div className={`font-medium ${item.prediksiHari.includes('Hari') && parseInt(item.prediksiHari) <= 3 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{item.prediksiHari}</div></td>
                    <td className="px-6 py-4 text-gray-600 text-xs md:text-sm">{item.pesan}</td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${item.warnaBadge}`}>{item.icon} {item.status}</span></td>
                  </tr>
                ))
              ) : (<tr><td colSpan={6} className="text-center py-8 text-gray-400 italic">Data belum cukup.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GrafikTrenStok;