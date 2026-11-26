const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function validateImageFile(file: File): void {
  const normalizedType = file.type.trim().toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(normalizedType)) {
    throw new Error("Por favor selecciona una imagen válida (JPG, PNG o WEBP).");
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("El archivo debe pesar entre 1 byte y 5 MB.");
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string" || !result.startsWith("data:image/")) {
        reject(new Error("Error al leer el archivo de imagen."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= 0 || img.height <= 0) {
        reject(new Error("Dimensiones de imagen inválidas."));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error("Error al cargar la imagen."));
    img.src = src;
  });
}

export async function compressImageFile(file: File): Promise<string> {
  validateImageFile(file);
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadHtmlImage(dataUrl);

  const canvas = document.createElement("canvas");
  const maxSize = 200;
  canvas.width = maxSize;
  canvas.height = maxSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen.");
  }

  const minSide = Math.min(img.width, img.height);
  const sx = (img.width - minSide) / 2;
  const sy = (img.height - minSide) / 2;

  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function compressProductImage(file: File): Promise<string> {
  validateImageFile(file);
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadHtmlImage(dataUrl);

  const canvas = document.createElement("canvas");
  const maxWidth = 500;
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen.");
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
