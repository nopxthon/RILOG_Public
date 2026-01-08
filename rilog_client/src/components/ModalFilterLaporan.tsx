import React from "react";
import { FaTimes, FaFilter, FaUndo } from "react-icons/fa";

interface ItemOption { id: number; item_name: string; category_id?: number; }
interface CategoryOption { id: number; category_name: string; }

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // State Props
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  selectedItems: number[];
  
  // Data Props
  categories: CategoryOption[];
  availableItems: ItemOption[];
  
  // Handler
  toggleSelectItem: (id: number) => void;
  onReset: () => void;
}

export default function ModalFilterLaporan({
  isOpen, onClose,
  startDate, setStartDate,
  endDate, setEndDate,
  category, setCategory,
  selectedItems,
  categories, availableItems,
  toggleSelectItem, onReset
}: ModalProps) {
  
  if (!isOpen) return null;

  // Filter item berdasarkan kategori yang dipilih di dropdown
  const filteredItemsDropdown = availableItems.filter(item => {
    if (category === 'all') return true;
    return String(item.category_id) === String(category);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaFilter className="text-yellow-500" /> Filter Laporan
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 1. Range Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dari Tanggal</label>
              <input 
                type="date" 
                className="w-full border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sampai Tanggal</label>
              <input 
                type="date" 
                className="w-full border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 2. Kategori & Item Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Kiri: Kategori */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
              <select 
                className="w-full border-yellow-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
              </select>
            </div>

            {/* Kanan: Item Checklist */}
            <div className="md:col-span-2 flex flex-col h-full">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                  <span>Pilih Item Spesifik</span>
                  <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full">{selectedItems.length} Dipilih</span>
               </label>

               <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-64">
                  {/* Chips Area */}
                  <div className="bg-gray-50 p-2 border-b border-gray-200 flex flex-wrap gap-1 min-h-[40px] max-h-[80px] overflow-y-auto">
                      {selectedItems.length === 0 && <span className="text-gray-400 text-xs italic p-1">Semua item ditampilkan (Default)</span>}
                      {selectedItems.map(id => {
                          const item = availableItems.find(i => i.id === id);
                          return (
                            <span key={id} className="bg-white border border-yellow-400 text-gray-700 text-xs px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                              {item?.item_name}
                              <button onClick={() => toggleSelectItem(id)} className="text-red-400 hover:text-red-600 ml-1 font-bold">×</button>
                            </span>
                          )
                      })}
                  </div>

                  {/* Checklist Area */}
                  <div className="p-3 overflow-y-auto bg-white flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredItemsDropdown.map(item => (
                        <label 
                          key={item.id} 
                          // ✅ PERUBAHAN STYLE ADA DI SINI
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs border transition-all ${
                            selectedItems.includes(item.id) 
                              ? 'bg-yellow-100 border-yellow-200 font-bold text-gray-900 shadow-sm' // Warna Aktif
                              : 'bg-white hover:bg-gray-50 border-transparent text-gray-600' // Warna Tidak Aktif
                          }`}
                        >
                           <input 
                              type="checkbox" 
                              className="text-yellow-500 rounded focus:ring-yellow-500 border-gray-300"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                           />
                           <span className="truncate">{item.item_name}</span>
                        </label>
                      ))}
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex justify-between items-center">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium transition"
          >
            <FaUndo size={12} /> Reset Filter
          </button>
          <button 
            onClick={onClose}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            Terapkan Filter
          </button>
        </div>

      </div>
    </div>
  );
}