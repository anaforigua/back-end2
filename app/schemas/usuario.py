from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

class RolResumenRead(BaseModel):
    id_rol: int
    nombre_rol: str

    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=3, description="El nombre no puede estar vacío")
    apellidos: str = Field(..., min_length=3, description="Los apellidos no pueden estar vacíos")
    avatar: str
    biografía: str
    ubicación: str
    email: str = Field(..., description="Correo electrónico obligatorio")
    calificacion: float
    estado_usuario: str
    id_roles: List[int]

    @field_validator('id_roles')
    @classmethod
    def validar_roles_permitidos(cls, v: List[int]) -> List[int]:
        roles_permitidos = {2, 3}
        if not v:
            raise ValueError("El usuario debe tener al menos un rol (comprador o vendedor).")
        for rol_id in v:
            if rol_id not in roles_permitidos:
                raise ValueError("Solo puedes elegir entre el rol 2 (Comprador), el rol 3 (Vendedor) o ambos.")
        return v

    @field_validator('email')
    @classmethod
    def validar_email(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Correo inválido")
        return v

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
    id_roles: Optional[List[int]] = None

    @field_validator('id_roles')
    @classmethod
    def validar_roles_permitidos(cls, v: Optional[List[int]]) -> Optional[List[int]]:
        if v is not None:
            roles_permitidos = {2, 3}
            if not v:
                raise ValueError("El usuario debe tener al menos un rol (comprador o vendedor).")
            for rol_id in v:
                if rol_id not in roles_permitidos:
                    raise ValueError("Solo puedes elegir entre el rol 2 (Comprador), el rol 3 (Vendedor) o ambos.")
        return v

class UsuarioRead(BaseModel):
    id_usuarios: int
    nombre: str
    apellidos: str
    avatar: str
    biografía: str
    ubicación: str
    email: str
    calificacion: float
    estado_usuario: str
    roles: List[RolResumenRead] = []

    class Config:
        from_attributes = True