import re
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict

TAG_REGEX = re.compile(r"<[^>]+>")
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
URL_SEGURA_REGEX = re.compile(r"^https?://[^\s<>\"']+$", re.IGNORECASE)


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


def _validar_email(valor: str) -> str:
    limpio = _limpiar_texto(valor).lower()
    if not limpio or not EMAIL_REGEX.match(limpio):
        raise ValueError("El correo electrónico no tiene un formato válido.")
    return limpio


def _validar_avatar(valor: str) -> str:
    limpio = _limpiar_texto(valor)
    if not limpio:
        raise ValueError("El avatar no puede estar vacío.")
    if limpio.startswith(("http://", "https://")) and not URL_SEGURA_REGEX.match(limpio):
        raise ValueError("La URL del avatar no es válida.")
    return limpio


class RolResumenRead(BaseModel):
    id_rol: int = Field(..., gt=0)
    nombre_rol: str = Field(..., min_length=1, max_length=60)

    model_config = ConfigDict(from_attributes=True)


class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    apellidos: str = Field(..., min_length=3, max_length=100)
    avatar: str = Field(..., min_length=1, max_length=500)
    biografia: str = Field(..., max_length=500)
    ubicacion: str = Field(..., min_length=1, max_length=150)
    email: str = Field(..., min_length=5, max_length=180)
    contrasena: str = Field(..., min_length=6, max_length=72)
    calificacion: Optional[float] = Field(None, ge=0.0, le=5.0)
    estado_usuario: str = Field(..., min_length=1, max_length=50)
    id_roles: List[int]

    @field_validator("nombre", "apellidos", "ubicacion", "estado_usuario")
    @classmethod
    def validar_textos_obligatorios(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El campo no puede estar vacío.")
        return limpio

    @field_validator("biografia")
    @classmethod
    def validar_biografia(cls, v: str) -> str:
        return _limpiar_texto(v)

    @field_validator("avatar")
    @classmethod
    def validar_avatar_campo(cls, v: str) -> str:
        return _validar_avatar(v)

    @field_validator("email")
    @classmethod
    def validar_email_campo(cls, v: str) -> str:
        return _validar_email(v)

    @field_validator("id_roles")
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
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    apellidos: Optional[str] = Field(None, min_length=3, max_length=100)
    avatar: Optional[str] = Field(None, min_length=1, max_length=500)
    biografia: Optional[str] = Field(None, max_length=500)
    ubicacion: Optional[str] = Field(None, min_length=1, max_length=150)
    email: Optional[str] = Field(None, min_length=5, max_length=180)
    contrasena: Optional[str] = Field(None, min_length=6, max_length=72)
    calificacion: Optional[float] = Field(None, ge=0.0, le=5.0)
    estado_usuario: Optional[str] = Field(None, min_length=1, max_length=50)
    id_roles: Optional[List[int]] = None

    @field_validator("nombre", "apellidos", "ubicacion", "estado_usuario")
    @classmethod
    def validar_textos_opcionales(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El campo no puede quedar vacío.")
        return limpio

    @field_validator("biografia")
    @classmethod
    def validar_biografia_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return _limpiar_texto(v)

    @field_validator("avatar")
    @classmethod
    def validar_avatar_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return _validar_avatar(v)

    @field_validator("email")
    @classmethod
    def validar_email_opcional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return _validar_email(v)

    @field_validator("id_roles")
    @classmethod
    def validar_roles_opcionales(cls, v: Optional[List[int]]) -> Optional[List[int]]:
        if v is None:
            return v
        roles_permitidos = {2, 3}
        if not v:
            raise ValueError("El usuario debe tener al menos un rol.")
        for rol_id in set(v):
            if rol_id not in roles_permitidos:
                raise ValueError("Solo puedes elegir entre el rol 2, el rol 3 o ambos.")
        return v


class UsuarioRead(BaseModel):
    id_usuarios: int = Field(..., gt=0)
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


## Clase del login de un usuario
class UsuarioLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=180)
    contrasena: str = Field(..., min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def validar_email_login(cls, v: str) -> str:
        return _validar_email(v)