export interface LiveLocationResult {
  address: string;
  lat: number;
  lng: number;
}

interface NominatimAddress {
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  town?: string;
  city?: string;
  state?: string;
}

interface NominatimReverseResponse {
  address?: NominatimAddress;
}

function cleanTextField(value: unknown, maxLength = 80): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

async function fetchReverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 6000);

  try {
    const query = `format=jsonv2&lat=${encodeURIComponent(
      String(lat)
    )}&lon=${encodeURIComponent(String(lng))}`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${query}`,
      {
        headers: {
          "Accept-Language": "es",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as NominatimReverseResponse;
    const addr = data.address ?? {};

    const sector =
      cleanTextField(addr.neighbourhood) ||
      cleanTextField(addr.suburb) ||
      cleanTextField(addr.city_district) ||
      cleanTextField(addr.town) ||
      "";

    const city =
      cleanTextField(addr.city) ||
      cleanTextField(addr.state) ||
      "Bogotá D.C.";

    const readable = sector ? `${sector}, ${city}` : city;
    return `${readable} (${lat}, ${lng})`;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getRealTimeLocation(): Promise<LiveLocationResult> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(
        new Error("Tu navegador no soporta geolocalización en tiempo real.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;

        if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) {
          reject(new Error("Coordenadas de ubicación no válidas."));
          return;
        }

        const lat = Number(rawLat.toFixed(5));
        const lng = Number(rawLng.toFixed(5));

        const geocodedAddress = await fetchReverseGeocode(lat, lng);

        resolve({
          address: geocodedAddress ?? `Ubicación GPS (${lat}, ${lng})`,
          lat,
          lng,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error("Permiso de ubicación denegado. Actívalo en tu navegador.")
            );
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("No se pudo determinar tu ubicación actual."));
            break;
          case error.TIMEOUT:
            reject(
              new Error("Tiempo de espera agotado al obtener tu ubicación.")
            );
            break;
          default:
            reject(new Error("Error al obtener la ubicación en tiempo real."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}