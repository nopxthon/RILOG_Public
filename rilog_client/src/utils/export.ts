// utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ===========================
// EXPORT EXCEL
// ===========================

export const exportToExcel = (data: any[], filename: string, sheetName: string) => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// ===========================
// EXPORT PDF
// ===========================

export const exportToPDF = (
  data: any[], 
  columns: { header: string; dataKey: string }[],
  filename: string,
  title: string
) => {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    
    autoTable(doc, {
      startY: 35,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

// ===========================
// EXPORT DATA INVENTORI
// ===========================

export const exportInventoriToExcel = (data: any[]) => {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'Nama Barang': item.namaBarang || item.item_name,
    'Kategori': item.namaKategori,
    'Satuan': item.satuan,
    'Stok Tersedia': item.stokTersedia,
    'Min Stok': item.minBarang || item.min_stok,
    'Max Stok': item.maxBarang || item.max_stok,
    'Status': item.statusStok,
    'Tanggal Kadaluarsa': item.tanggalKadaluarsa || '-',
    'Sisa Hari': item.sisaHariKadaluarsa || '-'
  }));
  
  return exportToExcel(formattedData, 'Data_Inventori', 'Inventori');
};

export const exportInventoriToPDF = (data: any[]) => {
  const columns = [
    { header: 'No', dataKey: 'no' },
    { header: 'Nama Barang', dataKey: 'namaBarang' },
    { header: 'Kategori', dataKey: 'kategori' },
    { header: 'Satuan', dataKey: 'satuan' },
    { header: 'Stok', dataKey: 'stok' },
    { header: 'Status', dataKey: 'status' }
  ];
  
  const formattedData = data.map((item, index) => ({
    no: index + 1,
    namaBarang: item.namaBarang || item.item_name,
    kategori: item.namaKategori,
    satuan: item.satuan,
    stok: item.stokTersedia,
    status: item.statusStok
  }));
  
  return exportToPDF(formattedData, columns, 'Data_Inventori', 'Laporan Data Inventori');
};

// ===========================
// EXPORT STOK MASUK
// ===========================

export const exportStokMasukToExcel = (data: any[]) => {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'Nama Barang': item.nama,
    'Tanggal Masuk': new Date(item.tanggal).toLocaleDateString('id-ID'),
    'Qty': item.qty,
    'Satuan': item.satuan,
    'Pemasok': item.pemasok,
    'Diterima Oleh': item.diterimaOleh,
    'Tanggal Kadaluarsa': item.tanggalKadaluarsa ? new Date(item.tanggalKadaluarsa).toLocaleDateString('id-ID') : '-'
  }));
  
  return exportToExcel(formattedData, 'Stok_Masuk', 'Stok Masuk');
};

export const exportStokMasukToPDF = (data: any[]) => {
  const columns = [
    { header: 'No', dataKey: 'no' },
    { header: 'Nama Barang', dataKey: 'nama' },
    { header: 'Tanggal', dataKey: 'tanggal' },
    { header: 'Qty', dataKey: 'qty' },
    { header: 'Satuan', dataKey: 'satuan' },
    { header: 'Pemasok', dataKey: 'pemasok' }
  ];
  
  const formattedData = data.map((item, index) => ({
    no: index + 1,
    nama: item.nama,
    tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
    qty: item.qty,
    satuan: item.satuan,
    pemasok: item.pemasok
  }));
  
  return exportToPDF(formattedData, columns, 'Stok_Masuk', 'Laporan Stok Masuk');
};

// ===========================
// EXPORT STOK KELUAR
// ===========================

export const exportStokKeluarToExcel = (data: any[]) => {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'Nama Barang': item.namaBarang,
    'Tanggal Keluar': new Date(item.tanggalKeluar).toLocaleDateString('id-ID'),
    'Qty Keluar': item.qtyKeluar,
    'Satuan': item.satuan,
    'Dikeluarkan Oleh': item.dikeluarkanOleh,
    'Customer': item.customer || '-',
    'Notes': item.notes || '-'
  }));
  
  return exportToExcel(formattedData, 'Stok_Keluar', 'Stok Keluar');
};

