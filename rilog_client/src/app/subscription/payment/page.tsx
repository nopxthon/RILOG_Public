"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { ArrowRight, Copy, ArrowLeft } from "lucide-react";

export default function PaymentInstructionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    const storedPlan = localStorage.getItem("selectedPlan");
    if (storedPlan) {
      setSelectedPlan(JSON.parse(storedPlan));
    } else {
      router.push("/dashboard"); 
    }
  }, [router]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  if (!selectedPlan) return <div className="p-10 text-center">Memuat data...</div>;

  const durasiLabel = selectedPlan.tipe?.toUpperCase() === "MONTHLY" ? "1 Bulan" : "1 Tahun";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full">
        
        {/* TOMBOL KEMBALI */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-500 hover:text-yellow-600 transition mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Pilih Paket Lain
        </button>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
          <div>
            <h2 className="text-center text-2xl font-extrabold text-gray-900">Instruksi Pembayaran</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Silakan transfer sesuai nominal di bawah ini.
            </p>
          </div>

          {/* Detail Tagihan */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Paket:</span>
              <span className="font-semibold">{selectedPlan.nama_paket}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Durasi:</span>
              <span className="font-semibold">{durasiLabel}</span>
            </div>
            <div className="border-t border-yellow-200 my-2 pt-2 flex justify-between items-center">
              <span className="text-gray-800 font-bold">Total Bayar:</span>
              <span className="text-xl font-extrabold text-yellow-600">{formatRupiah(selectedPlan.harga)}</span>
            </div>
          </div>

          {/* Info Rekening Developer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Transfer ke:</h3>
            
            
            {/* <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="w-14 h-8 relative flex items-center justify-center">
                    
                    <Image 
                        src="/bca.png" 
                        alt="Logo BCA"
                        fill
                        className="object-contain"
                    />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">123-456-7890</p>
                  <p className="text-xs text-gray-500">a.n. PT RILOG INDONESIA</p>
                </div>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText("1234567890")}
                className="text-gray-400 hover:text-yellow-500 transition p-2"
                title="Salin No Rek"
              >
                <Copy size={20} />
              </button>
            </div> */}

            {/* --- BANK BNI --- */}
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="w-14 h-8 relative flex items-center justify-center">
                    {/* 🔥 UPDATE PATH: Langsung nama file di root public */}
                    <Image 
                        src="/bni.png" 
                        alt="Logo BNI"
                        fill
                        className="object-contain"
                    />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">1785137036</p>
                  <p className="text-sm text-gray-800">a.n. NAUFAL RADITHYA</p>
                </div>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText("0987654321")}
                className="text-gray-400 hover:text-yellow-500 transition p-2"
                title="Salin No Rek"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push("/subscription/confirmation")}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-md transition-all"
          >
            Saya Sudah Bayar <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}