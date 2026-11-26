import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

TAG_REGEX = re.compile(r"<[^>]+>")
URL_SEGURA_REGEX = re.compile(r"^https?://[^\s<>\"']+$", re.IGNORECASE)


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


def _validar_url_base(valor: str) -> str:
    limpio = _limpiar_texto(valor)
    if not limpio or not URL_SEGURA_REGEX.match(limpio):
        raise ValueError("La URL base debe iniciar con http:// o https:// y ser válida.")
    return limpio


class RedSocialBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=80)
    url_base: str = Field(..., min_length=8, max_length=255)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El nombre de la red social no puede estar vacío.")
        return limpio

    @field_validator("url_base")
    @classmethod
    def validar_url(cls, v: str) -> str:
        return _validar_url_base(v)


class RedSocialCreate(RedSocialBase):
    pass


class RedSocialUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=80)
    url_base: Optional[str] = Field(None, min_length=8, max_length=255)

    @field_validator("nombre")
    @classmethod
    def validar_nombre_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El nombre de la red social no puede quedar vacío.")
        return limpio

    @field_validator("url_base")
    @classmethod
    def validar_url_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return _validar_url_base(v)


class RedSocialRead(RedSocialBase):
    id_red_social: int

    class Config:
        from_attributes = True