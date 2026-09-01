from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

# 1. Esquemas anidados para mostrar datos legibles en la lectura
class CategoriaNestedRead(BaseModel):
    nombre_categoria: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

class PaisNestedRead(BaseModel):
    nombre_pais: str  # Ajusta según cómo se llame el campo en tu modelo de país

    class Config:
        from_attributes = True

# 2. Base común con los atributos del producto (sin los IDs aquí)
class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=3, description="El nombre es obligatorio")
    descripcion: str
    precio: float = Field(..., ge=0, description="❌ Precio negativo.")
    imagenes_producto: str = Field(..., min_length=3, description="❌ La imagen del producto es obligatoria")
    condicion_producto: str
    estado_producto: str = Field(..., min_length=4, description="❌ El estado del producto es obligatorio")
    cantidad: int = Field(..., gt=0, description="❌ Cantidad/precio inválido.")
    fecha_publicacion: datetime

    @field_validator('nombre', 'imagenes_producto', 'estado_producto')
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("❌ Campos obligatorios faltantes.")
        return v

# 3. Para CREAR: sí necesita los IDs numéricos para relacionarlos en la BD
class ProductoCreate(ProductoBase):
    id_categoria: int
    id_pais_de_origen: int

# 4. Para ACTUALIZAR: todos opcionales
class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3)
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, ge=0)
    imagenes_producto: Optional[str] = None
    condicion_producto: Optional[str] = None
    estado_producto: Optional[str] = None
    cantidad: Optional[int] = Field(None, gt=0)
    fecha_publicacion: Optional[datetime] = None
    id_categoria: Optional[int] = None
    id_pais_de_origen: Optional[int] = None

# 5. Para LEER (lo que ve el cliente): oculta los IDs y muestra los nombres en texto
class ProductoRead(ProductoBase):
    id_productos: int
    categoria: CategoriaNestedRead
    pais_de_origen: PaisNestedRead

    class Config:
        from_attributes = True