from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.usuario import _limpiar_texto


class CalificacionCreate(BaseModel):
    puntaje: float = Field(..., ge=1.0, le=5.0)
    comentario: Optional[str] = Field(None, max_length=500)

    @field_validator("comentario")
    @classmethod
    def limpiar_comentario(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return _limpiar_texto(v) or None