"use client";

import { useState, useEffect, ChangeEvent, FormEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UploadCloud, ArrowLeft, X } from "lucide-react"; 
import Swal from "sweetalert2";

export default function ConfirmationPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // State Form
  const [namaPengirim, setNamaPengirim] = useState("");
  const [bankPengirim, setBankPengirim] = useState("");
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 STATE BARU: Untuk efek visual saat drag
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const storedPlan = localStorage.getItem("selectedPlan");
    if (storedPlan) {
      setSelectedPlan(JSON.parse(storedPlan));
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  // --- LOGIC FILE PROCESSING (Dipakai Click & Drop) ---
  const processFile = (file: File) => {
    // Validasi tipe file (opsional, tapi disarankan)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        Swal.fire("Format Salah", "Harap upload file gambar (JPG, PNG).", "warning");
        return;
    }
    // Validasi ukuran (misal max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Terlalu Besar", "Ukuran file maksimal 5MB.", "warning");
        return;
    }

    setBuktiFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 1. Handle Click Upload (Input Biasa)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 🔥 2. Handle Drag Over (Saat file ditarik ke area)
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Wajib agar bisa di-drop
    setIsDragging(true);
  };

  // 🔥 3. Handle Drag Leave (Saat file keluar area)
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 🔥 4. Handle Drop (Saat file dilepas)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Remove Image
  const handleRemoveImage = (e: React.MouseEvent) => {
      e.stopPropagation(); // Biar gak memicu klik input file
      setBuktiFile(null);
      setPreviewUrl(null);
  };

  // Handle Submit Form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!buktiFile || !namaPengirim || !bankPengirim) {
      Swal.fire("Error", "Harap lengkapi semua data dan upload bukti transfer.", "error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
          Swal.fire("Error", "Sesi habis, silakan login kembali.", "error");
          router.push("/login");
          return;
      }

      const formData = new FormData();
      formData.append("sub_plan_id", selectedPlan.id);
      formData.append("nama_pengirim", namaPengirim);
      formData.append("bank_pengirim", bankPengirim);
      formData.append("keterangan", `Pembayaran paket ${selectedPlan.nama_paket}`);
      formData.append("bukti_pembayaran", buktiFile);

      await axios.post("http://localhost:5000/api/payment/create", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Bukti pembayaran berhasil dikirim. Admin akan memverifikasi dalam 1x24 jam.",
        icon: "success",
        confirmButtonColor: "#EAB308",
      }).then(() => {
        localStorage.removeItem("selectedPlan");
        router.push("/dashboard");
      });

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal mengirim bukti pembayaran.";
      Swal.fire("Gagal", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      
      <div className="max-w-lg w-full">
        
        {/* TOMBOL KEMBALI */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-500 hover:text-yellow-600 transition mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Lihat Nomor Rekening
        </button>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6">Konfirmasi Pembayaran</h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>Paket: <span className="font-semibold text-gray-900">{selectedPlan.nama_paket}</span></p>
              <p>Total: <span className="font-semibold text-yellow-600">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(selectedPlan.harga)}
              </span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nama Pengirim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik Rekening</label>
              <input
                type="text"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                placeholder="Contoh: Budi Santoso"
                required
              />
            </div>

            {/* Bank Pengirim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank/E-Wallet Pengirim</label>
              <input
                type="text"
                value={bankPengirim}
                onChange={(e) => setBankPengirim(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                placeholder="Contoh: BCA, Mandiri, Gopay"
                required
              />
            </div>

            {/* Upload Bukti (Drag & Drop Area) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bukti Transfer</label>
              
              <div 
                // 🔥 Event Handler Drag & Drop Dipasang Disini
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition cursor-pointer relative
                    ${isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:bg-gray-50'}
                `}
              >
                <div className="space-y-1 text-center w-full">
                  {previewUrl ? (
                      <div className="relative group">
                          <img src={previewUrl} alt="Preview" className="mx-auto h-48 object-contain rounded-md shadow-sm" />
                          {/* Tombol Hapus Gambar */}
                          <button 
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                          >
                             <X size={16} />
                          </button>
                          <p className="text-xs text-gray-500 mt-2">{buktiFile?.name}</p>
                      </div>
                  ) : (
                      <>
                          <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none">
                                <span>Upload file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">atau drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "Mengirim..." : "Kirim Konfirmasi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}