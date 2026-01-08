"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ActivityItem {
  id: number;
  text: string;
  type: string;
  date: string;
  timestamp: string;
  user: string;
}

export const useActivityAPI = (gudangId: number | null, limit: number = 10) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  // Fetch Activities
  const fetchActivities = useCallback(async () => {
    if (!gudangId) {
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/api/activity-logs`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          gudangId,
          limit,
        },
      });

      // Pastikan timestamp dalam format ISO
      const formattedActivities = (res.data || []).map((act: any) => ({
        ...act,
        timestamp: act.timestamp || new Date().toISOString() // Fallback jika tidak ada
      }));

      setActivities(formattedActivities);
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Gagal mengambil aktivitas";
      setError(msg);
      console.error("❌ fetchActivities:", msg);
      setActivities([]); // Reset jika error
    } finally {
      setLoading(false);
    }
  }, [gudangId, limit]);

  // ✅ CRITICAL FIX: Reset activities IMMEDIATELY saat gudang berubah
  useEffect(() => {
    setActivities([]); // Clear dulu
    setError(null);
    
    if (gudangId) {
      fetchActivities(); // Baru fetch data baru
    }
  }, [gudangId, fetchActivities]);

  // Auto refresh setiap 30 detik
  useEffect(() => {
    if (!gudangId) return;

    const interval = setInterval(() => {
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, [gudangId, fetchActivities]);

  return {
    activities,
    loading,
    error,
    refreshActivities: fetchActivities,
  };
};