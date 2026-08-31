from typing import Optional
from pydantic import BaseModel, Field

# Esquema ligero para mostrar los datos del rol anidados
class RolInfoRead(BaseModel):
    id_rol: int
    nombre_rol: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

class RolUsuarioBase(BaseModel):
    id_usuario: int = Field(..., gt=0, description="❌ El ID del usuario es obligatorio y válido")
    id_rol: int = Field(..., gt=0, description="❌ El ID del rol es obligatorio y válido")

class RolUsuarioCreate(RolUsuarioBase):
    pass

class RolUsuarioUpdate(BaseModel):
    id_usuario: Optional[int] = Field(None, gt=0)
    id_rol: Optional[int] = Field(None, gt=0)

class RolUsuarioRead(RolUsuarioBase):
    id_rol_usuario: int
    # Muestra automáticamente la información detallada del rol al consultar
    rol: Optional[RolInfoRead] = None  

    class Config:
        from_attributes = True