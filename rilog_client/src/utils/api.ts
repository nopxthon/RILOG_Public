export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiGet(path: string) {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  return response.json();
}

export async function apiPost(path: string, data: any) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiDelete(path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
  });
  return response.json();
}
