from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class PedidoModel(Base):
    __tablename__ = "pedidos"

    id_pedidos = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    estado_pedido = Column(
        String(50),
        nullable=False,
        default="PENDIENTE"
    )

    tipo_de_pago = Column(
        String(50),
        nullable=False
    )

    # Nuevo campo para almacenar el total
    total = Column(
        Float,
        nullable=False,
        default=0.0
    )

    id_usuarios = Column(
        Integer,
        ForeignKey("usuario.id_usuarios"),
        nullable=False
    )

    fecha = Column(
        DateTime,
        default=lambda: datetime.now(
            timezone.utc
        ).replace(tzinfo=None)
    )

    usuario = relationship(
        "UsuarioModel",
        back_populates="pedidos"
    )

    detalles = relationship(
        "DetallePedidoModel",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )