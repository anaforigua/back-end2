from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CategoriaNestedRead(BaseModel):
    nombre_categoria: Optional[str] = None
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

class PaisNestedRead(BaseModel):
    nombre_pais: Optional[str] = None

    class Config:
        from_attributes = True

class ProductoBase(BaseModel):
    nombre_producto: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    imagenes_producto: Optional[str] = None
    condicion_producto: Optional[str] = None
    estado_producto: Optional[str] = None
    cantidad: Optional[int] = None
    fecha_publicacion: Optional[datetime] = None

class ProductoCreate(ProductoBase):
    id_categoria: int
    id_pais_de_origen: int

class ProductoUpdate(ProductoBase):
    pass

class ProductoRead(ProductoBase):
    id_productos: Optional[int] = None
    id_producto: Optional[int] = None
    categoria: Optional[CategoriaNestedRead] = None
    pais_de_origen: Optional[PaisNestedRead] = None

    class Config:
        from_attributes = True