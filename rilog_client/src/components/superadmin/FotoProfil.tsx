// components/superadmin/FotoProfil.tsx
"use client";

import { FC, useState, useRef } from "react";
import { FaCamera, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { emitProfileUpdate } from "@/utils/profileEvents";

interface FotoProfilProps {
  initialImage: string | null;
  firstName: string;
  size?: "small" | "medium" | "large";
  onImageChange?: (imageUrl: string | null) => void;
  className?: string;
}

const FotoProfil: FC<FotoProfilProps> = ({
  initialImage,
  firstName,
  size = "medium",
  onImageChange,
  className = ""
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const sizeClasses = {
    small: {
      container: "w-16 h-16",
      text: "text-2xl",
      icon: "text-sm"
    },
    medium: {
      container: "w-40 h-40",
      text: "text-5xl",
      icon: "text-2xl"
    },
    large: {
      container: "w-48 h-48",
      text: "text-6xl",
      icon: "text-3xl"
    }
  };

  const handleProfileImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const validateImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "File Tidak Valid",
        text: "Mohon pilih file gambar (JPG, PNG, GIF, atau WebP)",
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Terlalu Besar",
        text: "Ukuran file maksimal 5MB",
      });
      return false;
    }

    return true;
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem("superToken");

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const formData = new FormData();
      formData.append("profile_image", file);

      const response = await fetch(`${API_BASE_URL}/api/superadmin/profile/image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Gagal mengupload foto profil" }));
        throw new Error(error.message || "Gagal mengupload foto profil");
      }

      const result = await response.json();
      
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Foto profil berhasil diupload!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Emit event untuk update sidebar
      emitProfileUpdate();

      return result.data.profile_image_url;

    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProfileImage = async (): Promise<void> => {
    try {
      const result = await Swal.fire({
        title: "Hapus Foto Profil?",
        text: "Apakah Anda yakin ingin menghapus foto profil?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

      setIsUploading(true);
      const token = localStorage.getItem("superToken");

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(`${API_BASE_URL}/api/superadmin/profile/image`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Gagal menghapus foto profil" }));
        throw new Error(error.message || "Gagal menghapus foto profil");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Foto profil berhasil dihapus!",
        timer: 2000,
        showConfirmButton: false,
      });

      setProfileImage(null);
      if (onImageChange) {
        onImageChange(null);
      }

      // Emit event untuk update sidebar
      emitProfileUpdate();

    } catch (error) {
      console.error("Error deleting image:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error instanceof Error ? error.message : "Gagal menghapus foto profil",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const updateProfileImage = async (file: File): Promise<void> => {
    try {
      if (!validateImageFile(file)) return;

      const imageUrl = await uploadProfileImage(file);
      setProfileImage(imageUrl);
      
      if (onImageChange) {
        onImageChange(imageUrl);
      }

    } catch (error) {
      // Error sudah ditangani di fungsi uploadProfileImage
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await updateProfileImage(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative group">
        <div 
          className={`${sizeClasses[size].container} bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-300 cursor-pointer transition-all duration-200 hover:border-yellow-500 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleProfileImageClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <FaSpinner className="animate-spin text-yellow-500 text-2xl mb-2" />
              <span className="text-xs text-gray-600">Uploading...</span>
            </div>
          ) : profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Failed to load image:", profileImage);
                e.currentTarget.style.display = 'none';
                if (profileImage !== initialImage) {
                  setProfileImage(initialImage);
                }
              }}
            />
          ) : (
            <span className={`font-bold text-gray-500 ${sizeClasses[size].text}`}>
              {firstName.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        
        {/* Overlay hover */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <FaCamera className={`text-white mb-1 ${sizeClasses[size].icon}`} />
            <span className="text-white text-xs font-medium text-center px-2">
              {profileImage ? "Ganti Foto" : "Unggah Foto"}
            </span>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="mt-3 flex flex-col items-center space-y-1">
        {profileImage && !isUploading && (
          <button 
            onClick={deleteProfileImage}
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Hapus Foto
          </button>
        )}
        {!profileImage && !isUploading && (
          <button 
            onClick={handleProfileImageClick}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Unggah Foto
          </button>
        )}
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Format: JPG, PNG, GIF, WebP
        </p>
        <p className="text-xs text-gray-500">
          Maks: 5MB
        </p>
      </div>
    </div>
  );
};

export default FotoProfil;