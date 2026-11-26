const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://back-end2-fvmz.onrender.com";

const API_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function getSafeErrorMessage(status: number, detail: unknown): string {
  if (status === 401) {
    return "Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.";
  }
  if (status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }
  if (status === 404) {
    return "El recurso solicitado no fue encontrado.";
  }
  if (status >= 500) {
    return "Error interno del servidor. Inténtalo más tarde.";
  }
  if (typeof detail === "string" && detail.trim().length > 0 && detail.length <= 200) {
    return detail.trim();
  }
  return "Ocurrió un error en la solicitud.";
}

export async function request<TResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<TResponse | null> {
  const token = localStorage.getItem("revenfy_token");

  const customHeaders: Record<string, string> = {};
  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      customHeaders[key] = value;
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => ({}))) as {
      detail?: unknown;
    };
    throw new ApiError(
      getSafeErrorMessage(response.status, errorPayload.detail),
      response.status
    );
  }

  if (response.status === 204) return null;
  return (await response.json()) as TResponse;
}
