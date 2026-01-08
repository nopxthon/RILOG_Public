// Buat file utils/fotoHelper.ts
export const normalizeFoto = (raw?: string | null, apiUrl?: string): string => {
  const API_URL = apiUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  if (!raw || raw === "/" || raw === "" || raw === "null") {
    return "/basicprofil.jpg";
  }

  // Jika sudah URL lengkap
  if (raw.startsWith("http")) return raw;
  
  // Jika sudah diawali dengan slash
  if (raw.startsWith("/")) {
    // Jika sudah mengandung domain
    if (raw.includes("localhost:") || raw.includes("http")) {
      return raw;
    }
    return `${API_URL}${raw}`;
  }
  
  // Jika path relative tanpa slash awal
  return `${API_URL}/${raw}`;
};