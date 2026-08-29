from typing import Optional
from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str
    icono_categoria: str

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    icono_categoria: Optional[str] = None

class CategoriaRead(CategoriaBase):
    id_categoria: int

    class Config:
        from_attributes = True  # Reemplaza a orm_mode en Pydantic v2