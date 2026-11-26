import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

TAG_REGEX = re.compile(r"<[^>]+>")


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


class PaisDeOrigenBase(BaseModel):
    nombre_pais: str = Field(..., min_length=2, max_length=100)

    @field_validator("nombre_pais")
    @classmethod
    def validar_nombre_pais(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El nombre del país no puede estar vacío.")
        return limpio


class PaisDeOrigenCreate(PaisDeOrigenBase):
    pass


class PaisDeOrigenUpdate(BaseModel):
    nombre_pais: Optional[str] = Field(None, min_length=2, max_length=100)

    @field_validator("nombre_pais")
    @classmethod
    def validar_nombre_pais_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El nombre del país no puede quedar vacío.")
        return limpio


class PaisDeOrigenRead(PaisDeOrigenBase):
    id_pais_de_origen: int

    class Config:
        from_attributes = True