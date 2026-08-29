from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PedidoModel(Base):
    __tablename__ = "pedidos"

    id_pedido = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow)
    estado_pedido = Column(String, nullable=False)
    tipo_de_pago = Column(String, nullable=False)
    id_usuarios = Column(Integer, ForeignKey("usuario.id_usuarios"), nullable=False)

    usuario = relationship("UsuarioModel", back_populates="pedidos")
    detalles_pedido = relationship("DetallePedidoModel", back_populates="pedido")