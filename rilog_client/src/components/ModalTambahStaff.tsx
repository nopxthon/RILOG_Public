"use client";

import { useEffect, useState } from "react";

interface Gudang {
  id: number;
  nama_gudang: string;
  bisnis?: {
    id: number;
    nama_bisnis: string;
  };
}

interface ModalTambahStaffProps {
  isOpen: boolean;
  onClose: () => void;
  onTambah: (data: {
    username: string;
    email: string;
    gudangIds: number[];
    bisnis_id: number;
  }) => void;
}

export default function ModalTambahStaff({
  isOpen,
  onClose,
  onTambah,
}: ModalTambahStaffProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [selectedGudang, setSelectedGudang] = useState<number[]>([]);
  const [bisnisId, setBisnisId] = useState<number | null>(null);
  const [loadingGudang, setLoadingGudang] = useState(false);

  // Ambil bisnis dari localStorage
  useEffect(() => {
    const id = localStorage.getItem("bisnis_id");
    if (id) setBisnisId(Number(id));
  }, []);

  // Fetch gudang saat modal terbuka
  useEffect(() => {
    const fetchGudang = async () => {
      if (!bisnisId) return;

      try {
        setLoadingGudang(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/gudang?bisnis_id=${bisnisId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal fetch gudang");
        setGudangList(json.data || []);
      } catch (err) {
        console.error(err);
        setGudangList([]);
      } finally {
        setLoadingGudang(false);
      }
    };

    if (isOpen) fetchGudang();
  }, [isOpen, bisnisId]);

  const toggleGudang = (id: number) => {
    setSelectedGudang((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!username.trim() || !email.trim() || selectedGudang.length === 0) {
      alert("Nama, email & pilih minimal 1 gudang wajib!");
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Format email tidak valid");
      return;
    }

    if (!bisnisId) {
      alert("Bisnis ID tidak ditemukan.");
      return;
    }

    onTambah({
      username,
      email,
      gudangIds: selectedGudang,
      bisnis_id: bisnisId,
    });

    // Reset modal
    setUsername("");
    setEmail("");
    setSelectedGudang([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Tambah Staff</h2>

        {/* Nama Staff */}
        <label className="block mb-3">
          <span className="text-sm font-medium">Nama Staff</span>
          <input
            type="text"
            className="mt-1 px-3 py-2 border w-full rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan nama"
          />
        </label>

        {/* Email Staff */}
        <label className="block mb-3">
          <span className="text-sm font-medium">Email Staff</span>
          <input
            type="email"
            className="mt-1 px-3 py-2 border w-full rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email"
          />
        </label>

        {/* Pilih Gudang */}
        <div className="mb-4">
          <span className="text-sm font-medium block mb-1">Pilih Akses Gudang</span>
          <div className="max-h-36 overflow-auto border rounded-lg px-3 py-2">
            {loadingGudang ? (
              <p className="text-sm text-gray-500">⏳ Memuat gudang...</p>
            ) : gudangList.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada gudang</p>
            ) : (
              gudangList.map((g) => (
                <label
                  key={g.id}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGudang.includes(g.id)}
                    onChange={() => toggleGudang(g.id)}
                  />
                  <span className="text-sm">
                    <b>{g.bisnis?.nama_bisnis ?? "Tanpa Bisnis"}</b> — {g.nama_gudang}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSubmit}
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
