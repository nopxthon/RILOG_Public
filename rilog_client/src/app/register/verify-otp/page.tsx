"use client";

import {
  FC,
  useState,
  useRef,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

const STORAGE_KEY = "registerData";

const VerifyOtpPage: FC = () => {
  const router = useRouter();
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [registerData, setRegisterData] = useState<any>(null);
  const [showResend, setShowResend] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(OTP_LENGTH).fill(null)
  );

  // Timer OTP
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Show resend after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResend(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Load register data
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRegisterData(parsed);
      } catch (e) {
        console.error("Gagal parse sessionStorage:", e);
        Swal.fire({
          title: "Error",
          text: "Terjadi kesalahan. Silakan daftar ulang.",
          icon: "error",
          confirmButtonColor: "#facc15",
          iconColor: "#facc15",
        });
        router.push("/register");
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "Data registrasi tidak ditemukan.",
        icon: "error",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
      router.push("/register");
    }
  }, [router]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // ==========================
  // 🔐 VERIFY OTP
  // ==========================
  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== OTP_LENGTH) {
      return Swal.fire({
        title: "Peringatan",
        text: "Masukkan 6 digit kode OTP!",
        icon: "warning",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
    }

    if (!registerData?.email) {
      Swal.fire({
        title: "Error",
        text: "Data registrasi tidak ditemukan!",
        icon: "error",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
      router.push("/register");
      return;
    }

    setLoadingVerify(true);

    Swal.fire({
      title: "Memverifikasi...",
      text: "Tunggu sebentar",
      allowOutsideClick: false,
      confirmButtonColor: "#facc15",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...registerData,
            otp_code: enteredOtp,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verifikasi OTP gagal");

      sessionStorage.setItem("userData", JSON.stringify(data.data));
      sessionStorage.removeItem(STORAGE_KEY);

      Swal.fire({
        title: "Berhasil!",
        text: "OTP berhasil diverifikasi!",
        icon: "success",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      }).then(() => {
        router.push("/login");
      });
    } catch (error: any) {
      Swal.fire({
        title: "Gagal!",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  // ==========================
  // 🔁 RESEND OTP
  // ==========================
  const handleResendOtp = async () => {
    if (!registerData?.email) {
      Swal.fire({
        title: "Error",
        text: "Email tidak ditemukan. Silakan daftar ulang.",
        icon: "error",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
      router.push("/register");
      return;
    }

    setLoadingResend(true);

    Swal.fire({
      title: "Mengirim ulang OTP...",
      allowOutsideClick: false,
      confirmButtonColor: "#facc15",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerData.email,
            username: registerData.username
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setTimeLeft(300);
      setOtp(Array(OTP_LENGTH).fill(""));

      Swal.fire({
        title: "Terkirim!",
        text: "OTP baru telah dikirim ke email Anda.",
        icon: "success",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
    } catch (error: any) {
      Swal.fire({
        title: "Gagal!",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#facc15",
        iconColor: "#facc15",
      });
    } finally {
      setLoadingResend(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleGoBack = () => {
    router.push("/register");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <div className="text-center mb-6">
          <Image
            src="/verify-otp.svg"
            alt="Verify OTP"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold mt-4">Verifikasi OTP</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Masukkan kode OTP yang telah dikirim ke email{" "}
            <span className="font-semibold text-yellow-600">
              {registerData?.email || ""}
            </span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                pattern="\d*"
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-xl font-semibold focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loadingVerify}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-md font-semibold transition disabled:opacity-70"
          >
            {loadingVerify ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Kode kedaluwarsa dalam{" "}
            <span className="font-semibold text-yellow-600">
              {formatTime(timeLeft)}
            </span>
          </p>

          {showResend && (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loadingResend}
              className="mt-2 text-yellow-500 hover:underline font-semibold disabled:opacity-60"
            >
              {loadingResend ? "Mengirim ulang..." : "Kirim ulang kode OTP"}
            </button>
          )}
        </div>

        <button
          onClick={handleGoBack}
          className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-semibold transition"
        >
          ← Kembali ke Registrasi
        </button>
      </div>
    </section>
  );
};

export default VerifyOtpPage;
