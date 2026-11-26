import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

TAG_REGEX = re.compile(r"<[^>]+>")


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


class RolBase(BaseModel):
    nombre_rol: str = Field(..., min_length=2, max_length=60)
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


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    nombre_rol: Optional[str] = Field(None, min_length=2, max_length=60)
    descripcion: Optional[str] = Field(None, max_length=255)

    @field_validator("nombre_rol")
    @classmethod
    def validar_nombre_rol_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El nombre del rol no puede quedar vacío.")
        return limpio

    @field_validator("descripcion")
    @classmethod
    def validar_descripcion_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        return limpio if limpio else None


class RolRead(RolBase):
    id_rol: int

    class Config:
        from_attributes = True