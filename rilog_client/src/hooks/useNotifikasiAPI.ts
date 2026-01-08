"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  NotifikasiItem,
  NotifikasiType,
  NotifikasiPriority,
} from "@/types/notifikasi";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* =========================
   TYPE API RESPONSE
========================= */
interface NotifikasiItemAPI {
  id: number;
  type: NotifikasiType;
  message: string;
  created_at: string;
  record_id: number;
  table_name?: string;
  item: {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    min_stock?: number;
    max_stock?: number;
    batches: Array<{
      id: number;
      quantity: number;
      expiry_date: string;
    }>;
  } | null;
}

interface NotifikasiSummary {
  stok_menipis: number;
  stok_habis: number;
  stok_berlebih: number;
  mendekati_kadaluarsa: number;
  sudah_kadaluarsa: number;
  total: number;
}

/* =========================
   HELPER
========================= */
const mapNotifikasiType = (type: string): NotifikasiType => {
  const valid: NotifikasiType[] = [
    "stok_habis",
    "stok_menipis",
    "stok_berlebih",
    "mendekati_kadaluarsa",
    "sudah_kadaluarsa",
  ];
  return valid.includes(type as NotifikasiType)
    ? (type as NotifikasiType)
    : "stok_menipis";
};

const getTitleByType = (type: NotifikasiType): string => ({
  stok_habis: "Stok Habis",
  stok_menipis: "Stok Menipis",
  stok_berlebih: "Stok Berlebih",
  mendekati_kadaluarsa: "Mendekati Kadaluarsa",
  sudah_kadaluarsa: "Sudah Kadaluarsa",
}[type]);

const getPriorityByType = (type: NotifikasiType): NotifikasiPriority => {
  const map: Record<NotifikasiType, NotifikasiPriority> = {
    stok_habis: "high",
    stok_menipis: "high",
    stok_berlebih: "medium",
    mendekati_kadaluarsa: "high",
    sudah_kadaluarsa: "high",
  };
  return map[type];
};

/* =========================
   ✅ HOOK FINAL (REACTIVE)
========================= */
export const useNotifikasiAPI = (gudangId: number | null) => {
  const [rawNotifikasi, setRawNotifikasi] = useState<NotifikasiItemAPI[]>([]);
  const [summary, setSummary] = useState<NotifikasiSummary>({
    stok_menipis: 0,
    stok_habis: 0,
    stok_berlebih: 0,
    mendekati_kadaluarsa: 0,
    sudah_kadaluarsa: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  /* =========================
     🔥 RESET SAAT GUDANG BERUBAH
  ========================= */
  useEffect(() => {
    if (!gudangId) return;

    setRawNotifikasi([]);
    setSummary({
      stok_menipis: 0,
      stok_habis: 0,
      stok_berlebih: 0,
      mendekati_kadaluarsa: 0,
      sudah_kadaluarsa: 0,
      total: 0,
    });
  }, [gudangId]);

  /* =========================
     FETCH NOTIFIKASI LIST
  ========================= */
  const fetchNotifikasi = useCallback(
    async (type?: NotifikasiType) => {
      if (!gudangId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `${API_URL}/api/notifikasi/gudang/${gudangId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
            params: type ? { type } : {},
          }
        );

        setRawNotifikasi(res.data.data || []);
      } catch (err: any) {
        const msg =
          err.response?.data?.message || "Gagal mengambil notifikasi";
        setError(msg);
        console.error("❌ fetchNotifikasi:", msg);
      } finally {
        setLoading(false);
      }
    },
    [gudangId]
  );

  /* =========================
     FETCH SUMMARY
  ========================= */
  const fetchSummary = useCallback(async () => {
    if (!gudangId) return;

    try {
      const res = await axios.get(`${API_URL}/api/notifikasi/summary`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: { gudang_id: gudangId },
      });

      setSummary(res.data.data);
    } catch {
      console.warn("⚠️ fetchSummary gagal");
    }
  }, [gudangId]);

  /* =========================
     GENERATE NOTIFIKASI
  ========================= */
  const generateNotifikasi = async () => {
    if (!gudangId) return;

    await axios.post(
      `${API_URL}/api/notifikasi/generate`,
      { gudang_id: gudangId },
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
  };

  /* =========================
     DELETE NOTIFIKASI
  ========================= */

  const deleteNotifikasi = async (id: number) => {
  if (!gudangId) return;

  await axios.delete(`${API_URL}/api/notifikasi/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  setRawNotifikasi((prev) => prev.filter((n) => n.id !== id));
  fetchSummary();
};

const deleteAllNotifikasi = async () => {
  if (!gudangId) return;

  await axios.delete(`${API_URL}/api/notifikasi`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { gudang_id: gudangId },
  });

  setRawNotifikasi([]);
  setSummary({
    stok_menipis: 0,
    stok_habis: 0,
    stok_berlebih: 0,
    mendekati_kadaluarsa: 0,
    sudah_kadaluarsa: 0,
    total: 0,
  });
};



  /* =========================
     REFRESH ALL
  ========================= */
  const refreshNotifikasi = useCallback(async () => {
    if (!gudangId) return;

    await Promise.all([
      generateNotifikasi(),
      fetchNotifikasi(),
      fetchSummary(),
    ]);
  }, [gudangId, fetchNotifikasi, fetchSummary]);

  /* =========================
     AUTO INIT
  ========================= */
  useEffect(() => {
    if (!gudangId) return;
    fetchNotifikasi();
    fetchSummary();
  }, [gudangId, fetchNotifikasi, fetchSummary]);

  /* =========================
     AUTO REFRESH 30 DETIK
  ========================= */
  useEffect(() => {
    if (!gudangId) return;

    const interval = setInterval(() => {
      refreshNotifikasi();
    }, 30000);

    return () => clearInterval(interval);
  }, [gudangId, refreshNotifikasi]);

  /* =========================
     TRANSFORM → UI
  ========================= */
  const notifikasiList: NotifikasiItem[] = useMemo(() => {
    return rawNotifikasi.map((n) => {
      const type = mapNotifikasiType(n.type);
      const item = n.item;

      let hariMenujuKadaluarsa: number | undefined;

      if (
        (n.type === "mendekati_kadaluarsa" ||
          n.type === "sudah_kadaluarsa") &&
        n.table_name === "item_batches"
      ) {
        const batch = item?.batches?.find(
          (b) => b.id === n.record_id
        );

        if (batch?.expiry_date) {
          const exp = new Date(batch.expiry_date);
          const now = new Date();
          hariMenujuKadaluarsa = Math.ceil(
            (exp.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );
        }
      }

      return {
        id: n.id,
        type,
        title: getTitleByType(type),
        message: n.message,
        produk: item?.name || "Batch Produk",
        qty: item?.quantity ?? 0,
        satuan: item?.unit ?? "",
        tanggal: new Date(n.created_at).toLocaleDateString("id-ID"),
        priority: getPriorityByType(type),
        minStok: item?.min_stock,
        maxStok: item?.max_stock,
        hariMenujuKadaluarsa,
      };
    });
  }, [rawNotifikasi]);

  return {
  notifikasiList,
  summary,
  loading,
  error,
  fetchNotifikasi,
  fetchSummary,
  generateNotifikasi,
  refreshNotifikasi,
  deleteNotifikasi,
  deleteAllNotifikasi,
  isRefreshing: loading,
};
};
