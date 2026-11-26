import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

TAG_REGEX = re.compile(r"<[^>]+>")


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


# Esquema ligero para mostrar los datos del rol anidados
class RolInfoRead(BaseModel):
    id_rol: int = Field(..., gt=0)
    nombre_rol: str = Field(..., min_length=1, max_length=60)
    descripcion: Optional[str] = Field(None, max_length=255)

    @field_validator("nombre_rol")
    @classmethod
    def validar_nombre_rol(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El nombre del rol no puede estar vacío.")
        return limpio

    @field_validator("descripcion")
    @classmethod
    def validar_descripcion(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        return limpio if limpio else None

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
    id_rol_usuario: int = Field(..., gt=0)
    # Muestra automáticamente la información detallada del rol al consultar
    rol: Optional[RolInfoRead] = None

    class Config:
        from_attributes = True

