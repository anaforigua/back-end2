from typing import Optional
from pydantic import BaseModel, Field, field_validator

class RolResumenRead(BaseModel):
    id_rol: int
    nombre_rol: str

    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=1, description="El nombre no puede estar vacío")
    apellidos: str = Field(..., min_length=1, description="Los apellidos no pueden estar vacíos")
    avatar: str
    biografía: str
    ubicación: str
    email: str = Field(..., description="Correo electrónico obligatorio")
    calificacion: float
    estado_usuario: str
    id_rol: int

    # Validador para asegurar que el correo tenga un formato válido básico
    @field_validator('email')
    @classmethod
    def validar_email(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Correo inválido")
        return v

    # Validador opcional para evitar espacios en blanco vacíos en nombres
    @field_validator('nombre', 'apellidos')
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo no puede estar vacío")
        return v

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    avatar: Optional[str] = None
    biografía: Optional[str] = None
    ubicación: Optional[str] = None
    email: Optional[str] = None
    calificacion: Optional[float] = None
    estado_usuario: Optional[str] = None
    id_rol: Optional[int] = None

class UsuarioRead(UsuarioBase):
    id_usuarios: int
    rol: Optional[RolResumenRead] = None

    class Config:
        from_attributes = True