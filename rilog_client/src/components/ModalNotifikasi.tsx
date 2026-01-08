"use client";

import { FC, useState, useEffect } from "react";
import { FaBell, FaTimes, FaFilter, FaWarehouse } from "react-icons/fa";
import { NotifikasiItem } from "@/types/notifikasi";
import NotifikasiCard from "./NotifikasiCard";

interface Gudang {
  id: number;
  nama_gudang: string;
  total?: number;
}

interface NotifikasiProps {
  isOpen: boolean;
  onClose: () => void;
  notifikasiList: NotifikasiItem[];
  onHapusNotifikasi: (id: number) => void;
  onHapusSemuaNotifikasi: () => void;
  gudangList?: Gudang[]; // ✅ TAMBAH: List gudang untuk filter
  selectedGudangId?: number; // ✅ TAMBAH: Gudang yang sedang aktif
  onGudangChange?: (gudangId?: number) => void; // ✅ TAMBAH: Callback saat ganti gudang
  summaryPerGudang?: Array<{
    gudang_id: number;
    nama_gudang: string;
    total: number;
  }>; // ✅ TAMBAH: Summary per gudang
}

type FilterType =
  | "semua"
  | "stok_habis"
  | "stok_menipis"
  | "stok_berlebih"
  | "mendekati_kadaluarsa"
  | "sudah_kadaluarsa";

/* =========================
   FILTER CONFIG
========================= */
const FILTER_CONFIG: Record<
  FilterType,
  {
    label: string;
    active: string;
    inactive: string;
  }
> = {
  semua: {
    label: "Semua",
    active: "bg-gray-800 text-white",
    inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  stok_habis: {
    label: "Stok Habis",
    active: "bg-red-600 text-white",
    inactive: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  stok_menipis: {
    label: "Stok Menipis",
    active: "bg-yellow-500 text-white",
    inactive: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  stok_berlebih: {
    label: "Stok Berlebih",
    active: "bg-blue-500 text-white",
    inactive: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  mendekati_kadaluarsa: {
    label: "Mendekati Kadaluarsa",
    active: "bg-orange-500 text-white",
    inactive: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  sudah_kadaluarsa: {
    label: "Sudah Kadaluarsa",
    active: "bg-red-800 text-white",
    inactive: "bg-red-200 text-red-800 hover:bg-red-300",
  },
};

const FILTER_ORDER: FilterType[] = [
  "semua",
  "stok_habis",
  "stok_menipis",
  "stok_berlebih",
  "mendekati_kadaluarsa",
  "sudah_kadaluarsa",
];

const Notifikasi: FC<NotifikasiProps> = ({
  isOpen,
  onClose,
  notifikasiList,
  onHapusNotifikasi,
  onHapusSemuaNotifikasi,
  gudangList = [],
  selectedGudangId,
  onGudangChange,
  summaryPerGudang = [],
}) => {
  const [filter, setFilter] = useState<FilterType>("semua");
  const [activeGudangId, setActiveGudangId] = useState<number | undefined>(selectedGudangId);

  useEffect(() => {
    setActiveGudangId(selectedGudangId);
  }, [selectedGudangId]);

  if (!isOpen) return null;

  const filteredNotifikasi =
    filter === "semua"
      ? notifikasiList
      : notifikasiList.filter((n) => n.type === filter);

  const getCount = (type: FilterType) =>
    type === "semua"
      ? notifikasiList.length
      : notifikasiList.filter((n) => n.type === type).length;

  const handleGudangChange = (gudangId?: number) => {
    setActiveGudangId(gudangId);
    if (onGudangChange) {
      onGudangChange(gudangId);
    }
  };

  const getGudangCount = (gudangId: number) => {
    return summaryPerGudang.find(s => s.gudang_id === gudangId)?.total || 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <FaBell className="text-yellow-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Notifikasi</h2>
            {notifikasiList.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notifikasiList.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {notifikasiList.length > 0 && (
              <button
                onClick={onHapusSemuaNotifikasi}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ================= FILTER GUDANG ================= */}
        {gudangList.length > 0 && (
          <div className="px-6 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <FaWarehouse className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filter Gudang:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGudangChange(undefined)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeGudangId === undefined
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Semua Gudang ({summaryPerGudang.reduce((sum, s) => sum + s.total, 0)})
              </button>
              {gudangList.map((gudang) => (
                <button
                  key={gudang.id}
                  onClick={() => handleGudangChange(gudang.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeGudangId === gudang.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {gudang.nama_gudang} ({getGudangCount(gudang.id)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= FILTER TYPE ================= */}
        {notifikasiList.length > 0 && (
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {FILTER_ORDER.map((type) => {
                const cfg = FILTER_CONFIG[type];
                const isActive = filter === type;

                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive ? cfg.active : cfg.inactive}`}
                  >
                    {cfg.label} ({getCount(type)})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-6">
          {notifikasiList.length === 0 ? (
            <div className="text-center py-16">
              <FaBell className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                Tidak ada notifikasi
              </h3>
              <p className="text-gray-500">
                {activeGudangId 
                  ? "Tidak ada notifikasi untuk gudang ini."
                  : "Semua aktivitas normal."
                }
              </p>
            </div>
          ) : filteredNotifikasi.length === 0 ? (
            <div className="text-center py-16">
              <FaFilter className="text-gray-300 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                Tidak ada notifikasi
              </h3>
              <p className="text-gray-500">
                Tidak ada notifikasi untuk filter ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifikasi.map((notif) => (
                <NotifikasiCard
                  key={notif.id}
                  notif={notif}
                  onHapus={() => onHapusNotifikasi(Number(notif.id))}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        {filteredNotifikasi.length > 0 && (
          <div className="border-t px-6 py-3 bg-gray-50 text-sm text-gray-600 flex justify-between">
            <span>
              Menampilkan {filteredNotifikasi.length} dari{" "}
              {notifikasiList.length} notifikasi
              {activeGudangId && (
                <span className="font-semibold ml-1">
                  ({gudangList.find(g => g.id === activeGudangId)?.nama_gudang})
                </span>
              )}
            </span>
            <span>
              Prioritas tinggi:{" "}
              {filteredNotifikasi.filter((n) => n.priority === "high").length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifikasi;