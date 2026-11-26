#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Script de respaldo de PostgreSQL para entornos en la nube (Revenfy)
# Incluye:
#   1. Validacion estricta de variables de entorno
#   2. Generacion de archivo de respaldo con marca de fecha y hora
#   3. Limpieza automatica de respaldos antiguos segun politica de retencion
# ==============================================================================

# 1. Validacion de variables de entorno obligatorias
: "${DATABASE_URL:?Error: la variable de entorno DATABASE_URL no esta definida o esta vacia.}"

# Variables opcionales con valores por defecto seguros
BACKUP_DIR="${BACKUP_DIR:-/tmp/revenfy_backups}"
BACKUP_PREFIX="${BACKUP_PREFIX:-revenfy_backup}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Validar que RETENTION_DAYS sea un numero entero positivo
if ! [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]] || [ "$RETENTION_DAYS" -lt 1 ]; then
    echo "Error: RETENTION_DAYS debe ser un numero entero mayor o igual a 1. Valor actual: '$RETENTION_DAYS'" >&2
    exit 1
fi

# Verificar que pg_dump este disponible en el entorno
if ! command -v pg_dump >/dev/null 2>&1; then
    echo "Error: 'pg_dump' no se encuentra instalado o no esta en el PATH." >&2
    exit 1
fi

# Crear directorio de respaldos si no existe
mkdir -p "$BACKUP_DIR"

# 2. Generacion de respaldo con fecha y hora
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_PREFIX}_${TIMESTAMP}.dump"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Iniciando respaldo de base de datos..."
pg_dump "$DATABASE_URL" \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-privileges \
    --file="$BACKUP_FILE"

# Verificar que el archivo se haya creado y no este vacio
if [ ! -s "$BACKUP_FILE" ]; then
    echo "Error: el archivo de respaldo '$BACKUP_FILE' esta vacio o no se genero." >&2
    exit 1
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Respaldo creado exitosamente: $BACKUP_FILE"

# 3. Limpieza de respaldos antiguos (retencion por antiguedad en dias)
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Limpiando respaldos con mas de ${RETENTION_DAYS} dias de antiguedad en '$BACKUP_DIR'..."
find "$BACKUP_DIR" \
    -maxdepth 1 \
    -type f \
    -name "${BACKUP_PREFIX}_*.dump" \
    -mtime "+${RETENTION_DAYS}" \
    -print -delete

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Proceso de respaldo finalizado."