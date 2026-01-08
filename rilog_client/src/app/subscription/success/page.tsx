"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const packages = {
  Basic: { monthly: 26000, yearly: 265000 },
  Pro: { monthly: 65000, yearly: 663000 },
  Enterprise: { monthly: 182000, yearly: 1856000 },
};

const SuccessPage: FC = () => {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const [price, setPrice] = useState<number>(0);
  const [period, setPeriod] = useState("per bulan");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    const plan = localStorage.getItem("selectedPlan") || "Basic";
    const per = localStorage.getItem("selectedPeriod") || "per bulan";

    setSelectedPlan(plan);
    setPeriod(per);

    let priceValue = per === "per bulan" ? packages[plan].monthly : packages[plan].yearly;
    setPrice(priceValue);

    // Hitung tanggal expired
    const today = new Date();
    if (per === "per bulan") today.setMonth(today.getMonth() + 1);
    else today.setFullYear(today.getFullYear() + 1);

    setExpiryDate(
      today.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
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
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden bg-white">

        {/* LEFT SIDE */}
        <div className="hidden md:flex relative w-1/2 bg-[#FEF8EE] p-6">
          <img src="/logo.png" alt="RILOG Logo" className="w-24 absolute top-6 left-6" />
          <div className="m-auto max-w-sm text-center">
            <Image
              src="/subcription.svg"
              alt="Subscription Illustration"
              width={250}
              height={250}
              className="mx-auto mb-4"
            />
            <h1 className="text-lg font-semibold mb-1">Konfirmasi Langganan</h1>
            <p className="text-3xl font-bold text-yellow-600">Rp {price.toLocaleString("id-ID")}</p>
            <p className="text-black-700 mt-1">{period}</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 md:px-10 py-12 bg-white">
          <div className="max-w-md mx-auto w-full text-center">

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

            {/* SUCCESS CONTENT */}
            <Image src="/success.svg" alt="Success Icon" width={100} height={100} className="mb-6 mx-auto" />
            <h2 className="text-lg font-semibold mb-2">Pembayaran kamu telah diverifikasi!</h2>
            <p className="text-gray-700 mb-6">
              Selamat! Langganan kamu aktif hingga{" "}
              <span className="font-semibold text-yellow-600">{expiryDate}</span>
            </p>

            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessPage;
