"use client";

import { FC } from "react";

interface FotoProfilProps {
  fotoProfil: string | null;
  isSaving: boolean;
  fileBaru: boolean;
  isDefaultFoto: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSavePhoto: () => void;
  onDeletePhoto: () => void;
}

const FotoProfilSection: FC<FotoProfilProps> = ({ 
  fotoProfil, 
  isSaving, 
  fileBaru, 
  isDefaultFoto,
  onFileChange, 
  onSavePhoto, 
  onDeletePhoto 
}) => {
  const fallbackImg = "/basicprofil.jpg";

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        htmlFor="uploadFoto"
        aria-label="Upload foto profil"
        className="relative w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-100 overflow-hidden cursor-pointer hover:border-gray-400 hover:bg-gray-200 transition-all group"
      >
        {fotoProfil ? (
          <>
            <img
              src={fotoProfil}
              alt="Foto Profil"
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                console.log("⚠️ Image error in preview:", {
                  attemptedUrl: fotoProfil,
                  currentSrc: t.src,
                  timestamp: Date.now()
                });
                
                // Coba beberapa fallback
                if (!t.src.includes(fallbackImg)) {
                  t.src = fallbackImg;
                }
              }}
              onLoad={(e) => {
                console.log("✅ Image loaded successfully:", {
                  url: fotoProfil,
                  timestamp: Date.now()
                });
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white font-medium text-sm">Ubah Foto</span>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center p-4">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-sm font-medium">Upload Foto</div>
            <div className="text-xs text-gray-400 mt-1">Max 2MB</div>
          </div>
        )}
      </label>

      <input 
        id="uploadFoto" 
        type="file" 
        accept="image/jpeg,image/jpg,image/png,image/gif" 
        onChange={onFileChange} 
        className="hidden" 
      />

      {fileBaru && (
        <button 
          onClick={onSavePhoto} 
          disabled={isSaving} 
          className="bg-yellow-500 text-black px-4 py-2 min-w-[120px] rounded-md font-medium transition-all hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Menyimpan..." : "Simpan Foto"}
        </button>
      )}

      {!fileBaru && !isDefaultFoto && (
        <button 
          onClick={onDeletePhoto} 
          disabled={isSaving} 
          className="bg-red-50 text-red-600 px-4 py-2 min-w-[120px] rounded-md font-medium transition-all hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hapus Foto
        </button>
      )}

      <div className="text-xs text-gray-500 text-center mt-2">
        Format: JPG, PNG, GIF
        <br />
        Maksimal: 2MB
      </div>
    </div>
  );
};

export default FotoProfilSection;