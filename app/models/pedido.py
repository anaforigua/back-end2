from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class PedidoModel(Base):
    __tablename__ = "pedidos"
    __table_args__ = {'extend_existing': True}

    id_pedidos = Column(Integer, primary_key=True, index=True)
    estado_pedido = Column(String)
    tipo_de_pago = Column(String)
    id_usuarios = Column(Integer, ForeignKey("usuario.id_usuarios")) # Apunta a la tabla 'usuario'

    # Relación con Usuario
    usuario = relationship("UsuarioModel", back_populates="pedidos")

    # Relación para traer los detalles del pedido
    detalles = relationship("DetallePedidoModel", back_populates="pedido", cascade="all, delete-orphan")

