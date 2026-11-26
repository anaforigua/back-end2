import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices, field_validator

TAG_REGEX = re.compile(r"<[^>]+>")


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


# -------------------------------------------------------------------
# Modelos anidados para serializar las relaciones de la base de datos
# -------------------------------------------------------------------
class CategoriaNestedRead(BaseModel):
    # Identificador de la categoría
    id_categoria: Optional[int] = Field(None, gt=0)
    # Nombre de la categoría
    nombre_categoria: Optional[str] = Field(None, max_length=120)
    # Descripción opcional
    descripcion: Optional[str] = Field(None, max_length=500)

    # Habilita la lectura directa desde objetos ORM de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


class PaisNestedRead(BaseModel):
    # Identificador del país de origen
    id_pais_de_origen: Optional[int] = Field(None, gt=0)
    # Nombre del país
    nombre_pais: Optional[str] = Field(None, max_length=100)

    # Habilita la lectura directa desde objetos ORM de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------------
# 1. Esquema Base: Acepta tanto 'nombre_producto' como 'nombre'
# -------------------------------------------------------------------
class ProductoBase(BaseModel):
    # Permite recibir 'nombre_producto' o 'nombre' indistintamente
    nombre_producto: str = Field(
        ...,
        validation_alias=AliasChoices("nombre_producto", "nombre"),
        min_length=1,
        max_length=150,
    )
    # Descripción requerida
    descripcion: str = Field(..., min_length=1, max_length=1000)
    # Precio mayor a cero
    precio: float = Field(..., gt=0)
    # Ruta o URL de las imágenes
    imagenes_producto: Optional[str] = Field(None, max_length=500)
    # Condición del producto (ej. Usado / Nuevo)
    condicion_producto: str = Field(..., min_length=1, max_length=60)
    # Estado de la publicación (ej. Disponible)
    estado_producto: str = Field(..., min_length=1, max_length=60)
    # Cantidad disponible en inventario
    cantidad: int = Field(..., ge=0)

    @field_validator(
        "nombre_producto",
        "descripcion",
        "condicion_producto",
        "estado_producto",
    )
    @classmethod
    def validar_campos_texto(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El campo no puede estar vacío.")
        return limpio

    @field_validator("imagenes_producto")
    @classmethod
    def validar_imagenes_producto(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        return limpio if limpio else None


# -------------------------------------------------------------------
# 2. Creación: Datos exigidos en la petición POST
# -------------------------------------------------------------------
class ProductoCreate(ProductoBase):
    # Clave foránea de la categoría
    id_categoria: int = Field(..., gt=0)
    # Clave foránea del país
    id_pais_de_origen: int = Field(..., gt=0)
    # Fecha opcional enviada en la creación
    fecha_publicacion: Optional[datetime] = None


# -------------------------------------------------------------------
# 3. Actualización Parcial: Campos opcionales para PATCH/PUT
# -------------------------------------------------------------------
class ProductoUpdate(BaseModel):
    nombre_producto: Optional[str] = Field(
        None,
        validation_alias=AliasChoices("nombre_producto", "nombre"),
        min_length=1,
        max_length=150,
    )
    descripcion: Optional[str] = Field(None, min_length=1, max_length=1000)
    precio: Optional[float] = Field(None, gt=0)
    imagenes_producto: Optional[str] = Field(None, max_length=500)
    condicion_producto: Optional[str] = Field(None, min_length=1, max_length=60)
    estado_producto: Optional[str] = Field(None, min_length=1, max_length=60)
    cantidad: Optional[int] = Field(None, ge=0)
    id_categoria: Optional[int] = Field(None, gt=0)
    id_pais_de_origen: Optional[int] = Field(None, gt=0)

    @field_validator(
        "nombre_producto",
        "descripcion",
        "condicion_producto",
        "estado_producto",
    )
    @classmethod
    def validar_textos_opcionales(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El campo no puede quedar vacío.")
        return limpio

    @field_validator("imagenes_producto")
    @classmethod
    def validar_imagenes_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        return limpio if limpio else None


# -------------------------------------------------------------------
# 4. Lectura: Esquema retornado en las peticiones GET
# -------------------------------------------------------------------
class ProductoRead(ProductoBase):
    # Mapea 'id_productos' de la BD a 'id_producto' en la respuesta
    id_producto: int = Field(
        ...,
        gt=0,
        validation_alias=AliasChoices("id_producto", "id_productos"),
    )
    # Mantener retrocompatibilidad de lectura
    id_productos: Optional[int] = Field(None, gt=0)
    # Fecha de registro asignada por el sistema
    fecha_publicacion: Optional[datetime] = None
    # Identificadores de relaciones
    id_categoria: int = Field(..., gt=0)
    id_pais_de_origen: int = Field(..., gt=0)

    # Objetos anidados de relaciones
    categoria: Optional[CategoriaNestedRead] = None
    pais_de_origen: Optional[PaisNestedRead] = None

    # Configuración Pydantic v2
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )