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

interface ModalEditStaffProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any | null;
  onUpdate: (data: { staffId: number; gudangIds: number[]; bisnis_id: number }) => Promise<any>;
}

export default function ModalEditStaff({ isOpen, onClose, staff, onUpdate }: ModalEditStaffProps) {
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [selectedGudang, setSelectedGudang] = useState<number[]>([]);
  const [bisnisId, setBisnisId] = useState<number | null>(null);

  const [loadingGudang, setLoadingGudang] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setSelectedGudang(staff?.gudang?.map((g: any) => g.id) ?? []);
      setBisnisId(staff?.bisnis?.id || Number(localStorage.getItem("bisnis_id")));
    }
  }, [staff]);

  useEffect(() => {
    async function fetchGudang() {
      if (!bisnisId) return;
      setLoadingGudang(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gudang?bisnis_id=${bisnisId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      setGudangList(json.data || []);
      setLoadingGudang(false);
    }

    if (isOpen) fetchGudang();
  }, [isOpen, bisnisId]);

  const toggleGudang = (id: number) => {
    setSelectedGudang((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleUpdate = async () => {
    if (!staff) return;

    if (selectedGudang.length === 0) {
      alert("Minimal pilih 1 gudang.");
      return;
    }

    setSaving(true);

    await onUpdate({
      staffId: staff.id,
      gudangIds: selectedGudang,
      bisnis_id: bisnisId!,
    });

    setSaving(false);
    onClose();
  };

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Akses Gudang</h2>

        <p className="mb-4 text-sm">
          <b>{staff.username}</b> — {staff.email}
        </p>

        <div className="mb-4">
          <span className="text-sm font-medium block mb-1">Akses Gudang</span>

          <div className="max-h-36 overflow-auto border rounded-lg px-3 py-2">
            {loadingGudang ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : gudangList.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada gudang</p>
            ) : (
              gudangList.map((g) => (
                <label key={g.id} className="flex items-center gap-2 py-1">
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

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={onClose}>
            Batal
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg disabled:opacity-50"
            disabled={saving}
            onClick={handleUpdate}
          >
            {saving ? "Saving..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