export const exportStokKeluarToPDF = (data: any[]) => {
  const columns = [
    { header: 'No', dataKey: 'no' },
    { header: 'Nama Barang', dataKey: 'namaBarang' },
    { header: 'Tanggal', dataKey: 'tanggal' },
    { header: 'Qty', dataKey: 'qty' },
    { header: 'Satuan', dataKey: 'satuan' },
    { header: 'Dikeluarkan Oleh', dataKey: 'pic' }
  ];
  
  const formattedData = data.map((item, index) => ({
    no: index + 1,
    namaBarang: item.namaBarang,
    tanggal: new Date(item.tanggalKeluar).toLocaleDateString('id-ID'),
    qty: item.qtyKeluar,
    satuan: item.satuan,
    pic: item.dikeluarkanOleh
  }));
  
  return exportToPDF(formattedData, columns, 'Stok_Keluar', 'Laporan Stok Keluar');
};

// ===========================
// EXPORT KADALUARSA
// ===========================

export const exportKadaluarsaToExcel = (data: any[]) => {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'Nama Barang': item.namaBarang,
    'Kategori': item.namaKategori || item.klasifikasi,
    'Stok': item.stok,
    'Satuan': item.satuan,
    'Tanggal Kadaluarsa': new Date(item.tanggalKadaluarsa).toLocaleDateString('id-ID'),
    'Sisa Hari': item.sisaHariKadaluarsa,
    'Status': item.statusKadaluarsa === 'sudah' ? 'Sudah Kadaluarsa' : 
              item.statusKadaluarsa === 'mendekati' ? 'Mendekati Kadaluarsa' : 'Aman'
  }));
  
  return exportToExcel(formattedData, 'Data_Kadaluarsa', 'Kadaluarsa');
};

export const exportKadaluarsaToPDF = (data: any[]) => {
  const columns = [
    { header: 'No', dataKey: 'no' },
    { header: 'Nama Barang', dataKey: 'namaBarang' },
    { header: 'Kategori', dataKey: 'kategori' },
    { header: 'Stok', dataKey: 'stok' },
    { header: 'Tanggal Kadaluarsa', dataKey: 'tanggalKadaluarsa' },
    { header: 'Status', dataKey: 'status' }
  ];
  
  const formattedData = data.map((item, index) => ({
    no: index + 1,
    namaBarang: item.namaBarang,
    kategori: item.namaKategori || item.klasifikasi,
    stok: item.stok,
    tanggalKadaluarsa: new Date(item.tanggalKadaluarsa).toLocaleDateString('id-ID'),
    status: item.statusKadaluarsa === 'sudah' ? 'Kadaluarsa' : 
            item.statusKadaluarsa === 'mendekati' ? 'Mendekati' : 'Aman'
  }));
  
  return exportToPDF(formattedData, columns, 'Data_Kadaluarsa', 'Laporan Barang Kadaluarsa');
};

// ===========================
// EXPORT LAPORAN
// ===========================

export const exportLaporanToExcel = (data: any[]) => {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'Nama Barang': item.namaBarang,
    'Kategori': item.kategori,
    'Tanggal': new Date(item.tanggal).toLocaleString('id-ID'),
    'Stok Awal': item.stokAwal,
    'Status': item.status,
    'Jumlah': `${item.status === 'KELUAR' ? '-' : '+'}${item.jumlah}`,
    'Satuan': item.satuan,
    'Stok Akhir': item.stokAkhir
  }));
  
  return exportToExcel(formattedData, 'Laporan_Inventaris', 'Laporan');
};

export const exportLaporanToPDF = (data: any[]) => {
  const columns = [
    { header: 'No', dataKey: 'no' },
    { header: 'Nama Barang', dataKey: 'namaBarang' },
    { header: 'Kategori', dataKey: 'kategori' },
    { header: 'Tanggal', dataKey: 'tanggal' },
    { header: 'Stok Awal', dataKey: 'stokAwal' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Jumlah', dataKey: 'jumlah' },
    { header: 'Stok Akhir', dataKey: 'stokAkhir' }
  ];
  
  const formattedData = data.map((item, index) => ({
    no: index + 1,
    namaBarang: item.namaBarang,
    kategori: item.kategori,
    tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
    stokAwal: item.stokAwal,
    status: item.status,
    jumlah: `${item.status === 'KELUAR' ? '-' : '+'}${item.jumlah} ${item.satuan}`,
    stokAkhir: item.stokAkhir
  }));
  
  return exportToPDF(formattedData, columns, 'Laporan_Inventaris', 'Laporan Inventaris');
};