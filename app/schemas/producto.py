from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=3, description="El nombre es obligatorio")
    descripcion: str
    precio: float = Field(..., ge=0, description="❌ Precio negativo.")
    imagenes_producto: str = Field(..., min_length=1, description="❌ La imagen del producto es obligatoria")
    condicion_producto: str
    estado_producto: str = Field(..., min_length=1, description="❌ El estado del producto es obligatorio")
    cantidad: int = Field(..., gt=0, description="❌ Cantidad/precio inválido.")
    fecha_publicacion: datetime
    id_categoria: int
    id_pais_de_origen: int

    # Validador para asegurar que estos campos obligatorios no vayan vacíos o con espacios en blanco
    @field_validator('nombre', 'imagenes_producto', 'estado_producto')
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("❌ Campos obligatorios faltantes.")
        return v

class ProductoCreate(ProductoBase):
    pass

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

class ProductoRead(ProductoBase):
    id_productos: int

    class Config:
        from_attributes = True