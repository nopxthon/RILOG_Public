// components/superadmin/DataPengguna.tsx
"use client";

import { FC } from "react";

interface DataPenggunaProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  isEditing: boolean;
  onEditClick: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const DataPengguna: FC<DataPenggunaProps> = ({
  formData,
  isEditing,
  onEditClick,
  onInputChange,
  onSave,
  onCancel,
  isLoading
}) => {
  const renderField = (label: string, name: string, value: string, type = "text") => {
    if (isEditing) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100">
          {value || '-'}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Data Pengguna</h2>
        {!isEditing && (
          <button 
            onClick={onEditClick}
            className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderField("First Name", "firstName", formData.firstName)}
        {renderField("Last Name", "lastName", formData.lastName)}
        {renderField("Email", "email", formData.email, "email")}
        {renderField("Phone", "phone", formData.phone, "tel")}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DataPengguna;