import re
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, AliasChoices, field_validator
from app.schemas.detalle_pedido import DetallePedidoRead, DetallePedidoCreate

TAG_REGEX = re.compile(r"<[^>]+>")


def _limpiar_texto(valor: str) -> str:
    return TAG_REGEX.sub("", valor).strip()


# -------------------------------------------------------------------
# 1. Esquema Base: Campos comunes
# -------------------------------------------------------------------
class PedidoBase(BaseModel):
    # Tipo de pago obligatorio (ej. "Efectivo", "Tarjeta")
    tipo_de_pago: str = Field(..., min_length=1, max_length=80)

    @field_validator("tipo_de_pago")
    @classmethod
    def validar_tipo_de_pago(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El tipo de pago no puede estar vacío.")
        return limpio


# -------------------------------------------------------------------
# 2. Creación: Datos exigidos en la petición POST
# -------------------------------------------------------------------
class PedidoCreate(PedidoBase):
    # Estado inicial del pedido (ej. "Pendiente")
    estado_pedido: str = Field(..., min_length=1, max_length=60)

    # Identificador de usuario aceptando tanto 'id_usuarios' como 'id_usuario'
    id_usuarios: int = Field(
        ...,
        gt=0,
        validation_alias=AliasChoices("id_usuarios", "id_usuario"),
    )

    # Acepta la lista tanto bajo la clave 'detalles' como 'detalle'
    detalles: List[DetallePedidoCreate] = Field(
        ...,
        validation_alias=AliasChoices("detalles", "detalle"),
        min_length=1,
    )

    # Fecha opcional asignada en el registro
    fecha: Optional[datetime] = None

    @field_validator("estado_pedido")
    @classmethod
    def validar_estado_pedido(cls, v: str) -> str:
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El estado del pedido no puede estar vacío.")
        return limpio


# -------------------------------------------------------------------
# 3. Edición Parcial: Todos los campos pasan a ser opcionales
# -------------------------------------------------------------------
class PedidoUpdate(BaseModel):
    fecha: Optional[datetime] = None
    estado_pedido: Optional[str] = Field(None, min_length=1, max_length=60)
    tipo_de_pago: Optional[str] = Field(None, min_length=1, max_length=80)
    id_usuarios: Optional[int] = Field(
        None,
        gt=0,
        validation_alias=AliasChoices("id_usuarios", "id_usuario"),
    )

    @field_validator("estado_pedido", "tipo_de_pago")
    @classmethod
    def validar_textos_opcionales(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        limpio = _limpiar_texto(v)
        if not limpio:
            raise ValueError("El campo no puede quedar vacío.")
        return limpio


# -------------------------------------------------------------------
# 4. Lectura: Esquema retornado en las peticiones GET
# -------------------------------------------------------------------
class PedidoRead(PedidoBase):
    # Permite mapear 'id_pedido' o 'id_pedidos' desde PostgreSQL
    id_pedido: int = Field(
        ...,
        gt=0,
        validation_alias=AliasChoices("id_pedido", "id_pedidos"),
    )
    id_pedidos: Optional[int] = None

    # Estado actual del pedido
    estado_pedido: str

    # Usuario asociado al pedido
    id_usuarios: int = Field(
        ...,
        gt=0,
        validation_alias=AliasChoices("id_usuarios", "id_usuario"),
    )

    # Fecha registrada en la base de datos
    fecha: Optional[datetime] = None

    # Lista de ítems anidados del pedido
    detalles: List[DetallePedidoRead] = []

    # Configuración Pydantic v2 para orm y compatibilidad de alias
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )