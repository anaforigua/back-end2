from typing import Optional
from pydantic import BaseModel

class UsuarioBase(BaseModel):
    nombre: str
    apellidos: str
    avatar: str
    biografía: str
    ubicación: str
    email: str
    calificacion: float
    estado_usuario: str

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

class UsuarioRead(UsuarioBase):
    id_usuarios: int

    class Config:
        from_attributes = True