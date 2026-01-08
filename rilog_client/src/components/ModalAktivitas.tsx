import React, { useState, useMemo } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Image from 'next/image';

interface Activity {
  id: number;
  type: string;
  text: string;
  date: string;
  timestamp: string;
}

interface ModalAktivitasProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  loading?: boolean;
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
type FilterActivityType = 'all' | 'STOK MASUK' | 'STOK KELUAR' | 'OPNAME';

const ModalAktivitas: React.FC<ModalAktivitasProps> = ({
  isOpen,
  onClose,
  activities,
  loading = false
}) => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [filterActivityType, setFilterActivityType] = useState<FilterActivityType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Fungsi untuk mendapatkan icon aktivitas
  const getActivityIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'STOK MASUK': 'aktifitas-stok-masuk.svg',
      'STOK KELUAR': 'aktifitas-stok-keluar.svg',
      'TAMBAH ITEM': 'aktifitas-stok-masuk.svg',
      'OPNAME': 'aktifitas-stokopname.svg',
    };
    return iconMap[type] || 'aktifitas-stok-masuk.svg';
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan tipe
  const getTypeBadgeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'STOK MASUK': 'bg-green-100 text-green-800',
      'STOK KELUAR': 'bg-red-100 text-red-800',
      'TAMBAH ITEM': 'bg-blue-100 text-blue-800',
      'OPNAME': 'bg-purple-100 text-purple-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Fungsi untuk mendapatkan warna background icon
  const getIconBgColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'STOK MASUK': 'bg-green-50',
      'STOK KELUAR': 'bg-red-50',
      'TAMBAH ITEM': 'bg-blue-50',
      'OPNAME': 'bg-purple-50',
    };
    return colorMap[type] || 'bg-yellow-50';
  };

  // Fungsi parsing status opname dari text
  const parseOpnameStatus = (text: string): 'increase' | 'decrease' | 'same' | null => {
    if (!text.includes('Stok Opname')) return null;
    
    if (text.includes('stok sesuai') || text.includes('tidak ada perubahan')) {
      return 'same';
    }
    
    const selisihMatch = text.match(/\((?:penambahan|pengurangan)\s+(\d+)\s+\w+\)/);
    if (selisihMatch) {
      const selisih = parseInt(selisihMatch[1]);
      if (selisih === 0) return 'same';
      if (text.includes('penambahan') && selisih > 0) return 'increase';
      if (text.includes('pengurangan') && selisih > 0) return 'decrease';
    }
    
    if (text.includes('penambahan')) return 'increase';
    if (text.includes('pengurangan')) return 'decrease';
    
    const match = text.match(/(\d+)\s*→\s*(\d+)/);
    if (match) {
      const beforeNum = parseInt(match[1]);
      const afterNum = parseInt(match[2]);
      
      if (beforeNum === afterNum) return 'same';
      if (afterNum > beforeNum) return 'increase';
      if (afterNum < beforeNum) return 'decrease';
    }
    
    return null;
  };

  // Fungsi untuk parsing tanggal dari timestamp ISO
  const parseActivityDate = (activity: Activity): Date => {
    if (activity.timestamp) {
      return new Date(activity.timestamp);
    }
    return new Date(activity.date);
  };

  // Handler untuk mengubah filter period
  const handleFilterPeriodChange = (period: FilterPeriod) => {
    setFilterPeriod(period);
    if (period === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  // Handler untuk apply custom date range
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setFilterPeriod('custom');
      setShowCustomDatePicker(false);
    }
  };

  // Handler untuk reset custom date
  const resetCustomDate = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setFilterPeriod('all');
    setShowCustomDatePicker(false);
  };

  // Format tanggal untuk display
  const formatCustomDateRange = (): string => {
    if (!customStartDate || !customEndDate) return '';
    const start = new Date(customStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const end = new Date(customEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Filter aktivitas berdasarkan tanggal dan tipe
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filter berdasarkan periode waktu
    switch (filterPeriod) {
      case 'today':
        filtered = filtered.filter(act => {
          const actDate = parseActivityDate(act);
          return actDate >= today;
        });
        break;
      
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(act => {
          const actDate = parseActivityDate(act);
          return actDate >= weekAgo;
        });
        break;
      
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(act => {
          const actDate = parseActivityDate(act);
          return actDate >= monthAgo;
        });
        break;
      
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(act => {
          const actDate = parseActivityDate(act);
          return actDate >= yearAgo;
        });
        break;
      
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          
          filtered = filtered.filter(act => {
            const actDate = parseActivityDate(act);
            return actDate >= startDate && actDate <= endDate;
          });
        }
        break;
    }

    // Filter berdasarkan tipe aktivitas
    if (filterActivityType !== 'all') {
      filtered = filtered.filter(act => act.type === filterActivityType);
    }

    return filtered;
  }, [activities, filterPeriod, filterActivityType, customStartDate, customEndDate]);

  // Grouping aktivitas per tanggal
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    
    filteredActivities.forEach(act => {
      const dateKey = act.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(act);
    });

    return Object.entries(groups).sort((a, b) => {
      const dateA = parseActivityDate(a[1][0]);
      const dateB = parseActivityDate(b[1][0]);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredActivities]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
              <FaCalendarAlt />
              Aktivitas Terbaru
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        {/* Filter Section - Minimalis */}
        <div className="px-6 py-3 border-b bg-white">
          
          {/* Filter Periode */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Periode Waktu
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleFilterPeriodChange('all')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterPeriod === 'all'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => handleFilterPeriodChange('today')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterPeriod === 'today'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => handleFilterPeriodChange('week')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterPeriod === 'week'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => handleFilterPeriodChange('month')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterPeriod === 'month'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30 Hari
              </button>
              <button
                onClick={() => handleFilterPeriodChange('year')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterPeriod === 'year'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                1 Tahun
              </button>
              <button
                onClick={() => handleFilterPeriodChange('custom')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterPeriod === 'custom'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Date Picker - Minimalis */}
            {showCustomDatePicker && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-gray-500 mb-1">Mulai</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-gray-500 mb-1">Akhir</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={applyCustomDateRange}
                    disabled={!customStartDate || !customEndDate}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      customStartDate && customEndDate
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Terapkan
                  </button>
                  <button
                    onClick={resetCustomDate}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Display Custom Date Range - Minimalis */}
            {filterPeriod === 'custom' && customStartDate && customEndDate && !showCustomDatePicker && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <span className="text-gray-500">Rentang:</span>
                <span className="font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
                  {formatCustomDateRange()}
                </span>
                <button
                  onClick={() => setShowCustomDatePicker(true)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>

          {/* Filter Tipe Aktivitas - Minimalis */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Tipe Aktivitas
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterActivityType('all')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterActivityType === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterActivityType('STOK MASUK')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterActivityType === 'STOK MASUK'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                STOK MASUK
              </button>
              <button
                onClick={() => setFilterActivityType('STOK KELUAR')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterActivityType === 'STOK KELUAR'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                STOK KELUAR
              </button>
              <button
                onClick={() => setFilterActivityType('OPNAME')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterActivityType === 'OPNAME'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                STOK OPNAME
              </button>
            </div>
          </div>

          {/* Info hasil filter - Minimalis */}
          <div className="text-xs text-gray-600 flex items-center gap-1.5 pt-2 border-t">
            <FaClock size={11} />
            <span>{filteredActivities.length} aktivitas</span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : groupedActivities.length > 0 ? (
            <div className="space-y-6">
              {groupedActivities.map(([date, acts]) => (
                <div key={date} className="border-l-4 border-yellow-400 pl-4">
                  <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-yellow-500" />
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {acts.map((act) => {
                      const opnameStatus = parseOpnameStatus(act.text);
                      
                      return (
                        <div
                          key={act.id}
                          className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`${getIconBgColor(act.type)} p-2 rounded-lg relative flex-shrink-0`}>
                              <Image
                                src={`/${getActivityIcon(act.type)}`}
                                alt={act.type}
                                width={24}
                                height={24}
                              />
                              {/* Status indicator untuk opname */}
                              {act.type === 'OPNAME' && opnameStatus && (
                                <div className="absolute -bottom-1 -right-1">
                                  {opnameStatus === 'increase' && (
                                    <FaCheckCircle className="text-green-500 bg-white rounded-full" size={12} />
                                  )}
                                  {opnameStatus === 'decrease' && (
                                    <FaExclamationCircle className="text-red-500 bg-white rounded-full" size={12} />
                                  )}
                                  {opnameStatus === 'same' && (
                                    <FaCheckCircle className="text-blue-500 bg-white rounded-full" size={12} />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`px-2 py-1 ${getTypeBadgeColor(act.type)} text-xs font-semibold rounded`}>
                                  {act.type}
                                </span>
                                {act.timestamp && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <FaClock size={10} />
                                    {new Date(act.timestamp).toLocaleTimeString('id-ID', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                )}
                                {/* Status badge untuk opname */}
                                {act.type === 'OPNAME' && opnameStatus && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    opnameStatus === 'increase' 
                                      ? 'bg-green-100 text-green-700' 
                                      : opnameStatus === 'decrease'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {opnameStatus === 'increase' && '↑ Bertambah'}
                                    {opnameStatus === 'decrease' && '↓ Berkurang'}
                                    {opnameStatus === 'same' && '✓ Sesuai'}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed break-words">{act.text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <FaCalendarAlt size={48} className="mx-auto mb-4" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Tidak ada aktivitas ditemukan
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Coba ubah filter periode atau tipe aktivitas
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAktivitas;