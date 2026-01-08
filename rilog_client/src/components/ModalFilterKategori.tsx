// components/ModalFilterKategori.tsx
import { FaTimes, FaChevronDown } from "react-icons/fa";

interface FilterKategori {
  klasifikasi: string;
  search: string;
  statusKadaluarsa: string;
}

interface ModalFilterKategoriProps {
  onClose: () => void;
  filterKategori: FilterKategori;
  onFilterChange: (field: string, value: string) => void;
  onReset: () => void;
  suggestions: string[];
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export default function ModalFilterKategori({ 
  onClose, 
  filterKategori, 
  onFilterChange,
  onReset,
  suggestions,
  showSuggestions,
  onSuggestionClick
}: ModalFilterKategoriProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Filter Kategori</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cari Barang
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama barang..."
                value={filterKategori.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => onSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && suggestions.length === 0 && filterKategori.search.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-4 py-3 text-gray-500 text-center">
                    Tidak ada hasil ditemukan
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Klasifikasi
            </label>
            <div className="relative">
              <select
                value={filterKategori.klasifikasi}
                onChange={(e) => onFilterChange("klasifikasi", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors appearance-none bg-white pr-10"
              >
                <option value="">Semua Klasifikasi</option>
                <option value="Makanan Ringan">Makanan Ringan</option>
                <option value="Minuman">Minuman</option>
                <option value="Makanan Instan">Makanan Instan</option>
                <option value="Makanan Beku">Makanan Beku</option>
                <option value="Bahan Masak">Bahan Masak</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Alat Tulis">Alat Tulis</option>
                <option value="Kesehatan & Kecantikan">Kesehatan & Kecantikan</option>
                <option value="Kosmetik">Kosmetik</option>
                <option value="Obat-obatan">Obat-obatan</option>
                <option value="Fashion">Fashion</option>
                <option value="Peralatan Rumah Tangga">Peralatan Rumah Tangga</option>
                <option value="Bayi & Anak">Bayi & Anak</option>
                <option value="Otomotif">Otomotif</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Mainan">Mainan</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaChevronDown className="text-gray-400" />
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status Kadaluarsa
            </label>
            <div className="relative">
              <select
                value={filterKategori.statusKadaluarsa}
                onChange={(e) => onFilterChange("statusKadaluarsa", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors appearance-none bg-white pr-10"
              >
                <option value="">Semua Status</option>
                <option value="mendekati_kadaluarsa">Mendekati Kadaluarsa (kurang dari 30 hari)</option>
                <option value="masih_aman">Masih Aman (lebih dari 30 hari)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onReset}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Reset Filter
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}