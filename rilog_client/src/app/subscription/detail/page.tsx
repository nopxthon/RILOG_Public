"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";

interface SubscriptionForm {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

export default function SubscriptionDetailPage() {
  const router = useRouter();

  // ======== BACA DARI STORAGE ========
  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const [duration, setDuration] = useState("1 Bulan");
  const [price, setPrice] = useState(0);

  const packages = {
    Basic: { monthly: 26000, yearly: 265000 },
    Pro: { monthly: 65000, yearly: 663000 },
    Enterprise: { monthly: 182000, yearly: 1856000 },
  };

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

  // ======== FORM STATES ========
  const [formData, setFormData] = useState<SubscriptionForm>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("customerData", JSON.stringify(formData));
    router.push("/subscription/payment");
  };

  // ======== STEP INDICATOR ========
  const activeStep = 2;
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
            <button onClick={() => router.back()}>
              <FaArrowLeft size={22} />
            </button>
            <img src="/logo.png" alt="RILOG Logo" className="w-20" />
          </div>

          <div className="m-auto max-w-sm text-center">
            <Image
              src="/subcription.svg"
              alt="Subscription Illustration"
              width={260}
              height={260}
              className="mx-auto mb-6"
            />
            <h1 className="text-xl font-semibold mb-2">Konfirmasi Langganan</h1>
            <p className="text-3xl font-bold text-yellow-600">
              Rp {price.toLocaleString("id-ID")}
            </p>
            <p className="text-gray-700 mt-1">{duration}</p>
            <p className="text-sm text-gray-600 mt-5 leading-relaxed">
              Pastikan data langganan Anda sudah benar sebelum melanjutkan.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-10 py-12 bg-white">

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

          {/* FORM */}
          <h1 className="text-xl font-bold mb-6 text-center">
            Lengkapi <span className="text-yellow-500">Detail Langganan</span>
          </h1>

          <form onSubmit={handleNext} className="space-y-5">

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kota/Kabupaten</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kode Pos</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Nomor HP</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Alamat Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-semibold transition"
            >
              Next
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
