from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    imagenes_producto: str
    condicion_producto: str
    estado_producto: str
    cantidad: int
    fecha_publicacion: datetime
    id_categoria: int
    id_pais_de_origen: int

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    imagenes_producto: Optional[str] = None
    condicion_producto: Optional[str] = None
    estado_producto: Optional[str] = None
    cantidad: Optional[int] = None
    fecha_publicacion: Optional[datetime] = None
    id_categoria: Optional[int] = None
    id_pais_de_origen: Optional[int] = None

class ProductoRead(ProductoBase):
    id_productos: int

    class Config:
        from_attributes = True