// src/components/NotifikasiCard.tsx
"use client";

import { FC } from "react";
import { FaTimes, FaBoxOpen, FaBoxes, FaCalendarDay, FaCalendarTimes, FaExclamationTriangle, FaClock, FaTimesCircle } from "react-icons/fa";
import { NotifikasiItem } from "@/types/notifikasi";

interface NotifikasiCardProps {
  notif: NotifikasiItem;
  onHapus: (id: number) => void;
}

const NotifikasiCard: FC<NotifikasiCardProps> = ({ notif, onHapus }) => {
  const getNotifikasiIcon = (type: string) => {
    switch (type) {
      case "stok_habis":
        return <FaTimesCircle className="text-red-600 text-2xl" />;
      case "stok_menipis":
        return <FaBoxOpen className="text-red-500 text-2xl" />;
      case "stok_berlebih":
        return <FaBoxes className="text-yellow-500 text-2xl" />;
      case "mendekati_kadaluarsa":
        return <FaCalendarDay className="text-orange-500 text-2xl" />;
      case "sudah_kadaluarsa":
        return <FaCalendarTimes className="text-red-500 text-2xl" />;
      default:
        return <FaExclamationTriangle className="text-gray-500 text-2xl" />;
    }
  };

  const getCardStyle = (type: string, priority: string) => {
    const baseStyle = "relative overflow-hidden";
    
    switch (type) {
      case "stok_habis":
        return `${baseStyle} bg-gradient-to-br from-red-100 via-red-200 to-red-100 border-l-4 border-red-600`;
      case "stok_menipis":
        return `${baseStyle} bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500`;
      case "stok_berlebih":
        return `${baseStyle} bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500`;
      case "mendekati_kadaluarsa":
        return `${baseStyle} bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500`;
      case "sudah_kadaluarsa":
        return `${baseStyle} bg-gradient-to-br from-red-50 via-red-100 to-pink-100 border-l-4 border-red-600`;
      default:
        return `${baseStyle} bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-gray-400`;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "stok_habis":
        return "bg-red-600 text-white";
      case "stok_menipis":
        return "bg-red-500 text-white";
      case "stok_berlebih":
        return "bg-yellow-500 text-white";
      case "mendekati_kadaluarsa":
        return "bg-orange-500 text-white";
      case "sudah_kadaluarsa":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stok_habis":
        return "Stok Habis";
      case "stok_menipis":
        return "Stok Menipis";
      case "stok_berlebih":
        return "Stok Berlebih";
      case "mendekati_kadaluarsa":
        return "Mendekati Kadaluarsa";
      case "sudah_kadaluarsa":
        return "Sudah Kadaluarsa";
      default:
        return type;
    }
  };

  return (
    <div className={`${getCardStyle(notif.type, notif.priority)} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="text-9xl transform rotate-12">
          {getNotifikasiIcon(notif.type)}
        </div>
      </div>

      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon with background */}
            <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center">
              {getNotifikasiIcon(notif.type)}
            </div>
            
            {/* Title and Badges */}
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{notif.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${getTypeBadgeColor(notif.type)}`}>
                  {getTypeLabel(notif.type)}
                </span>
                {notif.priority === "high" && (
                  <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm animate-pulse">
                    ⚠ Prioritas Tinggi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => onHapus(notif.id)}
            className="flex-shrink-0 w-8 h-8 bg-white rounded-lg shadow-md hover:bg-red-50 hover:shadow-lg text-gray-400 hover:text-red-500 transition-all duration-200 flex items-center justify-center group"
          >
            <FaTimes className="text-lg group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Message */}
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4 backdrop-blur-sm">
          <p className="text-gray-700 font-medium">{notif.message}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Produk */}
          <div className="bg-white bg-opacity-70 rounded-lg p-3 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Produk</span>
            <p className="font-bold text-gray-800 mt-1 truncate" title={notif.produk}>{notif.produk}</p>
          </div>

          {/* Stok Saat Ini */}
          <div className="bg-white bg-opacity-70 rounded-lg p-3 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Stok Saat Ini</span>
            <p className="font-bold text-gray-800 mt-1">
              {notif.qty} <span className="text-sm text-gray-600">{notif.satuan}</span>
            </p>
          </div>

          {/* Min/Max Stok */}
          {notif.minStok && (
            <div className="bg-white bg-opacity-70 rounded-lg p-3 shadow-sm">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Stok Minimum</span>
              <p className="font-bold text-gray-800 mt-1">
                {notif.minStok} <span className="text-sm text-gray-600">{notif.satuan}</span>
              </p>
            </div>
          )}
          
          {notif.maxStok && (
            <div className="bg-white bg-opacity-70 rounded-lg p-3 shadow-sm">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Stok Maksimum</span>
              <p className="font-bold text-gray-800 mt-1">
                {notif.maxStok} <span className="text-sm text-gray-600">{notif.satuan}</span>
              </p>
            </div>
          )}

          {/* Hari Menuju Kadaluarsa */}
          {notif.hariMenujuKadaluarsa !== undefined && (
            <div className="bg-white bg-opacity-70 rounded-lg p-3 shadow-sm">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                <FaClock className="text-xs" />
                {notif.hariMenujuKadaluarsa > 0 ? 'Kadaluarsa' : 'Expired'}
              </span>
              <p className={`font-bold mt-1 ${
                notif.hariMenujuKadaluarsa <= 0 ? 'text-red-600' :
                notif.hariMenujuKadaluarsa <= 7 ? 'text-red-600' : 
                notif.hariMenujuKadaluarsa <= 30 ? 'text-orange-600' : 'text-gray-800'
              }`}>
                {notif.hariMenujuKadaluarsa > 0 
                  ? `${notif.hariMenujuKadaluarsa} hari` 
                  : `${Math.abs(notif.hariMenujuKadaluarsa)} hari lalu`
                }
              </p>
            </div>
          )}

          {/* Tanggal */}
          <div className="bg-white bg-opacity-70 rounded-lg p-3 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Tanggal</span>
            <p className="font-bold text-gray-800 mt-1">{notif.tanggal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifikasiCard;