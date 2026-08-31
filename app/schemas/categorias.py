from typing import Optional
from pydantic import BaseModel, Field, field_validator

class CategoriaBase(BaseModel):
    nombre: str = Field(..., min_length=1, description="El nombre no puede estar vacío")
    descripcion: str
    icono_categoria: str

    @field_validator('nombre')
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("❌ Nombre vacío.")
        return v

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