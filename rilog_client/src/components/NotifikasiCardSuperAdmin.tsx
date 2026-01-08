// src/components/NotifikasiSuperAdmin.tsx
"use client";

import { FC, useState, useMemo } from "react";
import { FaBell, FaTimes, FaFilter, FaExclamationTriangle } from "react-icons/fa";
import Image from "next/image";

export interface NotifikasiSuperAdminType {
  id: string;
  message: string;
  type: "warning" | "error" | "info";
  icon: string;
  priority?: "high" | "normal";
}

interface Subscription {
  nama: string;
  status: "Aktif" | "Berakhir";
}

interface NotifikasiSuperAdminProps {
  isOpen: boolean;
  onClose: () => void;
  notifikasiList: NotifikasiSuperAdminType[];
  onHapusNotifikasi: (id: string) => void;
  onHapusSemuaNotifikasi: () => void;
  subscriptionList?: Subscription[];
}

type FilterType = "semua" | "warning" | "error" | "info";

const NotifikasiSuperAdmin: FC<NotifikasiSuperAdminProps> = ({
  isOpen,
  onClose,
  notifikasiList,
  onHapusNotifikasi,
  onHapusSemuaNotifikasi,
  subscriptionList = [],
}) => {
  const [filter, setFilter] = useState<FilterType>("semua");

  if (!isOpen) return null;

  const filtered = useMemo(
    () =>
      filter === "semua"
        ? notifikasiList
        : notifikasiList.filter((n) => n.type === filter),
    [filter, notifikasiList]
  );

  const counts = {
    warning: notifikasiList.filter((n) => n.type === "warning").length,
    error: notifikasiList.filter((n) => n.type === "error").length,
    info: notifikasiList.filter((n) => n.type === "info").length,
  };

  const getBadgeStyle = (type: FilterType) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <FaBell className="text-yellow-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Notifikasi SuperAdmin</h2>
            {notifikasiList.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifikasiList.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {notifikasiList.length > 0 && (
              <button
                onClick={onHapusSemuaNotifikasi}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Filter */}
        {notifikasiList.length > 0 && (
          <div className="px-6 pt-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilter("semua")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "semua" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({notifikasiList.length})
              </button>
              <button
                onClick={() => setFilter("warning")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "warning" ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                Warning ({counts.warning})
              </button>
              <button
                onClick={() => setFilter("error")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "error" ? "bg-red-500 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                Error ({counts.error})
              </button>
              <button
                onClick={() => setFilter("info")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "info" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Info ({counts.info})
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-220px)] overflow-y-auto space-y-4">
          {notifikasiList.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada notifikasi</h3>
              <p className="text-gray-500">Semua aktivitas normal.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <FaFilter className="text-gray-300 text-3xl mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ada notifikasi</h3>
              <p className="text-gray-500">Tidak ada notifikasi untuk filter ini.</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className="flex justify-between items-center p-4 border rounded-xl hover:shadow transition"
              >
                <div className="flex items-center gap-3">
                  <Image src={`/${notif.icon}`} alt={notif.type} width={24} height={24} />
                  <span>{notif.message}</span>
                </div>
                <button
                  onClick={() => onHapusNotifikasi(notif.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Subscription */}
        {subscriptionList.length > 0 && (
          <div className="border-t p-6 bg-gray-50 space-y-4">
            <h3 className="font-bold text-gray-800">List Subscription</h3>
            {subscriptionList.map((sub, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg shadow">
                <span>{sub.nama}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  sub.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotifikasiSuperAdmin;
