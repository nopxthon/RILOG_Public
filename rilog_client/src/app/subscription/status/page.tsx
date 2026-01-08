"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const packages = {
  Basic: { monthly: 26000, yearly: 265000 },
  Pro: { monthly: 65000, yearly: 663000 },
  Enterprise: { monthly: 182000, yearly: 1856000 },
};

const StatusPage: FC = () => {
  const router = useRouter();
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState("1 Bulan");
  const [selectedPlan, setSelectedPlan] = useState("Basic");

  useEffect(() => {
    const plan = localStorage.getItem("selectedPlan") || "Basic";
    const period = localStorage.getItem("selectedPeriod") || "per bulan";

    setSelectedPlan(plan);

    if (period === "per bulan") {
      setDuration("1 Bulan");
      setPrice(packages[plan].monthly);
    } else {
      setDuration("1 Tahun");
      setPrice(packages[plan].yearly);
    }
  }, []);

  const activeStep = 5;
  const steps = [
    { id: 1, label: "Pilih Paket", route: "/subscription" },
    { id: 2, label: "Detail Pelanggan", route: "/subscription/detail" },
    { id: 3, label: "Metode Pembayaran", route: "/subscription/payment" },
    { id: 4, label: "Konfirmasi", route: "/subscription/confirmation" },
    { id: 5, label: "Status", route: "/subscription/status" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-6 py-10">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-xl rounded-2xl overflow-hidden bg-white">

        {/* LEFT SIDE */}
        <div className="hidden md:flex relative w-1/2 bg-[#FFF7ED] p-8">
          <img
            src="/logo.png"
            alt="RILOG Logo"
            className="w-20 absolute top-5 left-5"
          />

          <div className="m-auto text-center max-w-sm">
            <Image
              src="/subcription.svg"
              alt="Subscription Illustration"
              width={240}
              height={240}
              className="mx-auto mb-6"
            />

            <h1 className="text-xl font-semibold mb-2">Status Langganan</h1>
            <p className="text-3xl font-bold text-yellow-600">
              Rp {price.toLocaleString("id-ID")}
            </p>
            <p className="text-gray-700 mt-1">{duration}</p>

            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Pembayaran kamu sedang diproses.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-10 py-10 bg-white">

          {/* STEP INDICATOR */}
          <div className="mb-10">
            <div className="flex items-center w-full">
              {steps.map((s, index) => {
                const isActive = s.id === activeStep;
                const isCompleted = s.id < activeStep;

                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-semibold ${isActive || isCompleted ? "bg-yellow-500 text-white" : "bg-white border border-gray-300 text-gray-400"}`}>
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

          {/* STATUS CONTENT */}
          <div className="flex flex-col items-center text-center mt-5 max-w-md mx-auto">
            <Image
              src="/hourglass.svg"
              alt="Processing Icon"
              width={110}
              height={110}
              className="mb-6"
            />

            <h2 className="text-lg font-semibold mb-2">Verifikasi Sedang Diproses</h2>

            <p className="text-gray-600 text-sm leading-relaxed">
              Pembayaran kamu sedang kami proses.  
              Verifikasi transaksi biasanya memakan waktu:
              <br />
              <span className="font-semibold text-yellow-600">maksimal 24 jam kerja.</span>
              <br />
              Terima kasih sudah menunggu 🙏
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatusPage;
