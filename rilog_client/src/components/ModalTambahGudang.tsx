"use client";
import { FC, useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    nama_gudang: string;
    tipe_gudang: string;
    alamat_gudang: string;
  }) => void;
}

const ModalTambahGudang: FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [nama, setNama] = useState("");
  const [tipe, setTipe] = useState("");
  const [alamat, setAlamat] = useState("");

  // 🟢 Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setNama("");
      setTipe("");
      setAlamat("");
    }
  }, [isOpen]);

  // 🟢 Reset + close
  const handleClose = () => {
    setNama("");
    setTipe("");
    setAlamat("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Tambah Gudang Baru</h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama Gudang"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
          />

          <select
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white cursor-pointer"
          >
            <option value="">Pilih Tipe Gudang</option>
            <option value="supermarket">Supermarket</option>
            <option value="apotek">Apotek</option>
            <option value="bakery">Bakery</option>
            <option value="butik">Butik</option>
            <option value="catering">Catering</option>
            <option value="coffee-shop">Coffee Shop</option>
            <option value="grosir">Grosir</option>
            <option value="mini-market">Mini Market</option>
            <option value="restoran">Restoran</option>
            <option value="toko-elektronik">Toko Elektronik</option>
          </select>

          <textarea
            placeholder="Alamat Gudang"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all resize-none h-24"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            Batal
          </button>

          <button
            onClick={() =>
              onSave({
                nama_gudang: nama,
                tipe_gudang: tipe,
                alamat_gudang: alamat,
              })
            }
            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTambahGudang;
