from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices

# -------------------------------------------------------------------
# Modelos anidados para serializar las relaciones de la base de datos
# -------------------------------------------------------------------
class CategoriaNestedRead(BaseModel):
    # Identificador de la categoría
    id_categoria: Optional[int] = None
    # Nombre de la categoría
    nombre_categoria: Optional[str] = None
    # Descripción opcional
    descripcion: Optional[str] = None

    # Habilita la lectura directa desde objetos ORM de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


class PaisNestedRead(BaseModel):
    # Identificador del país de origen
    id_pais_de_origen: Optional[int] = None
    # Nombre del país
    nombre_pais: Optional[str] = None

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
        min_length=1
    )
    # Descripción requerida
    descripcion: str = Field(..., min_length=1)
    # Precio mayor a cero
    precio: float = Field(..., gt=0)
    # Ruta o URL de las imágenes
    imagenes_producto: Optional[str] = None
    # Condición del producto (ej. Usado / Nuevo)
    condicion_producto: str
    # Estado de la publicación (ej. Disponible)
    estado_producto: str
    # Cantidad disponible en inventario
    cantidad: int = Field(..., ge=0)


# -------------------------------------------------------------------
# 2. Creación: Datos exigidos en la petición POST
# -------------------------------------------------------------------
class ProductoCreate(ProductoBase):
    # Clave foránea de la categoría
    id_categoria: int
    # Clave foránea del país
    id_pais_de_origen: int
    # Fecha opcional enviada en la creación
    fecha_publicacion: Optional[datetime] = None


# -------------------------------------------------------------------
# 3. Actualización Parcial: Campos opcionales para PATCH/PUT
# -------------------------------------------------------------------
class ProductoUpdate(BaseModel):
    nombre_producto: Optional[str] = Field(
        None, 
        validation_alias=AliasChoices("nombre_producto", "nombre")
    )
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    imagenes_producto: Optional[str] = None
    condicion_producto: Optional[str] = None
    estado_producto: Optional[str] = None
    cantidad: Optional[int] = None
    id_categoria: Optional[int] = None
    id_pais_de_origen: Optional[int] = None


# -------------------------------------------------------------------
# 4. Lectura: Esquema retornado en las peticiones GET
# -------------------------------------------------------------------
class ProductoRead(ProductoBase):
    # Mapea 'id_productos' de la BD a 'id_producto' en la respuesta
    id_producto: int = Field(
        ..., 
        validation_alias=AliasChoices("id_producto", "id_productos")
    )
    # Mantener retrocompatibilidad de lectura
    id_productos: Optional[int] = None
    # Fecha de registro asignada por el sistema
    fecha_publicacion: Optional[datetime] = None
    # Identificadores de relaciones
    id_categoria: int
    id_pais_de_origen: int
    
    # Objetos anidados de relaciones
    categoria: Optional[CategoriaNestedRead] = None
    pais_de_origen: Optional[PaisNestedRead] = None

    # Configuración Pydantic v2
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )