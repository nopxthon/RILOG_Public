"use client";

import { FC, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Gudang {
  id: number;
  nama_gudang: string;
  // ✅ Tambahkan status aktif
  is_active: boolean; 
  bisnis?: {
    id: number;
    nama_bisnis: string;
  };
}

interface GudangSelectorProps {
  selectedGudang?: string;
  onGudangChange?: (gudangId: string) => void;
  className?: string;
}

const GudangSelector: FC<GudangSelectorProps> = ({ 
  selectedGudang: propSelectedGudang, 
  onGudangChange,
  className 
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [localSelectedLabel, setLocalSelectedLabel] = useState("Pilih Gudang");
  const [role, setRole] = useState<string | null>(null);

  const displayLabel = propSelectedGudang || localSelectedLabel;

  const fetchGudang = useCallback(async () => {
    const token = localStorage.getItem("token");
    const roleLocal = localStorage.getItem("userRole");
    const bisnisId = localStorage.getItem("bisnis_id");
    
    setRole(roleLocal);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/gudang`;

      if (roleLocal !== "staff" && bisnisId) {
        url += `?bisnis_id=${bisnisId}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal memuat data");

      const list = (result.data || []) as Gudang[];
      setGudangList(list);

      // AUTO SELECT LOGIC
      const storedId = localStorage.getItem("gudang_id");
      let activeGudang = list.find(g => String(g.id) === storedId);

      // Jika tidak ada yang dipilih, pilih yang pertama (Prioritaskan yang Aktif)
      if (!activeGudang && list.length > 0) {
        // Coba cari yang aktif dulu
        activeGudang = list.find(g => g.is_active) || list[0];
      }

      if (activeGudang) {
        const bisnisNama = activeGudang.bisnis?.nama_bisnis || "Bisnis";
        const label = `${bisnisNama} - ${activeGudang.nama_gudang}`;
        
        localStorage.setItem("gudang_id", String(activeGudang.id));
        localStorage.setItem("gudang_nama", activeGudang.nama_gudang);
        
        setLocalSelectedLabel(label);
        
        // ✅ PENTING: Panggil callback dengan slight delay untuk memastikan parent component sudah ready
        if (onGudangChange) {
          setTimeout(() => {
            onGudangChange(String(activeGudang!.id));
          }, 0);
        }
      }

    } catch (err: any) {
      console.error("❌ Error fetching gudang:", err);
      setError("Gagal memuat");
    } finally {
      setLoading(false);
    }
  }, [onGudangChange]);

  useEffect(() => {
    fetchGudang();
  }, [fetchGudang]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (label: string, gudang?: Gudang) => {
    if (label === "tambah") {
      router.push("/kelola-gudang");
      return;
    }

    if (gudang) {
      // ✅ Opsional: Jika Anda ingin melarang user memilih gudang non-aktif di sini
      // if (!gudang.is_active) {
      //   alert("Gudang ini sedang non-aktif. Silakan aktifkan di menu Kelola Gudang.");
      //   return;
      // }

      const bisnisNama = gudang.bisnis?.nama_bisnis || "Bisnis";
      const display = `${bisnisNama} - ${gudang.nama_gudang}`;

      console.log("🔀 GudangSelector: User memilih gudang", gudang.id); // Debug

      // 1. Simpan ke Storage
      localStorage.setItem("gudang_id", String(gudang.id));
      localStorage.setItem("gudang_nama", gudang.nama_gudang);
      if (gudang.bisnis?.id) {
          localStorage.setItem("gudang_bisnis_id", String(gudang.bisnis.id));
      }

      setLocalSelectedLabel(display);
      setOpen(false);

      // 3. ✅ CRITICAL FIX: SELALU panggil callback jika tersedia
      if (onGudangChange) {
        console.log("✅ Memanggil onGudangChange dengan ID:", gudang.id);
        onGudangChange(String(gudang.id));
      } else {
        // ❌ Hanya reload jika TIDAK ADA callback (fallback untuk halaman lama)
        console.warn("⚠️ Tidak ada onGudangChange handler, melakukan reload...");
        window.location.reload(); 
      }
    }
  };

  return (
    <div className={`relative inline-block w-full max-w-xs ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between bg-[#FFFAF0] rounded-full px-4 py-2 shadow-sm cursor-pointer gap-3 w-full border border-transparent hover:border-yellow-200 transition-all"
      >
        <span className="font-medium truncate text-gray-800 text-sm">
          {loading ? "⏳ Memuat..." : error ? "⚠️ Gagal" : displayLabel}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 text-gray-600 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {loading ? (
            <div className="py-3 text-center text-xs text-gray-500">Memuat data...</div>
          ) : error ? (
            <div className="py-3 text-center text-red-500 text-xs">{error}</div>
          ) : gudangList.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {gudangList.map((g, i) => {
                 const bisnisNama = g.bisnis?.nama_bisnis || localStorage.getItem("bisnis_nama") || "Tanpa Bisnis";
                 
                 return (
                  <div key={g.id}>
                    <button
                      onClick={() => handleSelect(`${bisnisNama} - ${g.nama_gudang}`, g)}
                      className={`w-full text-left px-4 py-3 transition text-base group flex items-start justify-between
                        ${g.is_active ? 'hover:bg-yellow-50' : 'bg-gray-50 opacity-75 hover:bg-gray-100'}
                      `}
                    >
                      <div>
                        <span className={`block font-medium ${g.is_active ? 'text-gray-800' : 'text-gray-500 line-through decoration-gray-400'}`}>
                          {g.nama_gudang}
                        </span>
                        {bisnisNama && (
                          <span className="block text-sm text-gray-400 mt-0.5">
                            {bisnisNama}
                          </span>
                        )}
                      </div>

                      {/* ✅ INDIKATOR STATUS */}
                      <div className="flex flex-col items-end">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                             ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}
                         `}>
                             {g.is_active ? 'Aktif' : 'Non-Aktif'}
                         </span>
                         {/* Dot Indicator */}
                         <span className={`mt-1 h-2 w-2 rounded-full ${g.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                    </button>
                    {i < gudangList.length - 1 && (
                      <hr className="border-t border-gray-50 mx-4" />
                    )}
                  </div>
                 );
              })}
            </div>
          ) : (
            <div className="py-3 text-center text-gray-400 text-xs">Tidak ada gudang</div>
          )}

          <hr className="border-t border-gray-100 mx-4" />

          {role !== "staff" && (
            <div className="bg-gray-50 p-2">
              <button
                onClick={() => handleSelect("tambah")}
                className="w-full py-2 text-center text-sm font-bold text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                + Tambah Gudang
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GudangSelector;