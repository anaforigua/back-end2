from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DetallePedidoModel(Base):
    __tablename__ = "detalle_pedido"
    __table_args__ = {'extend_existing': True}

    detalle_pedido = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cantidad = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)
    id_pedidos = Column(Integer, ForeignKey("pedidos.id_pedidos"), nullable=False)
    id_productos = Column(Integer, ForeignKey("productos.id_productos"), nullable=False)

    pedido = relationship("PedidoModel", back_populates="detalles")
    producto = relationship("ProductoModel")