const API_URL = "http://127.0.0.1:8000";

export async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("revenfy_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Ocurrió un error en la solicitud");
  }

  if (response.status === 204) return null;
  return response.json();
}