from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ProductoModel(Base):
    __tablename__ = "productos"

    id_productos = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    precio = Column(Float, nullable=False)
    imagenes_producto = Column(String, nullable=False)
    condicion_producto = Column(String, nullable=False)
    estado_producto = Column(String, nullable=False)
    cantidad = Column(Integer, nullable=False)
    fecha_publicacion = Column(DateTime, nullable=False, default=datetime.utcnow)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=False)
    id_pais_de_origen = Column(Integer, nullable=False)

    categoria = relationship("CategoriaModel", back_populates="productos")
    detalles_pedido = relationship("DetallePedidoModel", back_populates="producto")