from typing import Optional
from pydantic import BaseModel, Field, field_validator

class CategoriaBase(BaseModel):
    nombre_categoria: str = Field(..., min_length=4, description="El nombre no puede estar vacío")
    descripcion: str
    icono_categoria: str

    @field_validator('nombre_categoria')
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("❌ Nombre vacío.")
        return v

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre_categoria: Optional[str] = None
    descripcion: Optional[str] = None
    icono_categoria: Optional[str] = None

    @field_validator('nombre_categoria')
    @classmethod
    def validar_no_vacio(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("❌ Nombre vacío.")
        return v

class CategoriaRead(CategoriaBase):
    class Config:
        from_attributes = True