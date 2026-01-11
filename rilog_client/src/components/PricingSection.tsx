"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Check } from "lucide-react";

export default function PricingSection() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toggle state: 'monthly' atau 'yearly'
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // 1. FETCH DATA
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        const response = await axios.get(`${apiUrl}/api/sub-plans`);
        
        // Asumsi response backend: { data: [...] } atau [...]
        const rawData = response.data.data || response.data;
        setPlans(Array.isArray(rawData) ? rawData : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat paket.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  // --- LOGIC FILTERING SEDERHANA & KUAT ---
  // Kita filter langsung dari data master 'plans'.
  // Pastikan di database tipe ditulis: 'MONTHLY', 'YEARLY', 'PROMO', dll.
  const filteredPlans = plans.filter((plan) => {
    // Ubah ke uppercase biar aman (jika di db 'Monthly' atau 'MONTHLY')
    const tipeDB = plan.tipe ? plan.tipe.toUpperCase() : "";
    
    if (billingCycle === "monthly") {
      return tipeDB === "MONTHLY";
    } else {
      return tipeDB === "YEARLY";
    }
  });

  // Urutkan paket berdasarkan harga (opsional, biar rapi dari termurah)
  const sortedPlans = [...filteredPlans].sort((a, b) => a.harga - b.harga);

  return (
    <section id="pricing" className="py-20 bg-white font-sans">
      <div className="container mx-auto px-6">

        {/* TITLE */}
        <h2 className="text-center text-3xl font-bold mb-12" data-aos="fade-up">
          Pilih Paket <span className="text-yellow-500">Langganan</span>
        </h2>

        {/* TOGGLE SWITCH */}
        <div className="flex justify-center mb-16" data-aos="fade-up">
          <div className="flex items-center border border-gray-300 rounded-full px-2 py-1 shadow-sm gap-1 bg-white">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === "monthly" ? "bg-[#F7C98B] text-black" : "text-gray-500"
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === "yearly" ? "bg-[#F7C98B] text-black" : "text-gray-500"
              }`}
            >
              Tahunan <span className="text-xs text-green-600 font-bold ml-1">Hemat 15%</span>
            </button>
          </div>
        </div>

        {/* CONTENT LOADING / ERROR */}
        {loading && (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
            </div>
        )}
        
        {error && <div className="text-center text-red-500">{error}</div>}

        {/* GRID PAKET */}
        {!loading && !error && (
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-16 flex-wrap">
            
            {sortedPlans.length > 0 ? (
              sortedPlans.map((plan, i) => {
                // Cek apakah paket populer (misal ada kata 'Pro' atau 'Gold')
                const isPopular = plan.nama_paket.toLowerCase().includes("pro") || plan.nama_paket.toLowerCase().includes("gold");
                
                // Ubah nama Enterprise -> Unlimited (opsional, sesuai request Anda tadi)
                let displayName = plan.nama_paket;
                if (displayName.toLowerCase() === "enterprise") displayName = "Unlimited";

                return (
                  <div
                    key={plan.id}
                    className={`bg-white border ${
                      isPopular 
                        ? "border-2 border-yellow-500 shadow-xl scale-105 z-10" 
                        : "border-gray-200 shadow hover:shadow-lg"
                    } rounded-2xl p-8 w-full md:w-80 flex flex-col relative transition duration-300`}
                    data-aos="fade-up"
                    data-aos-delay={100 * (i + 1)}
                  >
                    {isPopular && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-sm font-semibold rounded-full shadow">
                        Paling Populer
                      </span>
                    )}

                    <h3 className="font-semibold text-[22px] text-center mt-2">{displayName}</h3>

                    <div className="flex flex-col items-center mt-4 border-b border-gray-100 pb-6">
                      <p className="text-[28px] font-bold text-black">
                        {formatRupiah(plan.harga)}
                      </p>
                      <span className="text-xs text-gray-500 mt-1">
                        /{billingCycle === "monthly" ? "bulan" : "tahun"}
                      </span>
                      <p className="text-gray-600 text-[14px] mt-4 text-center min-h-[40px] px-2 leading-relaxed">
                        {plan.deskripsi || "Akses penuh ke semua fitur RILOG."}
                      </p>
                    </div>

                    <Link href="/login" className="w-full">
                      <button
                        className={`mt-8 w-full py-2 rounded-md font-bold text-[14px] border border-yellow-500 ${
                          isPopular
                            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                            : "bg-white hover:bg-yellow-50 text-black"
                        } transition`}
                      >
                        Mulai Sekarang
                      </button>
                    </Link>

                    {/* Fitur List */}
                    <ul className="mt-6 space-y-3 text-sm text-gray-700">
                      {/* GUDANG */}
                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" />
                        </span>
                        <span>
                          {plan.limit_gudang >= 1000000 ? "Unlimited" : plan.limit_gudang} <strong>Gudang</strong>
                        </span>
                      </li>

                      {/* STAFF */}
                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" />
                        </span>
                        <span>
                          {plan.limit_staff >= 1000000 ? "Unlimited" : plan.limit_staff} <strong>Staff</strong>
                        </span>
                      </li>

                      {/* SUPPORT */}
                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" />
                        </span>
                        <span>Support {isPopular ? "Prioritas 24/7" : "Standard"}</span>
                      </li>
                    </ul>
                  </div>
                );
              })
            ) : (
               // Tampilan jika data kosong di kategori tersebut
               <div className="text-center py-10 w-full bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">Belum ada paket {billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'} tersedia saat ini.</p>
               </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}