import { useState } from "react";
import { NotifikasiSuperAdmin } from "@/types/notifikasisuperadmin";

export const useNotifikasiSuperAdmin = (initialData: NotifikasiSuperAdmin[]) => {
  const [notifikasiList, setNotifikasiList] = useState(initialData);

  const handleHapusNotifikasi = (id: string) => {
    setNotifikasiList(prev => prev.filter(n => n.id !== id));
  };

  const handleHapusSemuaNotifikasi = () => {
    setNotifikasiList([]);
  };

  const hitungNotifikasiPerTipe = () => {
    const counts = { warning: 0, info: 0, error: 0 };
    notifikasiList.forEach(n => {
      counts[n.type]++;
    });
    return counts;
  };

  return { notifikasiList, handleHapusNotifikasi, handleHapusSemuaNotifikasi, hitungNotifikasiPerTipe };
};