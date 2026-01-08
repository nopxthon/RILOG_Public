"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Check, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2"; // ✅ Pastikan sudah install sweetalert2

export default function PricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ State tambahan untuk logic downgrade
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Toggle state: 'monthly' (Bulanan) atau 'yearly' (Tahunan)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // 1. AMBIL DATA (Paket & User Subscription)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        // A. Ambil Daftar Paket
        const response = await axios.get("http://localhost:5000/api/sub-plans");
        const rawData = response.data.data || response.data;
        setPlans(Array.isArray(rawData) ? rawData : []);

        // B. Ambil Data Paket User Saat Ini (Jika Login)
        if (token) {
          try {
            const myBisnisRes = await axios.get("http://localhost:5000/api/payment/my-subscription", {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (myBisnisRes.data?.data?.Sub_plan) {
              setCurrentSubscription(myBisnisRes.data.data.Sub_plan);
            }
          } catch (subErr) {
            console.warn("Gagal mengambil subscription user (mungkin user baru/belum bayar):", subErr);
          }
        }

      } catch (err) {
        console.error(err);
        setError("Gagal memuat data paket.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  // 2. FILTER DATA
  const filteredPlans = plans.filter((plan) => {
    const tipeDB = plan.tipe ? plan.tipe.toUpperCase() : "";
    if (billingCycle === "monthly") {
      return tipeDB === "MONTHLY";
    } else {
      return tipeDB === "YEARLY";
    }
  });

  // Urutkan paket
  const sortedPlans = [...filteredPlans].sort((a, b) => a.harga - b.harga);

  // 🔥 FUNGSI UTAMA: Handle Klik Paket (Dengan Cek Downgrade)
  const handleSelectPlan = (selectedPlan: any) => {
    // 1. Cek Login
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const proceedToPayment = () => {
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
      router.push("/subscription/payment");
    };

    // 2. Cek Downgrade Logic
    if (currentSubscription) {
      const curGudang = Number(currentSubscription.limit_gudang) || 0;
      const curStaff = Number(currentSubscription.limit_staff) || 0;
      
      const newGudang = Number(selectedPlan.limit_gudang) || 0;
      const newStaff = Number(selectedPlan.limit_staff) || 0;

      // ✅ Helper Function: Ubah angka besar jadi "Unlimited"
      // Angka 1000 diambil sebagai batas aman (sesuai logic UI sebelumnya)
      const fmt = (num: number) => num >= 1000 ? "Unlimited" : num;

      // Logic Downgrade
      const isDowngrade = newGudang < curGudang || newStaff < curStaff;

      if (isDowngrade) {
        Swal.fire({
            title: 'Perhatian: Downgrade Paket',
            html: `
                <div class="text-left text-sm text-gray-600">
                    <p class="mb-3">Anda memilih paket yang lebih rendah dari paket aktif saat ini.</p>
                    <ul class="list-disc pl-5 mb-4 text-red-600 font-medium bg-red-50 p-3 rounded-md">
                        ${newGudang < curGudang 
                            ? `<li>Kuota Gudang: <b>${fmt(curGudang)}</b> ➝ <b>${fmt(newGudang)}</b></li>` 
                            : ''
                        }
                        ${newStaff < curStaff 
                            ? `<li>Kuota Staff: <b>${fmt(curStaff)}</b> ➝ <b>${fmt(newStaff)}</b></li>` 
                            : ''
                        }
                    </ul>
                    <p class="font-bold text-gray-800">Konsekuensi:</p>
                    <p>Setelah pembayaran dikonfirmasi, sistem akan melakukan <b>Reset Otomatis</b>. Semua gudang & staff akan dinonaktifkan sementara.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EAB308',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Saya Paham',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                proceedToPayment();
            }
        });
        return; 
      }
    }

    proceedToPayment();
  };

  return (
    <section id="pricing" className="min-h-screen py-10 bg-white font-sans text-gray-900">
      {/* 👇 TAMBAHKAN SUPPRESS HYDRATION WARNING DI SINI 👇 */}
      <div 
        className="container mx-auto px-6"
        suppressHydrationWarning={true}
      >

        {/* --- TOMBOL KEMBALI KE DASHBOARD --- */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali ke Dashboard
          </Link>
        </div>

        {/* JUDUL */}
        <h2 className="text-center text-3xl font-bold mb-12" data-aos="fade-up">
          Pilih Paket <span className="text-yellow-500">Langganan</span>
        </h2>

        {/* TOGGLE SWITCH */}
        <div className="flex justify-center mb-16" data-aos="fade-up">
          <div className="flex items-center border border-gray-300 rounded-full px-2 py-1 shadow-sm gap-1 bg-white">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${billingCycle === "monthly"
                  ? "bg-[#F7C98B] text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${billingCycle === "yearly"
                  ? "bg-[#F7C98B] text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Tahunan <span className="text-[10px] text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded-full ml-1">Hemat 15%</span>
            </button>
          </div>
        </div>

        {/* LOADING & ERROR */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg border border-red-200">{error}</p>
          </div>
        )}

        {/* GRID PAKET */}
        {!loading && !error && (
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-16 flex-wrap items-stretch">
            {sortedPlans.length > 0 ? (
              sortedPlans.map((plan, i) => {
                const isPopular = plan.nama_paket.toLowerCase().includes("pro");
                let displayName = plan.nama_paket;
                if (displayName.toLowerCase() === "enterprise") displayName = "Unlimited";
                
                // Cek apakah ini paket aktif user
                const isCurrentPlan = currentSubscription?.id === plan.id;

                return (
                  <div key={plan.id} className={`bg-white border ${isPopular ? "border-2 border-yellow-500 shadow-xl scale-105 z-10" : "border-gray-200 shadow hover:shadow-lg"} ${isCurrentPlan ? "ring-4 ring-green-100" : ""} rounded-2xl p-8 w-full md:w-80 flex flex-col relative transition duration-300`} data-aos="fade-up" data-aos-delay={100 * (i + 1)}>
                    {isPopular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-sm font-semibold rounded-full shadow">Paling Populer</span>}
                    
                    {isCurrentPlan && (
                       <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                         Aktif
                       </span>
                    )}

                    <h3 className="font-semibold text-[22px] text-center mt-2 capitalize">{displayName}</h3>

                    <div className="flex flex-col items-center mt-4 border-b border-gray-100 pb-6 mb-6">
                      <p className="text-[28px] font-bold text-black">{formatRupiah(plan.harga)}</p>
                      <span className="text-xs text-gray-500 mt-1">/{billingCycle === "monthly" ? "bulan" : "tahun"}</span>
                      <p className="text-gray-600 text-[14px] mt-4 text-center min-h-[40px] px-2 leading-relaxed italic">"{plan.deskripsi || "Akses penuh ke semua fitur RILOG."}"</p>
                    </div>

                    {/* 🔥 UPDATE BUTTON: Panggil handleSelectPlan */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-lg font-bold text-[14px] border border-yellow-500 ${isPopular ? "bg-yellow-500 hover:bg-yellow-600 text-black shadow-md" : "bg-white hover:bg-yellow-50 text-black"} transition`}
                    >
                      {isCurrentPlan ? "Perpanjang Paket" : "Mulai Sekarang"}
                    </button>

                    <ul className="mt-6 space-y-3 text-sm text-gray-700 flex-1">
                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                        </span>
                        <span>
                          {plan.limit_gudang >= 1000 ? "Unlimited" : plan.limit_gudang} <strong>Gudang</strong>
                        </span>
                      </li>

                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                        </span>
                        <span>
                          {plan.limit_staff >= 1000 ? "Unlimited" : plan.limit_staff} <strong>Staff Akun</strong>
                        </span>
                      </li>
                      
                      {/* ... Sisa list fitur ... */}
                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                        </span>
                        <span>
                          Support {isPopular ? "Prioritas 24/7" : "Standard"}
                        </span>
                      </li>

                      <li className="flex items-center">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-green-500 mr-2">
                          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                        </span>
                        <span>Akses Semua Fitur</span>
                      </li>
                    </ul>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 w-full max-w-2xl bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-auto">
                <p className="text-gray-500 font-medium">
                  Belum ada paket {billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'} yang tersedia saat ini.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}