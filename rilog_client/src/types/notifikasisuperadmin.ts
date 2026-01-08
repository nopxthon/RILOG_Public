export interface NotifikasiSuperAdmin {
    id: string;
    message: string;
    type: "warning" | "info" | "error";
    icon?: string; // opsional, bisa untuk path icon
    date?: string; // opsional, tanggal notifikasi
  }
  