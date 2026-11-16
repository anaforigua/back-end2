// src/utils/locationHelper.ts
export interface LiveLocationResult {
  address: string;
  lat: number;
  lng: number;
}

export function getRealTimeLocation(): Promise<LiveLocationResult> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Tu navegador no soporta geolocalización en tiempo real."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: {
                "Accept-Language": "es",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const sector =
              addr.neighbourhood ||
              addr.suburb ||
              addr.city_district ||
              addr.town ||
              "";
            const city = addr.city || addr.state || "Bogotá D.C.";
            const readable = sector ? `${sector}, ${city}` : city;

            resolve({
              address: `${readable} (${lat}, ${lng})`,
              lat,
              lng,
            });
            return;
          }
        } catch {
          // Si falla la geocodificación inversa, devolvemos las coordenadas exactas
        }

        resolve({
          address: `Ubicación GPS (${lat}, ${lng})`,
          lat,
          lng,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Permiso de ubicación denegado. Actívalo en tu navegador."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("No se pudo determinar tu ubicación actual."));
            break;
          case error.TIMEOUT:
            reject(new Error("Tiempo de espera agotado al obtener tu ubicación."));
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