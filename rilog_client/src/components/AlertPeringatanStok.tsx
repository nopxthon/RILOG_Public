import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface NotifikasiCounts {
  stok_menipis: number;
  stok_habis: number;
  stok_berlebih: number;
  mendekati_kadaluarsa: number;
  sudah_kadaluarsa: number;
  total: number;
}

interface AlertPeringatanStokProps {
  notifikasiList: any[];
  notifikasiCounts?: NotifikasiCounts;
  onLihatDetail: () => Promise<void> | void;
  variant?: "dashboard" | "inventori";
}

const AlertPeringatanStok: React.FC<AlertPeringatanStokProps> = ({
  notifikasiList,
  notifikasiCounts,
  onLihatDetail,
  variant = "dashboard",
}) => {
  // 🔥 FIX: Pastikan total count menggunakan notifikasiList.length
  const totalCount = notifikasiCounts?.total || notifikasiList.length;

  if (totalCount === 0) return null;

  const renderDescription = () => {
    if (variant === "dashboard" && notifikasiCounts) {
      const parts: string[] = [];

      if (notifikasiCounts.stok_habis > 0)
        parts.push(`${notifikasiCounts.stok_habis} stok habis`);
      if (notifikasiCounts.stok_menipis > 0)
        parts.push(`${notifikasiCounts.stok_menipis} stok menipis`);
      if (notifikasiCounts.mendekati_kadaluarsa > 0)
        parts.push(
          `${notifikasiCounts.mendekati_kadaluarsa} mendekati kadaluarsa`
        );
      if (notifikasiCounts.sudah_kadaluarsa > 0)
        parts.push(
          `${notifikasiCounts.sudah_kadaluarsa} sudah kadaluarsa`
        );

      return (
        <p className="text-red-600 text-sm">
          Ada {totalCount} notifikasi penting
          {parts.length > 0 && ` • ${parts.join(" • ")}`}
        </p>
      );
    }

    return (
      <p className="text-red-600 text-sm">
        Ada {totalCount} notifikasi yang perlu perhatian Anda
      </p>
    );
  };

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <div>
            <h3 className="font-semibold text-red-800">
              {variant === "dashboard"
                ? "Peringatan Stok"
                : "Peringatan Stok & Kadaluarsa"}
            </h3>
            {renderDescription()}
          </div>
        </div>

        <button
          onClick={onLihatDetail}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default AlertPeringatanStok;