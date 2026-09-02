from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class PedidoModel(Base):
    __tablename__ = "pedidos"

    id_pedidos = Column(Integer, primary_key=True, index=True, autoincrement=True)
    estado_pedido = Column(String(50), nullable=False, default="PENDIENTE")
    tipo_de_pago = Column(String(50), nullable=False)
    id_usuarios = Column(Integer, ForeignKey("usuario.id_usuarios"), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    usuario = relationship("UsuarioModel", back_populates="pedidos")
    detalles = relationship("DetallePedidoModel", back_populates="pedido", cascade="all, delete-orphan")