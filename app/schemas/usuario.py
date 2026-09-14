from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict

class RolResumenRead(BaseModel):
    id_rol: int
    nombre_rol: str

    model_config = ConfigDict(from_attributes=True)

class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=3)
    apellidos: str = Field(..., min_length=3)
    avatar: str
    biografia: str
    ubicacion: str
    email: str
    contrasena: str = Field(..., min_length=6)
    calificacion: float
    estado_usuario: str
    id_roles: List[int]

    @field_validator('id_roles')
    @classmethod
    def validar_roles_permitidos(cls, v: List[int]) -> List[int]:
        roles_permitidos = {2, 3}
        if not v:
            raise ValueError("El usuario debe tener al menos un rol.")
        
        # Valida que cada rol enviado esté dentro de los permitidos (2, 3 o ambos)
        for rol_id in set(v):
            if rol_id not in roles_permitidos:
                raise ValueError("Solo puedes elegir entre el rol 2, el rol 3 o ambos.")
        return v

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    avatar: Optional[str] = None
    biografia: Optional[str] = None
    ubicacion: Optional[str] = None
    email: Optional[str] = None
    contrasena: Optional[str] = None
    calificacion: Optional[float] = None
    estado_usuario: Optional[str] = None
    id_roles: Optional[List[int]] = None

class UsuarioRead(BaseModel):
    id_usuarios: int
    nombre: str
    apellidos: str
    avatar: str
    biografia: str
    ubicacion: str
    email: str
    calificacion: float
    estado_usuario: str
    roles: List[RolResumenRead] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)