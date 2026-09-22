const API_URL = "http://127.0.0.1:8000"; // URL de tu backend FastAPI

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("revenfy_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Ocurrió un error en la solicitud");
  }

  // Si la respuesta no tiene contenido (ej. 204 No Content)
  if (response.status === 204) return null;
  return response.json();
}