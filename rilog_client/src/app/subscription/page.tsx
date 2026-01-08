"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function SubscriptionPage() {
  const router = useRouter();

  // ======= STATE =======
  const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Pro" | "Enterprise">("Basic");
  const [duration, setDuration] = useState<"1 Bulan" | "1 Tahun">("1 Bulan");
  const [price, setPrice] = useState(0);

  // ======= DATA PAKET =======
  const packages = {
    Basic: { monthly: 26000, yearly: 265000 },
    Pro: { monthly: 65000, yearly: 663000 },
    Enterprise: { monthly: 182000, yearly: 1856000 },
  };

  // ======= Fungsi simpan ke localStorage =======
  const handleSelectPlan = (plan: "Basic" | "Pro" | "Enterprise", period: "per bulan" | "per tahun") => {
    localStorage.setItem("selectedPlan", plan);
    localStorage.setItem("selectedPeriod", period);

    const harga = period === "per bulan" ? packages[plan].monthly : packages[plan].yearly;
    localStorage.setItem("selectedPrice", harga.toString());

    // update state UI
    setSelectedPlan(plan);
    setDuration(period === "per bulan" ? "1 Bulan" : "1 Tahun");
    setPrice(harga);
  };

  // ======= Ambil data dari localStorage saat load =======
  useEffect(() => {
    const plan = (localStorage.getItem("selectedPlan") as "Basic" | "Pro" | "Enterprise") || "Basic";
    const period = (localStorage.getItem("selectedPeriod") as "per bulan" | "per tahun") || "per bulan";

    handleSelectPlan(plan, period);
  }, []);

  // === STEP INDICATOR ===
  const activeStep = 1;
  const steps = [
    { id: 1, label: "Pilih Paket" },
    { id: 2, label: "Detail Pelanggan" },
    { id: 3, label: "Metode Pembayaran" },
    { id: 4, label: "Konfirmasi" },
    { id: 5, label: "Status" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-6 py-10">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-xl rounded-2xl overflow-hidden bg-white">

        {/* LEFT SIDE */}
        <div className="hidden md:flex relative w-1/2 bg-[#FEF8EE] p-8">
          <div className="absolute top-5 left-5 flex items-center gap-3">
            <button onClick={() => router.back()} className="text-black hover:text-black transition">
              <FaArrowLeft size={22} />
            </button>
            <img src="/logo.png" alt="RILOG Logo" className="w-20" />
          </div>
          <div className="m-auto max-w-sm text-center">
            <Image src="/subcription.svg" alt="Subscription Illustration" width={240} height={240} className="mx-auto mb-6"/>
            <h1 className="text-xl font-semibold mb-2">Konfirmasi Langganan</h1>
            <p className="text-gray-700 mt-1 text-sm max-w-xs mx-auto">
              Pilih paket langganan sesuai kebutuhan bisnismu.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-start w-full md:w-1/2 px-10 py-12 bg-white">

          {/* STEP INDICATOR */}
          <div className="mb-10">
            <div className="flex items-center w-full">
              {steps.map((s, index) => {
                const isActive = s.id === activeStep;
                const isCompleted = s.id < activeStep;
                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[8px] font-semibold ${isActive || isCompleted ? "bg-yellow-500 text-white" : "bg-white border border-gray-300 text-gray-400"}`}>
                        {isCompleted ? "✓" : s.id}
                      </div>
                      <span className={`text-[8px] mt-1 whitespace-nowrap text-center ${isActive ? "text-yellow-600 font-semibold" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                        {s.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-[2px] w-5 mx-2 self-center ${isCompleted ? "bg-yellow-500" : "bg-gray-300"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TITLE */}
          <h1 className="text-xl font-bold mb-6 text-center">
            Pilih <span className="text-yellow-500">Paket Langganan</span>
          </h1>

          {/* PAKET DYNAMIC */}
          <div className="border rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold mb-2">Paket {selectedPlan} RILOG</h2>
            <hr className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 font-medium">Durasi</div>
                <select
                  value={duration}
                  onChange={(e) =>
                    handleSelectPlan(
                      selectedPlan,
                      e.target.value === "1 Bulan" ? "per bulan" : "per tahun"
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>1 Bulan</option>
                  <option>1 Tahun</option>
                </select>
              </div>
              <div className="text-right font-semibold text-lg">
                Rp {price.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* DAFTAR PESANAN */}
          <div className="border rounded-xl p-5 shadow-sm mb-6">
            <h2 className="font-semibold mb-2">Daftar Pesanan</h2>
            <hr className="mb-4" />
            <div className="flex justify-between text-sm">
              <span>Paket {selectedPlan}</span>
              <span>Rp {price.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Durasi</span>
              <span>{duration}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Pajak</span>
              <span>-</span>
            </div>
          </div>

          {/* SUBTOTAL */}
          <div className="flex justify-between mb-5 font-semibold">
            <span>Sub Total</span>
            <span>Rp {price.toLocaleString("id-ID")}</span>
          </div>

          {/* NEXT BUTTON */}
          <button 
            onClick={() => router.push("/subscription/detail")}
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded-lg font-semibold"
          >
            Next
          </button>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Ingin ubah paket?{" "}
            <Link href="/pricing" className="text-yellow-500 font-semibold hover:underline">
              Kembali ke Harga
            </Link>
          </p>

        </div>
      </div>
    </section>
  );
}
